import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Send,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorFundingPage() {
  const [rounds, setRounds] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [roundRes, investmentRes] = await Promise.allSettled([
        api.get("/funding"),
        api.get("/investments"),
      ]);

      if (roundRes.status === "fulfilled") {
        setRounds(roundRes.value.data.rounds || []);
      }

      if (investmentRes.status === "fulfilled") {
        setInvestments(investmentRes.value.data.investments || []);
      }
    } catch (error) {
      console.error("FETCH INVESTOR FUNDING ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRounds = useMemo(() => {
    return rounds.filter((r) =>
      ["open", "upcoming"].includes(r.status || "open")
    );
  }, [rounds]);

  const totalInvested = useMemo(() => {
    return investments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [investments]);

  const submitInvestment = async (e) => {
    e.preventDefault();

    if (!selectedRound) {
      alert("Vui lòng chọn vòng gọi vốn");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Vui lòng nhập số tiền góp vốn");
      return;
    }

    const projectId =
      selectedRound.project_id?._id || selectedRound.project_id;

    try {
      await api.post("/investments", {
        project_id: projectId,
        funding_round_id: selectedRound._id,
        amount: Number(form.amount),
        note: form.note,
      });

      alert("Đã gửi đề nghị góp vốn");
      setSelectedRound(null);
      setForm({ amount: "", note: "" });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi góp vốn");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải dữ liệu góp vốn...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Investor"
        title="Góp vốn đầu tư"
        right={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Vòng gọi vốn khả dụng" value={openRounds.length} />
        <StatCard label="Đề nghị đã gửi" value={investments.length} />
        <StatCard label="Tổng đề nghị" value={formatMoney(totalInvested)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Vòng gọi vốn đang mở
            </h3>
          </div>

          <div className="space-y-4">
            {openRounds.length === 0 ? (
              <Empty text="Chưa có vòng gọi vốn khả dụng" />
            ) : (
              openRounds.map((round) => (
                <FundingRoundCard
                  key={round._id}
                  round={round}
                  active={selectedRound?._id === round._id}
                  onSelect={() => setSelectedRound(round)}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Gửi đề nghị góp vốn
            </h3>
          </div>

          {selectedRound ? (
            <form onSubmit={submitInvestment} className="space-y-4">
              <div className="rounded-2xl bg-slate-900/70 p-5">
                <p className="text-sm text-white/45">Vòng đã chọn</p>
                <h4 className="mt-1 font-semibold text-white">
                  {selectedRound.round_name || "Vòng gọi vốn"}
                </h4>
                <p className="mt-2 text-sm text-white/50">
                  {selectedRound.project_id?.title || "Dự án"}
                </p>
              </div>

              <div>
                <label className="text-sm text-white/60">
                  Số tiền góp vốn
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="VD: 500000000"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-white/60">Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Ghi chú điều kiện đầu tư..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                />
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400">
                <Send className="h-4 w-4" />
                Gửi đề nghị
              </button>
            </form>
          ) : (
            <Empty text="Chọn một vòng gọi vốn để gửi đề nghị" />
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-5 text-xl font-semibold text-white">
          Lịch sử đề nghị góp vốn
        </h3>

        <div className="space-y-3">
          {investments.length === 0 ? (
            <Empty text="Chưa có đề nghị góp vốn" />
          ) : (
            investments.map((item) => (
              <div
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900/70 p-5"
              >
                <div>
                  <p className="font-semibold text-white">
                    {item.project_id?.title || "Dự án"}
                  </p>
                  <p className="mt-1 text-sm text-white/45">
                    {item.funding_round_id?.round_name || "Vòng gọi vốn"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-300">
                    {formatMoney(item.amount)}
                  </p>
                  <p className="mt-1 text-sm text-white/45">
                    {item.status || "pending"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function FundingRoundCard({ round, active, onSelect }) {
  const target = Number(round.target_amount || 0);
  const raised = Number(round.raised_amount || 0);
  const percent =
    target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        active
          ? "border-green-400 bg-green-500/10"
          : "border-white/10 bg-slate-900/70 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">
            {round.round_name || "Vòng gọi vốn"}
          </h4>
          <p className="mt-1 text-sm text-white/45">
            {round.project_id?.title || "Dự án"}
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
          {round.status || "open"}
        </span>
      </div>

      <div className="mt-4 text-sm text-white/55">
        {formatMoney(raised)} / {formatMoney(target)}
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-green-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-right text-sm text-white/45">{percent}%</p>
    </button>
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

function Empty({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-8 text-center text-white/45">
      {text}
    </div>
  );
}

function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)} triệu`;
  }

  return `${number.toLocaleString("vi-VN")}đ`;
}