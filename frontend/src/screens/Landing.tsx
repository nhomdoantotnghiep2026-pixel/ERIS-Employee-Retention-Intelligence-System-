import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, MotionConfig, useInView, useMotionValue, useTransform } from 'motion/react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  Database,
  Factory,
  FileCheck2,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Store,
  UserCog,
  UsersRound,
} from 'lucide-react';

const benefits = [
  {
    icon: BrainCircuit,
    title: 'Phát hiện tín hiệu sớm',
    description: 'Ước tính rủi ro theo từng nhân viên để HR ưu tiên đúng nhóm cần được quan tâm.',
  },
  {
    icon: Activity,
    title: 'Hiểu yếu tố tác động',
    description: 'Kết nối hiệu suất, mức độ gắn kết, tăng ca và thâm niên trong cùng một góc nhìn.',
  },
  {
    icon: FileCheck2,
    title: 'Theo dõi hành động giữ chân',
    description: 'Lập kế hoạch can thiệp, giao trách nhiệm và theo dõi kết quả theo thời gian.',
  },
  {
    icon: Database,
    title: 'Dữ liệu có kiểm soát',
    description: 'Chuẩn hoá dữ liệu đầu vào và theo dõi chất lượng trước khi chạy phân tích AI.',
  },
  {
    icon: UserCog,
    title: 'Không gian theo vai trò',
    description: 'HR, Data/AI, System Admin và Employee chỉ thấy đúng chức năng được cấp quyền.',
  },
  {
    icon: ShieldCheck,
    title: 'Quyết định thuộc về con người',
    description: 'AI cung cấp thông tin tham khảo; quyết định nhân sự cuối cùng vẫn thuộc về HR.',
  },
];

const workflow = [
  ['01', 'Tiếp nhận dữ liệu', 'Dữ liệu nhân sự được đưa vào từ nguồn đã được doanh nghiệp phê duyệt.'],
  ['02', 'Kiểm tra chất lượng', 'Phát hiện trường thiếu, sai định dạng và các giá trị cần chuẩn hoá.'],
  ['03', 'Phân tích rủi ro', 'Mô hình tạo dự đoán và giải thích các yếu tố có liên quan.'],
  ['04', 'HR xem xét', 'HR xác minh bối cảnh, quyết định hành động và theo dõi kết quả.'],
];

const accountFlow = [
  { icon: UserCog, title: 'Admin tạo tài khoản', text: 'Không có đăng ký công khai.' },
  { icon: LockKeyhole, title: 'Đăng nhập lần đầu', text: 'Dùng thông tin doanh nghiệp cấp.' },
  { icon: MailCheck, title: 'Xác thực OTP', text: 'Xác minh qua email doanh nghiệp.' },
  { icon: ShieldCheck, title: 'Truy cập theo vai trò', text: 'Chỉ hiển thị chức năng được cấp.' },
];

const organizationTypes = [
  { icon: Building2, label: 'Doanh nghiệp' },
  { icon: BriefcaseBusiness, label: 'Dịch vụ chuyên môn' },
  { icon: GraduationCap, label: 'Giáo dục' },
  { icon: HeartPulse, label: 'Y tế' },
  { icon: Factory, label: 'Sản xuất' },
  { icon: Landmark, label: 'Tài chính' },
  { icon: Store, label: 'Bán lẻ' },
  { icon: Globe2, label: 'Đội ngũ đa quốc gia' },
];

function ErisLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="ERIS - Retention Intelligence">
      <div className={`relative grid h-11 w-11 place-items-center rounded-full border-2 text-lg font-bold ${inverse ? 'border-orange-400 bg-white/10 text-orange-300' : 'border-orange-500 bg-white text-orange-600'}`}>
        e
        <span className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ${inverse ? 'ring-slate-950' : 'ring-white'}`} aria-hidden="true" />
      </div>
      <div>
        <div className={`text-lg font-bold tracking-[0.14em] ${inverse ? 'text-white' : 'text-slate-950'}`}>ERIS</div>
        <div className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${inverse ? 'text-slate-400' : 'text-slate-500'}`}>Retention Intelligence</div>
      </div>
    </div>
  );
}

