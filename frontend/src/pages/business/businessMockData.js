export const fallbackBusinessData = {
  stats: { totalProjects: 4, totalViews: 126, totalInvestors: 18, totalCapital: "32 tỷ" },
  summary: [
    { id: 1, label: "Dự án chờ duyệt", value: 1 },
    { id: 2, label: "Vòng gọi vốn mở", value: 2 },
    { id: 3, label: "Tài liệu đã tải", value: 14 },
  ],
  projects: [
    { id: 1, name: "Solar Rooftop Bình Dương", views: 52, investors: 8, status: "approved", capital: "15 tỷ", risk: "low", esg: 86 },
    { id: 2, name: "Trang trại hữu cơ Đà Lạt", views: 31, investors: 4, status: "pending", capital: "9 tỷ", risk: "medium", esg: 78 },
    { id: 3, name: "Dự án xe điện logistics", views: 43, investors: 6, status: "open", capital: "8 tỷ", risk: "medium", esg: 82 },
  ],
  fundingRounds: [
    { id: 1, project: "Solar Rooftop Bình Dương", round: "Seed", target: "15 tỷ", raised: "9.5 tỷ", progress: 63, status: "open" },
    { id: 2, project: "Trang trại hữu cơ Đà Lạt", round: "Pre-seed", target: "9 tỷ", raised: "2.1 tỷ", progress: 23, status: "upcoming" },
    { id: 3, project: "Dự án xe điện logistics", round: "Series A", target: "8 tỷ", raised: "6.2 tỷ", progress: 78, status: "open" },
  ],
  investors: [
    { id: 1, name: "Nguyễn Minh Anh", budget: "3 tỷ", project: "Solar Rooftop Bình Dương", status: "negotiating" },
    { id: 2, name: "Green Future Capital", budget: "5 tỷ", project: "Dự án xe điện logistics", status: "contacted" },
    { id: 3, name: "Trần Quốc Bảo", budget: "1.5 tỷ", project: "Trang trại hữu cơ Đà Lạt", status: "interested" },
  ],
  esg: [
    { id: 1, project: "Solar Rooftop Bình Dương", e: 90, s: 82, g: 86, total: 86, level: "excellent" },
    { id: 2, project: "Trang trại hữu cơ Đà Lạt", e: 84, s: 78, g: 72, total: 78, level: "good" },
    { id: 3, project: "Dự án xe điện logistics", e: 86, s: 80, g: 80, total: 82, level: "good" },
  ],
  reports: [
    { id: 1, title: "Thiếu tài liệu pháp lý", target: "Trang trại hữu cơ Đà Lạt", status: "reviewing", createdAt: "Hôm nay" },
    { id: 2, title: "Cập nhật tiến độ gọi vốn", target: "Solar Rooftop Bình Dương", status: "resolved", createdAt: "Hôm qua" },
  ],
  activities: [
    { id: 1, content: "Dự án Solar Rooftop nhận thêm 1 nhà đầu tư quan tâm.", time: "20 phút trước" },
    { id: 2, content: "Bạn vừa cập nhật hồ sơ ESG cho dự án hữu cơ Đà Lạt.", time: "2 giờ trước" },
    { id: 3, content: "Admin đã duyệt vòng gọi vốn mới của dự án logistics.", time: "Hôm nay" },
  ],
};
