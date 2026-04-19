import axios from "axios";

export async function sendZaloAdminLoginAlert({
  adminName,
  loginTimeText,
  ipAddress,
}) {
  const zaloAccessToken = process.env.ZALO_OA_ACCESS_TOKEN;
  const zaloPhone = process.env.ZALO_ADMIN_PHONE;
  const templateId = process.env.ZALO_TEMPLATE_ID;

  if (!zaloAccessToken || !zaloPhone || !templateId) {
    console.warn("Zalo alert skipped: missing Zalo env config");
    return;
  }

  try {
    await axios.post(
      "https://business.openapi.zalo.me/message/template",
      {
        phone: zaloPhone,
        template_id: templateId,
        template_data: {
          admin_name: adminName,
          login_time: loginTimeText,
          ip_address: ipAddress || "unknown",
        },
        tracking_id: `admin-login-${Date.now()}`,
      },
      {
        headers: {
          access_token: zaloAccessToken,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Zalo alert failed:",
      error.response?.data || error.message
    );
  }
}