function AnimatedMetric({ target, suffix = '', pad = 0, delay = 0, label }: { target: number; suffix?: string; pad?: number; delay?: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.7 });
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => `${Math.round(latest).toString().padStart(pad, '0')}${suffix}`);

  useEffect(() => {
    if (!inView) {
      count.set(0);
      return;
    }

    const controls = animate(count, [0, target + 10, target], {
      duration: 1.45,
      delay,
      times: [0, 0.76, 1],
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 2.55,
      repeatType: 'loop',
    });

    return () => controls.stop();
  }, [count, delay, inView, target]);

  return (
    <span ref={ref} className="inline-flex min-w-[3ch] justify-center" aria-label={label}>
      <motion.span
        aria-hidden="true"
        animate={{
          y: [0, -4, 2, -1, 0],
          scale: [1, 1.13, 0.96, 1.04, 1],
          rotate: [0, -1.5, 1.2, -0.5, 0],
          skewX: [0, -3, 2, 0, 0],
          textShadow: [
            '0 0 0 rgba(234,88,12,0)',
            '-5px 0 0 rgba(251,146,60,0.32), 5px 0 0 rgba(15,23,42,0.12)',
            '3px 0 0 rgba(251,146,60,0.18), -3px 0 0 rgba(15,23,42,0.08)',
            '0 0 18px rgba(234,88,12,0.35)',
            '0 0 0 rgba(234,88,12,0)',
          ],
        }}
        transition={{ duration: 0.52, delay, repeat: Infinity, repeatDelay: 3.48, ease: 'easeInOut' }}
        className="inline-block will-change-transform"
      >
        {display}
      </motion.span>
    </span>
  );
}

