import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { admin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [latestVersions, setLatestVersions] = useState({});

  useEffect(() => {
    // Only establish real-time websocket when admin is logged in
    if (!admin) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = io(API_BASE, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });


    s.on("connect", () => {
      console.log("[Socket.io Admin] Connected successfully:", s.id);
      setConnected(true);
    });

    s.on("disconnect", () => {
      console.log("[Socket.io Admin] Disconnected");
      setConnected(false);
    });

    // Handle remote section publish event
    s.on("content:published", ({ key, version }) => {
      console.log(`[Socket.io Admin] content:published received for ${key} v${version}`);
      setLatestVersions((prev) => ({ ...prev, [key]: version }));

      const notif = {
        id: Date.now() + Math.random(),
        type: "published",
        key,
        version,
        message: `Section '${key}' was published to live site (v${version})`,
        time: new Date().toLocaleTimeString(),
      };

      setNotifications((prev) => [notif, ...prev.slice(0, 4)]);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 8000);
    });

    // Handle remote draft updated event
    s.on("content:draft_updated", ({ key, status }) => {
      console.log(`[Socket.io Admin] draft updated for ${key}`);
      const notif = {
        id: Date.now() + Math.random(),
        type: "draft",
        key,
        message: `A draft edit was saved on section '${key}'`,
        time: new Date().toLocaleTimeString(),
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 4)]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 6000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        dismissNotification,
        latestVersions,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      connected: false,
      notifications: [],
      dismissNotification: () => {},
      latestVersions: {},
    };
  }
  return context;
}
