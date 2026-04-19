import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Globe,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getGoogleUrl() {
  const baseURL =
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api";

  return `${baseURL}/auth/google`;
}

function redirectByRole(navigate, role) {
  if (role === "admin") {
    navigate("/admin", { replace: true });
  } else if (role === "investor") {
    navigate("/investor", { replace: true });
  } else if (role === "business") {
    navigate("/business", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_30%)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 ring-1 ring-green-400/30">
                <Leaf className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">
                  Green Investment Intelligence Platform
                </p>
                <h1 className="text-lg font-semibold">
                  Nền tảng kết nối đầu tư dự án xanh
                </h1>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <p className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-300">
                Bảo mật nhiều lớp cho doanh nghiệp và nhà đầu tư
              </p>
              <h2 className="mt-6 text-5xl font-bold leading-tight">
                Kết nối đầu tư xanh trên một nền tảng hiện đại.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/70">
                Đăng nhập hoặc tạo tài khoản để khám phá dự án, theo dõi ESG,
                kết nối nhà đầu tư và quản lý dự án xanh một cách minh bạch,
                an toàn và hiệu quả.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["ESG", "Đánh giá minh bạch"],
              ["OTP", "Đăng nhập linh hoạt"],
              ["24/7", "Theo dõi bảo mật"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <div className="text-2xl font-bold text-green-400">{value}</div>
                <div className="mt-2 text-sm text-white/65">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-8 lg:hidden">
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/15 ring-1 ring-green-400/30">
                  <Leaf className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Green Investment</p>
                  <h1 className="font-semibold">Dự án xanh</h1>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-white/65">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 text-sm text-white/65">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  rightSlot,
  maxLength,
}) {
  return (
    <div className="flex items-center rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 transition focus-within:border-green-400/40">
      {Icon ? <Icon className="mr-3 h-5 w-5 text-white/45" /> : null}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
      />
      {rightSlot}
    </div>
  );
}

function MessageBox({ type = "error", children }) {
  const styles =
    type === "success"
      ? "border-green-500/20 bg-green-500/10 text-green-300"
      : "border-red-500/20 bg-red-500/10 text-red-300";

  return (
    <p className={cn("mb-4 rounded-xl border px-4 py-3 text-sm", styles)}>
      {children}
    </p>
  );
}

function TabButton({ active, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-green-500 text-slate-950"
          : "bg-slate-900/70 text-white hover:bg-white/10"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    email: "",
    password: "",
  });

  const [otpForm, setOtpForm] = useState({
    email: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    api
      .get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        login({
          token,
          user: res.data.user,
        });

        window.history.replaceState({}, document.title, "/login");
        redirectByRole(navigate, res.data.user?.role);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setErrorMessage("Đăng nhập Google thất bại.");
      });
  }, [login, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");

    if (googleToken) return;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      redirectByRole(navigate, user.role);
    }
  }, [navigate]);

  useEffect(() => {
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCountdown]);

  const isOtpComplete = useMemo(() => /^\d{6}$/.test(otpForm.otp), [otpForm.otp]);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    clearMessages();
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;

    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setOtpForm((prev) => ({ ...prev, otp: numericValue }));
    } else {
      setOtpForm((prev) => ({ ...prev, email: value }));
    }

    clearMessages();
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!passwordForm.email.trim()) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!passwordForm.password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoadingPassword(true);
      clearMessages();

      const res = await api.post("/auth/login", {
        email: passwordForm.email.trim(),
        password: passwordForm.password,
      });

      login(res.data);
      redirectByRole(navigate, res.data.user?.role);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpForm.email.trim()) {
      setErrorMessage("Vui lòng nhập email để nhận mã OTP.");
      return;
    }

    try {
      setLoadingSendOtp(true);
      clearMessages();

      await api.post("/auth/send-otp", {
        email: otpForm.email.trim(),
      });

      setOtpSent(true);
      setOtpCountdown(60);
      setSuccessMessage("Mã OTP đã được gửi về email của bạn.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gửi OTP thất bại.");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otpForm.email.trim()) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!isOtpComplete) {
      setErrorMessage("Vui lòng nhập đúng mã OTP 6 số.");
      return;
    }

    try {
      setLoadingVerifyOtp(true);
      clearMessages();

      const res = await api.post("/auth/verify-otp-login", {
        email: otpForm.email.trim(),
        otp: otpForm.otp,
      });

      login(res.data);
      redirectByRole(navigate, res.data.user?.role);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Xác thực OTP thất bại."
      );
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const handleGoogleLogin = () => {
    clearMessages();
    setLoadingGoogle(true);
    window.location.href = getGoogleUrl();
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng quay lại. Chọn phương thức đăng nhập phù hợp với bạn."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-3 gap-2">
        <TabButton
          active={mode === "password"}
          icon={Lock}
          onClick={() => {
            setMode("password");
            clearMessages();
          }}
        >
          Mật khẩu
        </TabButton>

        <TabButton
          active={mode === "otp"}
          icon={KeyRound}
          onClick={() => {
            setMode("otp");
            clearMessages();
          }}
        >
          OTP
        </TabButton>

        <TabButton
          active={mode === "google"}
          icon={Globe}
          onClick={() => {
            setMode("google");
            clearMessages();
          }}
        >
          Google
        </TabButton>
      </div>

      {successMessage ? (
        <MessageBox type="success">{successMessage}</MessageBox>
      ) : null}

      {errorMessage ? <MessageBox>{errorMessage}</MessageBox> : null}

      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <InputField
            icon={Mail}
            name="email"
            type="email"
            placeholder="Email"
            value={passwordForm.email}
            onChange={handlePasswordChange}
          />

          <InputField
            icon={Lock}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={passwordForm.password}
            onChange={handlePasswordChange}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-white/45 transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full rounded-2xl bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-60"
          >
            {loadingPassword ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      ) : null}

      {mode === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <InputField
            icon={Mail}
            name="email"
            type="email"
            placeholder="Nhập email để nhận OTP"
            value={otpForm.email}
            onChange={handleOtpChange}
          />

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loadingSendOtp || otpCountdown > 0}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {loadingSendOtp
              ? "Đang gửi..."
              : otpCountdown > 0
              ? `Gửi lại sau ${otpCountdown}s`
              : "Gửi mã OTP"}
          </button>

          <InputField
            icon={KeyRound}
            name="otp"
            type="text"
            placeholder="Nhập mã OTP 6 số"
            value={otpForm.otp}
            onChange={handleOtpChange}
            maxLength={6}
          />

          <p className="text-xs text-white/50">
            Mã OTP gồm 6 chữ số và được gửi qua email.
          </p>

          <button
            type="submit"
            disabled={loadingVerifyOtp || !otpSent}
            className="w-full rounded-2xl bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-60"
          >
            {loadingVerifyOtp ? "Đang xác thực..." : "Đăng nhập bằng OTP"}
          </button>
        </form>
      ) : null}

      {mode === "google" ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
          >
            <Globe className="h-5 w-5" />
            {loadingGoogle ? "Đang chuyển hướng..." : "Đăng nhập bằng Google"}
          </button>

          <p className="text-sm text-white/55">
            Khi bấm nút này, bạn sẽ được chuyển sang Google để xác thực tài
            khoản.
          </p>
        </div>
      ) : null}
    </AuthShell>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization_name: "",
    password: "",
    role: "investor",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      redirectByRole(navigate, user.role);
    }
  }, [navigate]);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!form.password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const res = await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization_name: form.organization_name.trim(),
        password: form.password,
        role: form.role,
      });

      login(res.data);
      setSuccessMessage("Tạo tài khoản thành công.");
      redirectByRole(navigate, res.data.user?.role);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Tạo tài khoản để tham gia nền tảng kết nối đầu tư dự án xanh."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      {successMessage ? (
        <MessageBox type="success">{successMessage}</MessageBox>
      ) : null}

      {errorMessage ? <MessageBox>{errorMessage}</MessageBox> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={User}
          name="full_name"
          placeholder="Họ và tên"
          value={form.full_name}
          onChange={handleChange}
        />

        <InputField
          icon={Mail}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <InputField
          icon={Phone}
          name="phone"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={handleChange}
        />

        <InputField
          icon={Building2}
          name="organization_name"
          placeholder="Tên tổ chức / doanh nghiệp"
          value={form.organization_name}
          onChange={handleChange}
        />

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-transparent text-white outline-none"
          >
            <option value="investor" className="bg-slate-900">
              Nhà đầu tư
            </option>
            <option value="business" className="bg-slate-900">
              Doanh nghiệp
            </option>
          </select>
        </div>

        <InputField
          icon={Lock}
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-white/45 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-green-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:opacity-60"
        >
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>
    </AuthShell>
  );
}