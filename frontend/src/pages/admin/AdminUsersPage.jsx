import React, { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle,
  Eye,
  RefreshCcw,
  Search,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const roleOptions = [
  ["all", "Tất cả vai trò"],
  ["admin", "Admin"],
  ["business", "Doanh nghiệp"],
  ["investor", "Nhà đầu tư"],
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.name || u.full_name || u.fullname || "";
      const email = u.email || "";

      const matchKeyword =
        name.toLowerCase().includes(keyword.toLowerCase()) ||
        email.toLowerCase().includes(keyword.toLowerCase());

      const matchRole = role === "all" || u.role === role;

      return matchKeyword && matchRole;
    });
  }, [users, keyword, role]);

  const updateUser = async (id, payload) => {
    try {
      await api.put(`/admin/users/${id}`, payload);
      await fetchUsers();
      alert("Cập nhật người dùng thành công");
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      alert(error.response?.data?.message || "Lỗi cập nhật user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      await fetchUsers();
      alert("Xóa người dùng thành công");
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      alert(error.response?.data?.message || "Lỗi xóa user");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Quản lý người dùng"
        right={
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng người dùng" value={users.length} />
        <StatCard
          label="Doanh nghiệp"
          value={users.filter((u) => u.role === "business").length}
        />
        <StatCard
          label="Nhà đầu tư"
          value={users.filter((u) => u.role === "investor").length}
        />
        <StatCard
          label="Bị khóa"
          value={
            users.filter(
              (u) => u.is_active === false || u.status === "banned"
            ).length
          }
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {roleOptions.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Tổ chức</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="pr-5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-white/45">
                    Không có người dùng phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const id = user._id || user.id;
                  const isActive =
                    user.is_active !== false && user.status !== "banned";

                  return (
                    <tr key={id} className="border-t border-white/10 text-sm">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-300">
                            <UserCog className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="font-semibold text-white">
                              {user.name ||
                                user.full_name ||
                                user.fullname ||
                                "Người dùng"}
                            </div>
                            <div className="text-white/40">
                              ID: {String(id).slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="text-white/70">{user.email || "—"}</td>

                      <td>
                        <select
                          value={user.role || "investor"}
                          onChange={(e) =>
                            updateUser(id, { role: e.target.value })
                          }
                          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="business">Doanh nghiệp</option>
                          <option value="investor">Nhà đầu tư</option>
                        </select>
                      </td>

                      <td className="text-white/70">
                        {user.organization_name ||
                          user.organization ||
                          "Chưa có"}
                      </td>

                      <td>
                        <StatusBadge active={isActive} />
                      </td>

                      <td className="text-white/60">
                        {user.createdAt || user.created_at
                          ? new Date(
                              user.createdAt || user.created_at
                            ).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="pr-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isActive ? (
                            <button
                              onClick={() =>
                                updateUser(id, {
                                  is_active: false,
                                  status: "banned",
                                })
                              }
                              className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-2 text-yellow-300 hover:bg-yellow-500/20"
                              title="Khóa tài khoản"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updateUser(id, {
                                  is_active: true,
                                  status: "active",
                                })
                              }
                              className="rounded-xl bg-green-500 p-2 text-slate-950 hover:bg-green-400"
                              title="Mở khóa"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(id)}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-white/50">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </Card>
  );
}

function StatusBadge({ active }) {
  return active ? (
    <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
      Hoạt động
    </span>
  ) : (
    <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300">
      Bị khóa
    </span>
  );
}

function UserDetailModal({ user, onClose }) {
  const isActive = user.is_active !== false && user.status !== "banned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Chi tiết người dùng</p>
            <h2 className="mt-1 text-2xl font-bold">
              {user.name || user.full_name || user.fullname || "Người dùng"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 text-green-300">
            <Shield className="h-9 w-9" />
          </div>

          <div>
            <p className="text-lg font-semibold">{user.email}</p>
            <p className="mt-1 text-white/50">
              Vai trò: {user.role || "investor"} •{" "}
              {isActive ? "Hoạt động" : "Bị khóa"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Số điện thoại" value={user.phone || "Chưa có"} />
          <Info
            label="Tổ chức"
            value={user.organization_name || user.organization || "Chưa có"}
          />
          <Info label="Địa chỉ" value={user.address || "Chưa có"} />
          <Info
            label="Xác minh"
            value={user.is_verified ? "Đã xác minh" : "Chưa xác minh"}
          />
          <Info
            label="Ngày tạo"
            value={
              user.createdAt || user.created_at
                ? new Date(user.createdAt || user.created_at).toLocaleString(
                    "vi-VN"
                  )
                : "Không rõ"
            }
          />
          <Info
            label="Đăng nhập gần nhất"
            value={
              user.last_login_at
                ? new Date(user.last_login_at).toLocaleString("vi-VN")
                : "Chưa có"
            }
          />
        </div>

        {user.bio && (
          <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
            <p className="mb-2 text-sm text-white/45">Giới thiệu</p>
            <p className="leading-7 text-white/75">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}