import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import api from "../lib/axios";
import socket from "../lib/socket";

export default function AdminNotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (error) {
      console.error("FETCH NOTIFICATIONS ERROR:", error);
    }
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

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#050B18] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <h3 className="font-semibold text-white">Thông báo admin</h3>
              <p className="text-sm text-white/45">{unread} chưa đọc</p>
            </div>

            <button
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-green-400"
            >
              <CheckCheck className="h-4 w-4" />
              Đọc hết
            </button>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/45">
                Chưa có thông báo
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`mb-3 rounded-2xl border border-white/10 p-4 ${
                    item.is_read ? "bg-white/5" : "bg-green-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-white/60">
                        {item.content}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                          {item.type || "system"}
                        </span>

                        <span className="text-xs text-white/35">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteNotification(item._id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}