function ProductStage() {
  return (
    <div className="landing-stage relative mx-auto mt-16 h-[420px] w-full max-w-6xl sm:h-[500px] lg:mt-20 lg:h-[570px]" aria-label="Minh hoạ dashboard phân tích nhân sự ERIS">
      <motion.div
        initial={{ opacity: 0, x: -90, y: 42, rotate: -16, scale: 0.86 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -8, scale: 1 }}
        transition={{ type: 'spring', stiffness: 105, damping: 20, delay: 0.7 }}
        className="absolute left-[4%] top-[16%] hidden w-[30%] overflow-hidden rounded-[28px] border-[5px] border-white bg-white shadow-[0_24px_60px_rgba(71,85,105,0.16)] md:block"
        aria-hidden="true"
      >
        <img src="/login-slides/hr-collaboration.png" alt="" className="aspect-[4/5] w-full object-cover" />
        <div className="p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600">HR review</p><p className="mt-1 text-sm font-bold text-slate-900">Thảo luận trước khi hành động</p></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 90, y: 42, rotate: 16, scale: 0.86 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 8, scale: 1 }}
        transition={{ type: 'spring', stiffness: 105, damping: 20, delay: 0.7 }}
        className="absolute right-[4%] top-[16%] hidden w-[30%] overflow-hidden rounded-[28px] border-[5px] border-white bg-white shadow-[0_24px_60px_rgba(71,85,105,0.16)] md:block"
        aria-hidden="true"
      >
        <img src="/login-slides/hr-leadership.png" alt="" className="aspect-[4/5] w-full object-cover" />
        <div className="p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-600">Executive insight</p><p className="mt-1 text-sm font-bold text-slate-900">Báo cáo rõ ràng cho quản lý</p></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: '-50%', y: 95, scale: 0.82 }}
        animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 115, damping: 22, delay: 0.48 }}
        className="absolute left-1/2 top-0 z-10 w-[94%] max-w-[760px] overflow-hidden rounded-[30px] border-[6px] border-white bg-white shadow-[0_32px_80px_rgba(124,45,18,0.18)] sm:w-[82%]"
      >
        <div className="flex h-12 items-center gap-2 border-b border-slate-100 bg-slate-50 px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">HR workspace</span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">Workforce risk monitor</p><h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Tổng quan giữ chân nhân viên</h2></div>
            <span className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:block">Tháng này</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ['142', 'Đang theo dõi', 'text-slate-950'],
              ['18', 'Rủi ro cao', 'text-red-600'],
              ['76%', 'Độ tin cậy', 'text-emerald-700'],
            ].map(([value, label, color]) => (
              <div key={label} className="rounded-[16px] bg-slate-50 p-3 ring-1 ring-slate-100 sm:p-4">
                <p className={`font-mono text-xl font-bold sm:text-2xl ${color}`}>{value}</p><p className="mt-1 text-[10px] font-semibold text-slate-500 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[18px] border border-slate-100 p-4">
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-900">Phân bổ rủi ro</p><BarChart3 size={17} className="text-slate-400" /></div>
              <div className="mt-4 space-y-3">
                {[
                  ['Cao', '22%', 'bg-red-500'], ['Trung bình', '41%', 'bg-amber-500'], ['Thấp', '68%', 'bg-emerald-500'],
                ].map(([label, width, color]) => (
                  <div key={label}><div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500 sm:text-xs"><span>{label}</span><span>{width}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width }} /></div></div>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] bg-orange-50 p-4 ring-1 ring-orange-100">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-800"><Sparkles size={15} /> AI insight</div>
              <p className="mt-3 text-[11px] leading-5 text-slate-600 sm:text-xs">Mức độ gắn kết giảm và tăng ca kéo dài là hai tín hiệu cần HR xem xét.</p>
              <div className="mt-4 flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-orange-200" /><div><p className="text-[10px] font-bold text-slate-900">HR review</p><p className="text-[9px] text-slate-500">Đang chờ xử lý</p></div></div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -45, scale: 0.75 }}
        animate={{ opacity: 1, x: 0, y: [0, -12, 0], scale: 1 }}
        transition={{ opacity: { delay: 1.05, duration: 0.35 }, x: { delay: 1.05, type: 'spring', stiffness: 150 }, y: { delay: 1.5, duration: 4.2, repeat: Infinity, ease: 'easeInOut' }, scale: { delay: 1.05, type: 'spring' } }}
        className="absolute left-[1%] top-[52%] z-20 hidden rounded-full border-2 border-white bg-white px-4 py-3 shadow-[0_16px_35px_rgba(15,23,42,0.15)] sm:flex sm:items-center sm:gap-3 lg:left-[6%]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600"><Activity size={17} /></span><span><b className="block text-sm text-slate-900">18 cảnh báo</b><span className="text-[10px] text-slate-500">Cần HR xem xét</span></span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 45, scale: 0.75 }}
        animate={{ opacity: 1, x: 0, y: [0, 12, 0], scale: 1 }}
        transition={{ opacity: { delay: 1.2, duration: 0.35 }, x: { delay: 1.2, type: 'spring', stiffness: 150 }, y: { delay: 1.9, duration: 4.6, repeat: Infinity, ease: 'easeInOut' }, scale: { delay: 1.2, type: 'spring' } }}
        className="absolute bottom-[8%] right-[1%] z-20 hidden rounded-full border-2 border-white bg-white px-4 py-3 shadow-[0_16px_35px_rgba(15,23,42,0.15)] sm:flex sm:items-center sm:gap-3 lg:right-[6%]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={17} strokeWidth={3} /></span><span><b className="block text-sm text-slate-900">12 hành động</b><span className="text-[10px] text-slate-500">Đã hoàn thành</span></span>
      </motion.div>
    </div>
  );
}

