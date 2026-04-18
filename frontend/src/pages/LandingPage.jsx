import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Leaf,
  LineChart,
  MessageCircle,
  Users,
  Lock,
  BadgeCheck,
  Bell,
  Search,
  Building2,
  Wallet,
  Star,
} from "lucide-react";

const CONTENT = {
  brand: {
    en: "Green Investment Intelligence Platform",
    vi: "Nền tảng kết nối đầu tư dự án xanh",
  },
  hero: {
    badge: "Kết nối doanh nghiệp xanh với nhà đầu tư minh bạch và an toàn",
    title: (
      <>
        Gọi vốn cho <span className="text-green-400">dự án xanh</span>
        <br />
        bằng dữ liệu, ESG và bảo mật nâng cao.
      </>
    ),
    description:
      "Nền tảng hỗ trợ doanh nghiệp đăng tải dự án, nhà đầu tư tìm kiếm cơ hội phù hợp và quản trị viên giám sát hệ thống với xác thực nhiều lớp, cảnh báo Zalo và audit log.",
  },
  stats: [
    { value: "3", label: "Nhóm người dùng chính" },
    { value: "16+", label: "Phân hệ chức năng" },
    { value: "ESG", label: "Trung tâm đánh giá" },
    { value: "24/7", label: "Theo dõi bảo mật" },
  ],
  features: [
    {
      icon: Leaf,
      title: "Đăng tải dự án xanh",
      desc: "Doanh nghiệp có thể giới thiệu dự án, mục tiêu vốn, tài liệu và vòng gọi vốn trên một nền tảng tập trung.",
    },
    {
      icon: Search,
      title: "Tìm kiếm đầu tư thông minh",
      desc: "Nhà đầu tư lọc dự án theo lĩnh vực, địa điểm, vốn, mức rủi ro và điểm ESG.",
    },
    {
      icon: LineChart,
      title: "Đánh giá ESG",
      desc: "Hệ thống chấm điểm E-S-G và hỗ trợ xếp hạng dự án để tăng tính minh bạch khi ra quyết định.",
    },
    {
      icon: MessageCircle,
      title: "Tương tác trực tiếp",
      desc: "Bình luận, nhắn tin và gửi quan tâm đầu tư ngay trong từng dự án cụ thể.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo mật nhiều lớp",
      desc: "Google Login, OTP Gmail, xác thực khuôn mặt cho admin và cảnh báo Zalo khi có đăng nhập quản trị.",
    },
    {
      icon: Bell,
      title: "Giám sát hệ thống",
      desc: "Theo dõi thông báo, audit log, báo cáo vi phạm và lịch sử hoạt động để quản trị hiệu quả hơn.",
    },
  ],
  roles: [
    {
      icon: Wallet,
      title: "Nhà đầu tư",
      items: [
        "Tìm kiếm dự án",
        "Lưu yêu thích",
        "Gửi quan tâm đầu tư",
        "Nhắn tin với chủ dự án",
      ],
    },
    {
      icon: Building2,
      title: "Doanh nghiệp",
      items: [
        "Đăng tải dự án",
        "Quản lý tài liệu",
        "Tạo vòng gọi vốn",
        "Theo dõi nhà đầu tư quan tâm",
      ],
    },
    {
      icon: Users,
      title: "Quản trị viên",
      items: [
        "Duyệt dự án",
        "Quản lý ESG",
        "Theo dõi đăng nhập",
        "Xử lý báo cáo vi phạm",
      ],
    },
  ],
  highlights: [
    {
      title: "Minh bạch đầu tư",
      desc: "Hiển thị thông tin dự án, tài liệu, mức vốn, rủi ro và ESG giúp tăng niềm tin cho nhà đầu tư.",
    },
    {
      title: "Tương tác trực tiếp",
      desc: "Người dùng có thể bình luận, nhắn tin và gửi quan tâm đầu tư ngay trên nền tảng.",
    },
    {
      title: "Bảo mật quản trị",
      desc: "Điểm khác biệt là xác thực khuôn mặt cho admin, log đăng nhập và cảnh báo Zalo.",
    },
  ],
  steps: [
    {
      number: "01",
      title: "Doanh nghiệp tạo dự án",
      desc: "Nhập thông tin, vốn cần huy động, tài liệu, chỉ số môi trường và tạo vòng gọi vốn.",
    },
    {
      number: "02",
      title: "Admin kiểm duyệt và chấm ESG",
      desc: "Hệ thống đánh giá tiêu chí ESG, theo dõi minh bạch và cập nhật trạng thái dự án.",
    },
    {
      number: "03",
      title: "Nhà đầu tư khám phá và kết nối",
      desc: "Tìm kiếm, yêu thích, gửi quan tâm đầu tư và trao đổi trực tiếp với chủ dự án.",
    },
  ],
  dashboardItems: [
    {
      icon: Leaf,
      title: "Dự án xanh",
      value: "Quản lý đầy đủ hồ sơ, vòng gọi vốn, tài liệu",
    },
    {
      icon: LineChart,
      title: "ESG Score",
      value: "Chấm điểm và phân loại excellent / good / average / poor",
    },
    {
      icon: Lock,
      title: "Admin Security",
      value: "Email + mật khẩu + face login + cảnh báo Zalo",
    },
    {
      icon: Star,
      title: "Investor Flow",
      value: "Quan tâm đầu tư, yêu thích, bình luận và nhắn tin",
    },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Section({ className = "", children }) {
  return (
    <section className={cn("mx-auto max-w-7xl px-6 lg:px-8", className)}>
      {children}
    </section>
  );
}

function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function Button({
  asChild = false,
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-green-500 text-slate-950 hover:bg-green-400",
    secondary: "bg-white text-slate-950 hover:bg-slate-100",
    ghost: "text-white hover:bg-white/10",
    outline: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
  };

  const mergedClassName = cn(base, variants[variant], className);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(mergedClassName, children.props.className),
      ...props,
    });
  }

  return (
    <button type={type} className={mergedClassName} {...props}>
      {children}
    </button>
  );
}

