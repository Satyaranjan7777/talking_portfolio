import React from "react";
import { useSocket } from "../../context/SocketContext";

export default function AdminToastContainer() {
  const { notifications, dismissNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto p-4 rounded-xl bg-[#0d0d0d]/95 text-white backdrop-blur shadow-2xl border border-white/10 flex items-start justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold leading-snug">
                {notif.message}
              </div>
              <div className="font-mono text-[10px] text-neutral-400 mt-0.5">
                Realtime update • {notif.time}
              </div>
            </div>
          </div>

          <button
            onClick={() => dismissNotification(notif.id)}
            className="text-neutral-400 hover:text-white text-xs px-1.5"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
