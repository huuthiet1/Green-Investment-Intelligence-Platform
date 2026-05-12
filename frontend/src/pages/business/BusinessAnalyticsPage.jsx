import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

export default function BusinessAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/business").then((res) => setData(res.data));
  }, []);

  if (!data) {
    return <div className="text-white/70">Đang tải thống kê...</div>;
  }

  const { summary, fundingChart, esgChart } = data;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Analytics"
        title="Thống kê hiệu quả doanh nghiệp"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <Stat title="Dự án" value={summary.totalProjects} />
        <Stat
          title="Vốn cần gọi"
          value={`${Number(summary.totalCapital).toLocaleString("vi-VN")} VND`}
        />
        <Stat
          title="Đã huy động"
          value={`${Number(summary.totalRaised).toLocaleString("vi-VN")} VND`}
        />
        <Stat title="Nhà đầu tư" value={summary.totalInvestors} />
        <Stat title="ESG TB" value={summary.avgESG} />
      </div>

      <Card className="p-6">
        <h3 className="mb-5 text-xl font-semibold">Tiến độ gọi vốn</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="target" name="Mục tiêu" />
              <Bar dataKey="raised" name="Đã huy động" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-5 text-xl font-semibold">Xu hướng ESG</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={esgChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="E" />
              <Line type="monotone" dataKey="S" />
              <Line type="monotone" dataKey="G" />
              <Line type="monotone" dataKey="total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-2 text-2xl font-bold">{value}</h3>
    </Card>
  );
}