import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const initialForm = {
  key: "",
  value: "",
  group: "general",
  description: "",
};

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [keyword, setKeyword] = useState("");
  const [group, setGroup] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/system/settings");
      setSettings(res.data.settings || []);
    } catch (error) {
      console.error("FETCH SETTINGS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được cấu hình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const groups = useMemo(() => {
    return ["all", ...new Set(settings.map((s) => s.group || "general"))];
  }, [settings]);

  const filteredSettings = useMemo(() => {
    return settings.filter((item) => {
      const text = `${item.key || ""} ${item.group || ""} ${
        item.description || ""
      } ${JSON.stringify(item.value || "")}`.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchGroup = group === "all" || item.group === group;

      return matchKeyword && matchGroup;
    });
  }, [settings, keyword, group]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseValue = (value) => {
    if (value === "true") return true;
    if (value === "false") return false;

    const numberValue = Number(value);
    if (!Number.isNaN(numberValue) && value.trim() !== "") {
      return numberValue;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.key.trim()) {
      alert("Vui lòng nhập key cấu hình");
      return;
    }

    try {
      await api.post("/system/settings", {
        key: form.key.trim(),
        value: parseValue(form.value),
        group: form.group || "general",
        description: form.description,
      });

      alert("Lưu cấu hình thành công");
      setForm(initialForm);
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi lưu cấu hình");
    }
  };

  const handleEdit = (setting) => {
    setForm({
      key: setting.key || "",
      value:
        typeof setting.value === "object"
          ? JSON.stringify(setting.value, null, 2)
          : String(setting.value ?? ""),
      group: setting.group || "general",
      description: setting.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa cấu hình này?")) return;

    try {
      await api.delete(`/system/settings/${id}`);
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa cấu hình");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải cài đặt hệ thống...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="System Settings"
        right={
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng cấu hình" value={settings.length} />
        <StatCard
          label="General"
          value={settings.filter((s) => s.group === "general").length}
        />
        <StatCard
          label="Project"
          value={settings.filter((s) => s.group === "project").length}
        />
        <StatCard
          label="ESG"
          value={settings.filter((s) => s.group === "esg").length}
        />
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <Settings className="h-5 w-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">
            Thêm / cập nhật cấu hình
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Key"
            name="key"
            value={form.key}
            onChange={handleChange}
            placeholder="VD: platform_name"
          />

          <Input
            label="Group"
            name="group"
            value={form.group}
            onChange={handleChange}
            placeholder="VD: general, project, esg"
          />

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Value</label>
            <textarea
              name="value"
              value={form.value}
              onChange={handleChange}
              rows={4}
              placeholder='VD: Green Investment Platform hoặc {"maxUploadSize":10}'
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả ý nghĩa cấu hình..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="flex justify-end md:col-span-2">
            <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400">
              <Plus className="h-4 w-4" />
              Lưu cấu hình
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm cấu hình..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === "all" ? "Tất cả nhóm" : g}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Key</th>
                <th>Group</th>
                <th>Value</th>
                <th>Mô tả</th>
                <th className="pr-5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredSettings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-white/45">
                    Không có cấu hình phù hợp
                  </td>
                </tr>
              ) : (
                filteredSettings.map((item) => (
                  <tr key={item._id} className="border-t border-white/10 text-sm">
                    <td className="p-5 font-semibold text-white">{item.key}</td>
                    <td>
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">
                        {item.group || "general"}
                      </span>
                    </td>
                    <td className="max-w-[320px] truncate text-white/70">
                      {typeof item.value === "object"
                        ? JSON.stringify(item.value)
                        : String(item.value)}
                    </td>
                    <td className="max-w-[320px] truncate text-white/60">
                      {item.description || "—"}
                    </td>
                    <td className="pr-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-green-400"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
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

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
      />
    </div>
  );
}