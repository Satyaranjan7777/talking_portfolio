#!/usr/bin/env python3
"""
build-hero-assets.py
Processes the intro video into a seamless looping hero video (mp4 + webm)
and extracts portrait-bust.webp and og.jpg.
"""

import os
import sys
import subprocess
import numpy as np

# Find ffmpeg binary
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
WORKSPACE_ROOT = os.path.abspath(os.path.join(PROJECT_ROOT, ".."))

FFMPEG_NODE = os.path.join(PROJECT_ROOT, "node_modules", "ffmpeg-static", "ffmpeg.exe")
if os.path.exists(FFMPEG_NODE):
    FFMPEG = FFMPEG_NODE
else:
    FFMPEG = "ffmpeg"

def run_cmd(cmd):
    print("Running:", " ".join(cmd) if isinstance(cmd, list) else cmd)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("ERROR:", res.stderr)
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def get_duration(input_file):
    cmd = [
        FFMPEG, "-i", input_file,
        "-f", "null", "-"
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h)*3600 + float(m)*60 + float(s)
    return 10.0

def process_audio_loop(input_file, out_wav, loop_duration, fade_duration):
    """
    Extracts audio to raw PCM, cross-fades the last fade_duration into the first fade_duration
    using numpy, and exports a clean wav for muxing.
    """
    sample_rate = 48000
    channels = 2
    raw_pcm = os.path.join(PROJECT_ROOT, "public", "temp_audio.raw")
    
    # 1. Export uncompressed raw PCM
    cmd = [
        FFMPEG, "-y", "-i", input_file,
        "-t", str(loop_duration + fade_duration),
        "-f", "f32le", "-ar", str(sample_rate), "-ac", str(channels),
        raw_pcm
    ]
    run_cmd(cmd)
    
    # 2. Read with numpy
    data = np.fromfile(raw_pcm, dtype=np.float32)
    total_samples = len(data) // channels
    data = data.reshape((total_samples, channels))
    
    fade_samples = int(fade_duration * sample_rate)
    loop_samples = int(loop_duration * sample_rate)
    
    # Check if we have enough samples
    if total_samples < loop_samples + fade_samples:
        fade_samples = min(fade_samples, total_samples - loop_samples)
    
    # The tail that needs to crossfade into the start
    tail = data[loop_samples : loop_samples + fade_samples]
    head = data[:fade_samples]
    
    # Linear crossfade curve
    alpha = np.linspace(0.0, 1.0, len(tail))[:, np.newaxis]
    blended = head * alpha + tail * (1.0 - alpha)
    
    out_data = data[:loop_samples].copy()
    out_data[:len(blended)] = blended
    
    # Write blended PCM
    blended_pcm = os.path.join(PROJECT_ROOT, "public", "blended_audio.raw")
    out_data.astype(np.float32).tofile(blended_pcm)
    
    # 3. Convert blended raw to wav
    cmd = [
        FFMPEG, "-y",
        "-f", "f32le", "-ar", str(sample_rate), "-ac", str(channels),
        "-i", blended_pcm,
        "-c:a", "pcm_s16le",
        out_wav
    ]
    run_cmd(cmd)
    
    # Cleanup temp raw files
    if os.path.exists(raw_pcm):
        os.remove(raw_pcm)
    if os.path.exists(blended_pcm):
        os.remove(blended_pcm)

