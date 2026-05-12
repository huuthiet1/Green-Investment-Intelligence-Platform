import Project from "../models/Project.js";
import InvestorInterest from "../models/InvestorInterest.js";

function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(1)} tỷ`;
  }

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(0)} triệu`;
  }

  return number.toLocaleString("vi-VN");
}

export const getOverview = async (req, res) => {
  try {
    const businessId = req.user._id || req.user.id;

    const projects = await Project.find({ owner_id: businessId });

    const projectIds = projects.map((project) => project._id);

    const interests = await InvestorInterest.find({
      project_id: { $in: projectIds },
    });

    const totalCapital = projects.reduce(
      (sum, project) => sum + Number(project.capital_needed || 0),
      0
    );

    res.json({
      stats: {
        totalProjects: projects.length,
        totalViews: projects.reduce(
          (sum, project) => sum + Number(project.views || 0),
          0
        ),
        totalInvestors: interests.length,
        totalCapital: formatMoney(totalCapital),
      },
      summary: [
        {
          id: 1,
          label: "Dự án chờ duyệt",
          value: projects.filter((project) => project.status === "pending").length,
        },
        {
          id: 2,
          label: "Dự án đã duyệt",
          value: projects.filter((project) => project.status === "approved").length,
        },
        {
          id: 3,
          label: "Nhà đầu tư quan tâm",
          value: interests.length,
        },
      ],
      projects: projects.map((project) => ({
        id: project._id,
        name: project.title,
        views: project.views || 0,
        investors: interests.filter(
          (interest) => String(interest.project_id) === String(project._id)
        ).length,
        status: project.status || "pending",
        capital: formatMoney(project.capital_needed),
      })),
      activities: [
        {
          id: 1,
          content: "Dữ liệu dashboard đã được tải từ hệ thống.",
          time: "Vừa xong",
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy dữ liệu dashboard doanh nghiệp",
      error: error.message,
    });
  }
};