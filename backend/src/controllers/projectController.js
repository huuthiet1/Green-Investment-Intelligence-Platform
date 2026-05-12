const db = require("../config/db");

exports.getMyProjects = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        pc.category_name,
        l.province_name,
        ps.status_name
      FROM projects p
      LEFT JOIN project_categories pc ON p.category_id = pc.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN project_statuses ps ON p.status_id = ps.id
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
      `,
      [ownerId]
    );

    res.json({ projects: rows });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách dự án" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM projects WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    res.json({ project: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết dự án" });
  }
};

exports.createProject = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const data = req.body;

    const [result] = await db.query(
      `
      INSERT INTO projects (
        owner_id,
        category_id,
        location_id,
        status_id,
        project_code,
        title,
        slug,
        short_description,
        description,
        capital_needed,
        capital_currency,
        roi_expected,
        risk_level,
        project_duration_months,
        carbon_reduction_est,
        jobs_created_est
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ownerId,
        data.category_id,
        data.location_id || null,
        data.status_id || 1,
        data.project_code,
        data.title,
        data.slug,
        data.short_description || null,
        data.description,
        data.capital_needed,
        data.capital_currency || "VND",
        data.roi_expected || null,
        data.risk_level || "medium",
        data.project_duration_months || null,
        data.carbon_reduction_est || null,
        data.jobs_created_est || null,
      ]
    );

    res.status(201).json({
      message: "Tạo dự án thành công",
      projectId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi tạo dự án" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const data = req.body;

    const [result] = await db.query(
      `
      UPDATE projects
      SET
        category_id = ?,
        location_id = ?,
        status_id = ?,
        project_code = ?,
        title = ?,
        slug = ?,
        short_description = ?,
        description = ?,
        capital_needed = ?,
        capital_currency = ?,
        roi_expected = ?,
        risk_level = ?,
        project_duration_months = ?,
        carbon_reduction_est = ?,
        jobs_created_est = ?
      WHERE id = ? AND owner_id = ?
      `,
      [
        data.category_id,
        data.location_id || null,
        data.status_id || 1,
        data.project_code,
        data.title,
        data.slug,
        data.short_description || null,
        data.description,
        data.capital_needed,
        data.capital_currency || "VND",
        data.roi_expected || null,
        data.risk_level || "medium",
        data.project_duration_months || null,
        data.carbon_reduction_est || null,
        data.jobs_created_est || null,
        id,
        ownerId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy dự án để cập nhật" });
    }

    res.json({ message: "Cập nhật dự án thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật dự án" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM projects WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy dự án để xóa" });
    }

    res.json({ message: "Xóa dự án thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa dự án" });
  }
};