def main():
    input_video = None
    # Check possible video locations
    candidates = [
        os.path.join(WORKSPACE_ROOT, "resources", "Developer_introducing_himself_on…_1080p_20261019164746.mp4"),
        os.path.join(PROJECT_ROOT, "resources", "Developer_introducing_himself_on…_1080p_20261019164746.mp4"),
    ]
    for c in candidates:
        if os.path.exists(c):
            input_video = c
            break

    if not input_video:
        # Search workspace
        for root, _, files in os.walk(WORKSPACE_ROOT):
            for f in files:
                if f.endswith(".mp4") and "intro" in f.lower() or "developer" in f.lower():
                    input_video = os.path.join(root, f)
                    break
            if input_video:
                break

    if not input_video or not os.path.exists(input_video):
        print("ERROR: Could not find intro video!")
        sys.exit(1)

    print(f"Found input video: {input_video}")

    public_dir = os.path.join(PROJECT_ROOT, "public")
    hero_dir = os.path.join(public_dir, "hero")
    os.makedirs(hero_dir, exist_ok=True)

    total_duration = get_duration(input_video)
    fade_duration = 0.5
    clip_len = min(10.0, total_duration)
    loop_duration = clip_len - fade_duration
    print(f"Total duration: {total_duration:.2f}s, Loop duration: {loop_duration:.2f}s, Fade: {fade_duration}s")

    # Audio seamless loop
    temp_wav = os.path.join(public_dir, "temp_loop_audio.wav")
    process_audio_loop(input_video, temp_wav, loop_duration, fade_duration)
    print("Audio loop rendered successfully.")

    # Video filter:
    # 1. Crop 800:1000:560:40 to center character
    # 2. Scale to 768:960
    # 3. Whiten background: colorlevels=rimax=0.98:gimax=0.98:bimax=0.98
    # 4. Crossfade tail into head using xfade
    crop_filter = "crop=800:1000:560:40,scale=768:960,colorlevels=rimax=0.98:gimax=0.98:bimax=0.98,setsar=1"
    
    # Filtergraph for seamless video loop:
    # Split input into Part A (0 to loop_duration) and Part B (loop_duration to loop_duration + fade_duration)
    # Then crossfade Part B into the head of Part A!
    # Specifically:
    # [0:v]trim=0:loop_dur+fade_dur,setpts=PTS-STARTPTS[v0];
    # [v0]split[vA][vB_pre];
    # [vA]trim=0:loop_dur,setpts=PTS-STARTPTS[base];
    # [vB_pre]trim=loop_dur:loop_dur+fade_dur,setpts=PTS-STARTPTS[tail];
    # [tail][base]xfade=transition=fade:duration=0.5:offset=0[outv]
    # Wait, in xfade: first input plays, then transitions to second input at offset.
    # If tail is 0.5s long, and offset is 0, tail transitions into base from t=0 to 0.5,
    # giving total output length 0.5 + 9.5 - 0.5 = 9.5s!
    filter_complex = (
        f"[0:v]{crop_filter},trim=0:{clip_len},setpts=PTS-STARTPTS[vpre];"
        f"[vpre]split[va][vb];"
        f"[va]trim=0:{loop_duration},setpts=PTS-STARTPTS[base];"
        f"[vb]trim={loop_duration}:{clip_len},setpts=PTS-STARTPTS[tail];"
        f"[tail][base]xfade=transition=fade:duration={fade_duration}:offset=0[vlooped]"
    )

    mp4_out = os.path.join(hero_dir, "hero.mp4")
    webm_out = os.path.join(hero_dir, "hero.webm")

    # Render hero.mp4
    print("Encoding hero.mp4...")
    cmd_mp4 = [
        FFMPEG, "-y",
        "-i", input_video,
        "-i", temp_wav,
        "-filter_complex", filter_complex,
        "-map", "[vlooped]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "24",
        "-preset", "slow",
        "-c:a", "aac",
        "-b:a", "96k",
        "-movflags", "+faststart",
        "-t", str(loop_duration),
        mp4_out
    ]
    run_cmd(cmd_mp4)
    print(f"Exported: {mp4_out}")

    # Render hero.webm
    print("Encoding hero.webm...")
    cmd_webm = [
        FFMPEG, "-y",
        "-i", input_video,
        "-i", temp_wav,
        "-filter_complex", filter_complex,
        "-map", "[vlooped]",
        "-map", "1:a",
        "-c:v", "libvpx-vp9",
        "-crf", "36",
        "-b:v", "0",
        "-c:a", "libopus",
        "-b:a", "80k",
        "-t", str(loop_duration),
        webm_out
    ]
    run_cmd(cmd_webm)
    print(f"Exported: {webm_out}")

    # Clean up temp wav
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

    # 5. Extract portrait still: head-to-shirt crop at 480x600 -> portrait-bust.webp
    portrait_out = os.path.join(public_dir, "portrait-bust.webp")
    print("Extracting portrait-bust.webp...")
    # Head-to-shirt is approx y=50 to 550, centered around x=960 -> width 480, height 600, x=720, y=50
    cmd_portrait = [
        FFMPEG, "-y",
        "-ss", "00:00:02",
        "-i", input_video,
        "-vf", "crop=480:600:720:50,colorlevels=rimax=0.98:gimax=0.98:bimax=0.98",
        "-vframes", "1",
        "-c:v", "libwebp",
        "-quality", "90",
        portrait_out
    ]
    run_cmd(cmd_portrait)
    print(f"Exported: {portrait_out}")

    # Also export og.jpg at 1200x630
    og_out = os.path.join(public_dir, "og.jpg")
    print("Extracting og.jpg...")
    cmd_og = [
        FFMPEG, "-y",
        "-ss", "00:00:02",
        "-i", input_video,
        "-vf", "crop=1200:630:360:100,colorlevels=rimax=0.98:gimax=0.98:bimax=0.98",
        "-vframes", "1",
        "-q:v", "2",
        og_out
    ]
    run_cmd(cmd_og)
    print(f"Exported: {og_out}")

    print("Hero assets pipeline finished successfully!")

if __name__ == "__main__":
    main()
