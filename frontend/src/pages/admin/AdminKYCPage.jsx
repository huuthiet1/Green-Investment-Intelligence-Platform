import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileCheck,
  RefreshCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const statusOptions = [
  ["all", "Tất cả"],
  ["pending", "Chờ duyệt"],
  ["reviewing", "Đang xem xét"],
  ["approved", "Đã xác minh"],
  ["rejected", "Từ chối"],
];

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await api.get("/kyc");
      setKycs(res.data.kycs || []);
    } catch (error) {
      console.error("FETCH KYC ERROR:", error);
      alert(error.response?.data?.message || "Không tải được KYC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const filteredKycs = useMemo(() => {
    return kycs.filter((item) => {
      const text = `${item.full_name || ""} ${item.email || ""} ${
        item.organization_name || ""
      } ${item.tax_code || ""}`.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchStatus = status === "all" || item.status === status;

      return matchKeyword && matchStatus;
    });
  }, [kycs, keyword, status]);

  const reviewKyc = async (item, nextStatus, note = "") => {
    try {
      await api.put(`/kyc/${item._id}/review`, {
        status: nextStatus,
        admin_note: note || adminNote,
        reviewed_by: "admin-demo",
      });

      alert("Cập nhật KYC thành công");
      setSelectedKyc(null);
      setAdminNote("");
      fetchKyc();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật KYC");
    }
  };

  const deleteKyc = async (id) => {
    if (!window.confirm("Xóa hồ sơ KYC này?")) return;

    try {
      await api.delete(`/kyc/${id}`);
      fetchKyc();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa KYC");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải hồ sơ KYC...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="KYC Verification"
        right={
          <button
            onClick={fetchKyc}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng hồ sơ" value={kycs.length} />
        <StatCard
          label="Chờ duyệt"
          value={kycs.filter((k) => k.status === "pending").length}
        />
        <StatCard
          label="Đã xác minh"
          value={kycs.filter((k) => k.status === "approved").length}
        />
        <StatCard
          label="Từ chối"
          value={kycs.filter((k) => k.status === "rejected").length}
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, email, tổ chức, mã số thuế..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Người gửi</th>
                <th>Vai trò</th>
                <th>Tổ chức</th>
                <th>Loại tài liệu</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th className="pr-5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredKycs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-white/45">
                    Không có hồ sơ KYC phù hợp
                  </td>
                </tr>
              ) : (
                filteredKycs.map((item) => (
                  <tr key={item._id} className="border-t border-white/10 text-sm">
                    <td className="p-5">
                      <div className="font-semibold text-white">
                        {item.full_name}
                      </div>
                      <div className="mt-1 text-white/40">
                        {item.email || item.user_id?.email || "Không có email"}
                      </div>
                    </td>

                    <td className="text-white/70">
                      {item.user_role === "business"
                        ? "Doanh nghiệp"
                        : "Nhà đầu tư"}
                    </td>

                    <td className="text-white/70">
                      {item.organization_name || "Chưa có"}
                    </td>

                    <td className="text-white/70">
                      {translateDocType(item.document_type)}
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="text-white/60">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>

                    <td className="pr-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedKyc(item);
                            setAdminNote(item.admin_note || "");
                          }}
                          className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            reviewKyc(
                              item,
                              "approved",
                              "Hồ sơ hợp lệ, đã xác minh."
                            )
                          }
                          className="rounded-xl bg-green-500 p-2 text-slate-950 hover:bg-green-400"
                          title="Duyệt"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            reviewKyc(
                              item,
                              "rejected",
                              "Hồ sơ chưa đạt yêu cầu xác minh."
                            )
                          }
                          className="rounded-xl bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30"
                          title="Từ chối"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => deleteKyc(item._id)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                          title="Xóa"
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

      {selectedKyc && (
        <KycDetailModal
          item={selectedKyc}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          onClose={() => {
            setSelectedKyc(null);
            setAdminNote("");
          }}
          onReview={(nextStatus) => reviewKyc(selectedKyc, nextStatus)}
        />
      )}
    </div>
  );
}

function KycDetailModal({
  item,
  adminNote,
  setAdminNote,
  onClose,
  onReview,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Chi tiết KYC</p>
            <h2 className="mt-1 text-2xl font-bold">{item.full_name}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-3xl bg-slate-900/70 p-5">
          <div className="rounded-2xl bg-green-500/10 p-4 text-green-300">
            <FileCheck className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">{item.organization_name || "Cá nhân"}</h3>
            <p className="text-sm text-white/50">
              {item.email || item.user_id?.email || "Không có email"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Vai trò" value={item.user_role} />
          <Info label="Mã số thuế" value={item.tax_code || "Chưa có"} />
          <Info label="Loại tài liệu" value={translateDocType(item.document_type)} />
          <Info label="Trạng thái" value={item.status} />
          <Info
            label="Ngày gửi"
            value={
              item.createdAt
                ? new Date(item.createdAt).toLocaleString("vi-VN")
                : "Không rõ"
            }
          />
          <Info
            label="Ngày duyệt"
            value={
              item.reviewed_at
                ? new Date(item.reviewed_at).toLocaleString("vi-VN")
                : "Chưa duyệt"
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">Ghi chú người gửi</p>
          <p className="whitespace-pre-wrap text-white/70">
            {item.note || "Không có ghi chú"}
          </p>
        </div>

        {item.document_url && (
          <a
            href={`http://localhost:5001${item.document_url}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-400"
          >
            Xem tài liệu KYC
          </a>
        )}

        <div className="mt-5">
          <label className="text-sm text-white/60">Ghi chú admin</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={4}
            placeholder="Nhập lý do duyệt hoặc từ chối..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onReview("rejected")}
            className="rounded-2xl bg-red-500/20 px-5 py-3 font-medium text-red-300 hover:bg-red-500/30"
          >
            Từ chối
          </button>

          <button
            onClick={() => onReview("reviewing")}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-400"
          >
            Đang xem xét
          </button>

          <button
            onClick={() => onReview("approved")}
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            Xác minh
          </button>
        </div>
      </div>
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

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-500/10 text-yellow-300",
    reviewing: "bg-blue-500/10 text-blue-300",
    approved: "bg-green-500/10 text-green-300",
    rejected: "bg-red-500/10 text-red-300",
  };

  const labels = {
    pending: "Chờ duyệt",
    reviewing: "Đang xem xét",
    approved: "Đã xác minh",
    rejected: "Từ chối",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${colors[status]}`}>
      {labels[status] || status}
    </span>
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

function translateDocType(type) {
  const map = {
    cccd: "CCCD / CMND",
    business_license: "Giấy phép kinh doanh",
    tax_certificate: "Mã số thuế",
    investment_license: "Giấy phép đầu tư",
    other: "Khác",
  };

  return map[type] || type;
}