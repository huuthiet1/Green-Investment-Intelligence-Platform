import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../lib/axios";
import socket from "../lib/socket";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data.notifications || []);
    setUnread(res.data.unread || 0);
  };

  useEffect(() => {
    fetchNotifications();

    socket.on("new_notification", fetchNotifications);

    return () => {
      socket.off("new_notification", fetchNotifications);
    };
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-2xl border border-white/10 bg-white/5 p-3"
      >
        <Bell className="h-5 w-5" />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 text-xs text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Thông báo</h3>
            <button onClick={markAllRead} className="text-sm text-green-400">
              Đọc tất cả
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-white/50">Chưa có thông báo</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`rounded-2xl p-4 ${
                    n.is_read ? "bg-white/5" : "bg-green-500/10"
                  }`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-sm text-white/55">{n.content}</p>
                  <p className="mt-2 text-xs text-white/35">
                    {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}