function OrganizationMarquee() {
  const items = [...organizationTypes, ...organizationTypes];

  return (
    <motion.section
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="organization-marquee-title"
      className="bg-white px-0 pb-5 pt-16 sm:pt-20"
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Thiết kế để thích nghi</p>
        <h2 id="organization-marquee-title" className="mx-auto mt-3 max-w-3xl text-xl font-bold tracking-[-0.025em] text-slate-900 sm:text-2xl">
          Sẵn sàng cho nhiều mô hình tổ chức và đội ngũ nhân sự
        </h2>
      </div>
      <div className="landing-marquee-mask group mt-9 overflow-hidden py-3">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex w-max will-change-transform"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const duplicate = index >= organizationTypes.length;
            return (
              <div key={`${item.label}-${index}`} aria-hidden={duplicate || undefined} className="mx-3 flex min-w-[220px] items-center justify-center gap-3 rounded-[20px] border border-slate-100 bg-slate-50/90 px-6 py-5 text-slate-500 shadow-[0_8px_28px_rgba(71,85,105,0.06)] sm:min-w-[250px]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-orange-600 shadow-sm"><Icon size={21} /></span>
                <span className="text-base font-bold tracking-[-0.01em] text-slate-700">{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
      <p className="mx-auto mt-4 max-w-2xl px-5 text-center text-sm leading-6 text-slate-500">
        ERIS điều chỉnh luồng dữ liệu, phân quyền và phân tích theo cơ cấu vận hành của từng tổ chức.
      </p>
    </motion.section>
  );
}

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-dvh overflow-hidden bg-white text-slate-800">
      <a href="#landing-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-orange-700 focus:shadow-lg">Bỏ qua điều hướng</a>

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7 sm:pt-6">
        <motion.nav initial={{ opacity: 0, y: -34, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 125, damping: 18, delay: 0.03 }} aria-label="Điều hướng giới thiệu" className="mx-auto flex h-[72px] w-full max-w-[1040px] items-center justify-between rounded-full border border-slate-200 bg-white/95 py-2 pl-5 pr-2 shadow-[0_16px_40px_rgba(71,85,105,0.12)] backdrop-blur-xl">
          <ErisLogo />
          <div className="hidden items-center lg:flex">
            {[['Giải pháp', '#benefits'], ['Vai trò', '#roles'], ['Quy trình', '#workflow'], ['Bảo mật', '#security']].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-4 py-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-orange-700">{label}</a>
            ))}
          </div>
          <Link to="/login" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.97]">
            Đăng nhập <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.nav>
      </header>

      <section id="landing-content" className="relative flex flex-col items-center overflow-hidden rounded-b-[46px] bg-[#f8f9fb] px-4 pb-0 pt-[138px] shadow-[0_0_0_6px_#fff,0_22px_30px_rgba(140,150,169,0.10)] sm:px-7 sm:pt-[160px]">
        <div className="landing-dot-grid absolute inset-0" aria-hidden="true" />
        <motion.div animate={{ opacity: [0.45, 0.9, 0.45], scaleY: [0.92, 1.08, 0.92] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-x-0 bottom-0 h-[360px] origin-bottom bg-gradient-to-b from-orange-500/0 via-orange-400/10 to-orange-500/20" aria-hidden="true" />
        <motion.div animate={{ scale: [1, 1.13, 1], x: ['-50%', '-48%', '-50%'] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-1/2 top-16 h-[520px] w-[900px] rounded-full bg-white/70 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 22, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 170, damping: 18, delay: 0.08 }}>
          <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-slate-100 p-1.5 pr-4 text-sm font-semibold text-slate-700 shadow-[0_0_0_3px_#fff,0_8px_18px_rgba(100,116,139,0.14)] transition-transform duration-200 hover:-translate-y-0.5">
            <span className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">Mới</span>
            Không gian ERIS theo vai trò <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }} className="mt-8 max-w-5xl text-[42px] font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-[58px] lg:text-[72px]">
            Hiểu nhân sự sớm hơn. <span className="text-orange-600">Giữ chân</span> đúng lúc.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.36, ease: [0.16, 1, 0.3, 1] }} className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            ERIS biến dữ liệu nhân sự thành tín hiệu rủi ro dễ hiểu, giúp HR chủ động ưu tiên, can thiệp và theo dõi hiệu quả giữ chân nhân viên.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 22, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 17, delay: 0.48 }} whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.96 }}>
          <Link to="/login" className="group mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-orange-600 px-7 text-base font-bold text-white shadow-[0_16px_34px_rgba(234,88,12,0.28)] transition-all duration-200 hover:scale-[1.025] hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.97]">
            Vào hệ thống <ArrowRight size={19} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.65 }} className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500"><ShieldCheck size={17} className="text-emerald-600" /> AI hỗ trợ phân tích · HR quyết định cuối cùng</motion.p>
        </div>

        <ProductStage />
      </section>

      <OrganizationMarquee />

      <section className="px-5 pb-4 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold text-slate-500">Một nền tảng phối hợp xuyên suốt giữa các vai trò</p>
          <div id="roles" className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [UsersRound, 'HR', 'Hồ sơ · Rủi ro · Can thiệp'],
              [Database, 'Data / AI', 'Dữ liệu · Mô hình · Đánh giá'],
              [UserCog, 'System Admin', 'Tài khoản · Quyền · Cấu hình'],
              [ShieldCheck, 'Employee / ESS', 'Cá nhân · Khảo sát · Tiện ích'],
            ].map(([Icon, title, text], index) => {
              const RoleIcon = Icon as typeof UsersRound;
              return <motion.div key={String(title)} initial={{ opacity: 0, y: 30, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ type: 'spring', stiffness: 115, damping: 18, delay: index * 0.08 }} whileHover={{ y: -7, scale: 1.025 }} className="flex items-center gap-3 rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-4 text-left shadow-sm transition-shadow hover:shadow-xl"><motion.span whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.45 }} className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white text-orange-600 shadow-sm"><RoleIcon size={19} /></motion.span><span><b className="block text-sm text-slate-900">{String(title)}</b><span className="text-xs text-slate-500">{String(text)}</span></span></motion.div>;
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-5 py-24 sm:px-8 sm:py-28 lg:gap-36 lg:py-36">
        <motion.section initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} aria-labelledby="proof-title" className="text-center">
          <motion.h2 initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: 'spring', stiffness: 95, damping: 18 }} id="proof-title" className="mx-auto max-w-4xl text-3xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl">Một quy trình rõ ràng để biến dữ liệu thành hành động giữ chân.</motion.h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ['01', 'Nguồn dữ liệu thống nhất', 'Hồ sơ, hiệu suất, gắn kết và lịch sử làm việc.'],
              ['04', 'Không gian theo vai trò', 'Mỗi nhóm người dùng có luồng công việc riêng.'],
              ['24/7', 'Theo dõi liên tục', 'Cảnh báo, lịch sử hành động và trạng thái hệ thống.'],
            ].map(([value, title, text], index) => (
              <motion.article key={title} initial={{ opacity: 0, y: 45, rotateX: 12 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: 'spring', stiffness: 100, damping: 18, delay: index * 0.1 }} whileHover={{ y: -10, scale: 1.025 }} className="rounded-[26px] bg-slate-50 px-6 py-8 ring-1 ring-slate-100 hover:shadow-[0_20px_55px_rgba(71,85,105,0.12)]">
                <motion.p initial={{ scale: 0.75 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 180, delay: 0.12 + index * 0.1 }} className="font-mono text-4xl font-bold tabular-nums text-orange-600">
                  <AnimatedMetric target={index === 0 ? 1 : index === 1 ? 4 : 24} suffix={index === 2 ? '/7' : ''} pad={index < 2 ? 2 : 0} delay={index * 0.18} label={value} />
                </motion.p>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <section id="benefits" aria-labelledby="benefits-title">
          <motion.div initial={{ opacity: 0, y: 55 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-3xl text-center"><span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">Giá trị cốt lõi</span><h2 id="benefits-title" className="mt-5 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl">ERIS giúp HR nhìn thấy điều cần ưu tiên.</h2><p className="mt-5 text-base leading-8 text-slate-600">Thay vì ghép nối nhiều bảng tính và đánh giá thủ công, ERIS tổ chức dữ liệu thành một quy trình nhất quán.</p></motion.div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, index) => { const Icon = item.icon; return (
              <motion.article key={item.title} initial={{ opacity: 0, y: 55, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ type: 'spring', stiffness: 90, damping: 17, delay: (index % 3) * 0.11 }} whileHover={{ y: -12, scale: 1.025, rotate: index % 2 === 0 ? -0.45 : 0.45 }} className="group rounded-[24px] bg-slate-50 p-6 ring-1 ring-slate-100 transition-shadow duration-300 hover:bg-white hover:shadow-[0_22px_55px_rgba(71,85,105,0.13)]">
                <motion.span whileHover={{ rotate: 12, scale: 1.12 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-orange-600 shadow-[0_10px_28px_rgba(100,116,139,0.13)]"><Icon size={22} /></motion.span><h3 className="mt-6 text-lg font-bold text-slate-950">{item.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </motion.article>
            ); })}
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 70, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} id="workflow" aria-labelledby="workflow-title" className="relative overflow-hidden rounded-[34px] bg-slate-950 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <motion.div animate={{ x: ['-15%', '20%', '-15%'], y: ['0%', '18%', '0%'], scale: [1, 1.25, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-16 -top-32 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-orange-300">Quy trình có kiểm soát</span><h2 id="workflow-title" className="mt-6 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">AI hỗ trợ phân tích. Con người đưa ra quyết định.</h2></div><p className="max-w-2xl text-base leading-8 text-slate-300 lg:ml-auto">Mỗi dự đoán cần được HR xem xét cùng bối cảnh thực tế trước khi chuyển thành hành động.</p></div>
          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {workflow.map(([number, title, text], index) => (
              <motion.article key={number} initial={{ opacity: 0, x: -35, y: 25 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: 'spring', stiffness: 95, damping: 17, delay: index * 0.12 }} whileHover={{ y: -8, borderColor: 'rgba(251,146,60,0.7)', backgroundColor: 'rgba(255,255,255,0.1)' }} className="relative rounded-[22px] border border-white/10 bg-white/[0.055] p-5">{index < 3 && <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 + index * 0.12 }} className="absolute -right-3 top-9 hidden h-px w-6 origin-left bg-orange-400/50 lg:block" />}<span className="font-mono text-sm font-bold text-orange-300">{number}</span><h3 className="mt-5 font-bold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{text}</p></motion.article>
            ))}
          </div>
        </motion.section>

        <section id="security" aria-labelledby="security-title" className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <motion.div initial={{ opacity: 0, x: -65 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: 'spring', stiffness: 90, damping: 18 }}><motion.span initial={{ rotate: -20, scale: 0.7 }} whileInView={{ rotate: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-orange-700"><LockKeyhole size={26} /></motion.span><p className="mt-7 text-sm font-bold uppercase tracking-[0.14em] text-orange-600">Đăng nhập doanh nghiệp</p><h2 id="security-title" className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Không có đăng ký công khai.</h2><p className="mt-5 text-base leading-8 text-slate-600">Tài khoản được quản trị viên tạo và phân quyền. Người dùng xác thực trước khi truy cập không gian làm việc phù hợp.</p></motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {accountFlow.map((step, index) => { const Icon = step.icon; return (
              <motion.article key={step.title} initial={{ opacity: 0, x: 55, y: 25, scale: 0.92 }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: 'spring', stiffness: 100, damping: 18, delay: index * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} className="rounded-[22px] border border-slate-100 bg-slate-50 p-5 hover:shadow-[0_18px_45px_rgba(71,85,105,0.12)]"><div className="flex items-center justify-between"><motion.span whileHover={{ rotate: -8, scale: 1.1 }} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-orange-700 shadow-sm"><Icon size={20} /></motion.span><span className="font-mono text-xs font-bold text-slate-300">0{index + 1}</span></div><h3 className="mt-5 font-bold text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></motion.article>
            ); })}
          </div>
        </section>

        <motion.section initial={{ opacity: 0, y: 75, scale: 0.93 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', stiffness: 85, damping: 17 }} whileHover={{ scale: 1.012 }} className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-orange-600 to-orange-500 px-6 py-12 text-white shadow-[0_28px_70px_rgba(194,65,12,0.23)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-14">
          <motion.div animate={{ rotate: 360, scale: [1, 1.14, 1] }} transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[52px] border-white/10" aria-hidden="true" /><div className="relative max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.14em] text-orange-100">Sẵn sàng làm việc</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Tiếp tục với không gian ERIS của bạn.</h2><p className="mt-4 text-base leading-7 text-orange-50">Sử dụng tài khoản và quyền truy cập do doanh nghiệp cung cấp.</p></div>
          <Link to="/login" className="group relative mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-bold text-orange-700 shadow-lg transition-all duration-200 hover:scale-[1.025] hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.97] sm:w-auto lg:mt-0">Tiếp tục đăng nhập <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" /></Link>
        </motion.section>
      </div>

      <footer className="bg-slate-950 px-5 py-10 text-white sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><ErisLogo inverse /><p className="mt-3 text-sm text-slate-400">Employee Retention Intelligence System</p></div><p className="max-w-xl text-sm leading-6 text-slate-400 md:text-right">AI hỗ trợ phân tích và ưu tiên. Quyết định nhân sự cuối cùng thuộc về người có thẩm quyền trong doanh nghiệp.</p></div></footer>
    </main>
    </MotionConfig>
  );
}