const StatCard = memo(function StatCard({ value, label }) {
  return (
    <Card className="shadow-xl shadow-black/10">
      <div className="p-5">
        <div className="text-3xl font-bold text-green-400">{value}</div>
        <p className="mt-2 text-sm text-white/70">{label}</p>
      </div>
    </Card>
  );
});

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <Card className="bg-slate-950/60 transition duration-300 hover:-translate-y-1 hover:border-green-400/30">
      <div className="p-6">
        <div className="mb-4 inline-flex rounded-2xl bg-green-500/10 p-3 text-green-400">
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-xl font-semibold">{title}</h4>
        <p className="mt-3 leading-7 text-white/65">{desc}</p>
      </div>
    </Card>
  );
});

const RoleCard = memo(function RoleCard({ icon: Icon, title, items }) {
  return (
    <Card>
      <div className="p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
          <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-2xl font-semibold">{title}</h4>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white/75"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

const StepCard = memo(function StepCard({ number, title, desc }) {
  return (
    <Card>
      <div className="p-6">
        <div className="text-5xl font-bold text-green-400/80">{number}</div>
        <h4 className="mt-4 text-xl font-semibold">{title}</h4>
        <p className="mt-3 leading-7 text-white/70">{desc}</p>
      </div>
    </Card>
  );
});

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-12">
      {eyebrow && (
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-green-400">
          {eyebrow}
        </p>
      )}
      <h3 className="mt-4 text-3xl font-bold md:text-4xl">{title}</h3>
      {description && (
        <p className="mt-4 max-w-2xl text-white/65">{description}</p>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/20 ring-1 ring-green-400/30">
            <Leaf className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-white/60">{CONTENT.brand.en}</p>
            <h1 className="text-lg font-semibold">{CONTENT.brand.vi}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost">
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button asChild variant="primary">
            <Link to="/register">Đăng ký</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />

      <Header />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pt-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-300">
            <BadgeCheck className="h-4 w-4" />
            {CONTENT.hero.badge}
          </div>

          <div className="space-y-5">
            <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {CONTENT.hero.title}
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/70">
              {CONTENT.hero.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild variant="primary" className="px-6 py-6 text-base">
              <Link to="/login">Khám phá dự án</Link>
            </Button>
            <Button variant="outline" className="px-6 py-6 text-base">
              Xem hệ thống
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CONTENT.stats.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid gap-4"
        >
          <Card className="rounded-[28px] shadow-2xl shadow-green-900/20">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Dashboard overview</p>
                  <h3 className="text-xl font-semibold">Điểm nhấn hệ thống</h3>
                </div>
                <div className="rounded-xl bg-green-500/15 px-3 py-2 text-sm text-green-300">
                  ESG Ready
                </div>
              </div>

              <div className="space-y-4">
                {CONTENT.dashboardItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                    >
                      <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-white/60">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function AnalysisSection() {
  return (
    <Section className="py-20">
      <SectionHeading
        eyebrow="Phân tích hệ thống"
        title="Landing page nên nhấn vào 3 giá trị cốt lõi"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {CONTENT.highlights.map((item) => (
          <Card key={item.title}>
            <div className="p-6">
              <h4 className="text-xl font-semibold">{item.title}</h4>
              <p className="mt-3 leading-7 text-white/70">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function FeaturesSection() {
  return (
    <section className="border-y border-white/10 bg-white/5">
      <Section className="py-20">
        <SectionHeading
          eyebrow="Tính năng nổi bật"
          title="Những gì nền tảng cung cấp"
          description="Nền tảng kết nối đầu tư xanh với đánh giá ESG, quản trị bảo mật và giao tiếp hai chiều."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {CONTENT.features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>
    </section>
  );
}

function RolesSection() {
  return (
    <Section className="py-20">
      <div className="grid gap-6 lg:grid-cols-3">
        {CONTENT.roles.map((role) => (
          <RoleCard key={role.title} {...role} />
        ))}
      </div>
    </Section>
  );
}

function StepsSection() {
  return (
    <section className="border-y border-white/10 bg-gradient-to-b from-green-500/5 to-transparent">
      <Section className="py-20">
        <SectionHeading
          eyebrow="Quy trình hoạt động"
          title="Một hành trình rõ ràng từ dự án đến đầu tư"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {CONTENT.steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </Section>
    </section>
  );
}

function CTASection() {
  return (
    <Section className="py-20">
      <Card className="overflow-hidden rounded-[32px] border-green-400/20 bg-gradient-to-r from-green-500/15 via-emerald-500/10 to-cyan-500/10">
        <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-green-300">
              Sẵn sàng triển khai
            </p>
            <h3 className="mt-4 text-3xl font-bold md:text-4xl">
              Biến đồ án thành một landing page thuyết phục và hiện đại
            </h3>
            <p className="mt-4 leading-7 text-white/75">
              Giao diện này phù hợp để dùng làm trang chủ cho đồ án tốt nghiệp,
              demo portfolio hoặc phần giới thiệu sản phẩm trước khi vào dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button asChild variant="primary" className="px-6 py-6 text-base">
              <Link to="/register">Dùng làm trang chủ</Link>
            </Button>
            <Button asChild variant="outline" className="px-6 py-6 text-base">
              <Link to="/login">Tùy chỉnh nội dung</Link>
            </Button>
          </div>
        </div>
      </Card>
    </Section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HeroSection />
      <AnalysisSection />
      <FeaturesSection />
      <RolesSection />
      <StepsSection />
      <CTASection />
    </div>
  );
}