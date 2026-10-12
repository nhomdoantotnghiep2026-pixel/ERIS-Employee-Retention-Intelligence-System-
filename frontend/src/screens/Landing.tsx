import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MailCheck,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserCog,
  UsersRound,
} from 'lucide-react';

const capabilities = [
  {
    icon: BrainCircuit,
    title: 'Dự đoán nguy cơ nghỉ việc',
    description: 'Ước tính mức độ rủi ro theo từng nhân viên để HR phát hiện sớm các nhóm cần theo dõi.',
  },
  {
    icon: BarChart3,
    title: 'Giải thích yếu tố tác động',
    description: 'Hiển thị những tín hiệu như hiệu suất, gắn kết, thâm niên hoặc xu hướng phản hồi có liên quan đến rủi ro.',
  },
  {
    icon: FileText,
    title: 'Báo cáo cho HR',
    description: 'Tổng hợp dữ liệu thành dashboard và báo cáo dễ đọc để hỗ trợ lập kế hoạch giữ chân nhân tài.',
  },
];

const workflow = [
  {
    icon: UserCog,
    title: 'Admin tạo tài khoản',
    description: 'Tài khoản không đăng ký công khai. Quản trị viên tạo người dùng và phân quyền theo vai trò.',
  },
  {
    icon: LockKeyhole,
    title: 'Trạng thái IN_PROCESS',
    description: 'Người dùng đăng nhập lần đầu bằng tài khoản được cấp, sau đó hệ thống yêu cầu xác thực.',
  },
  {
    icon: MailCheck,
    title: 'Xác thực OTP Gmail',
    description: 'Mã OTP được gửi qua email để xác nhận người dùng đúng với tài khoản doanh nghiệp.',
  },
  {
    icon: ShieldCheck,
    title: 'ACTIVE theo vai trò',
    description: 'Sau khi active, người dùng truy cập dashboard và chức năng phù hợp với quyền được cấp.',
  },
];

const industries = ['Công nghệ', 'Sản xuất', 'Bán lẻ', 'Giáo dục', 'Dịch vụ', 'Y tế'];

function ErisLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-orange-500 bg-white text-lg font-bold text-orange-600 shadow-sm">
        e
      </div>
      <div>
        <div className="text-lg font-bold tracking-[0.14em] text-slate-950">ERIS</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Retention Intelligence</div>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-28 w-full max-w-6xl lg:mt-32">
      <div className="absolute -left-10 top-12 hidden h-40 w-40 rounded-full bg-orange-200/70 blur-3xl lg:block" aria-hidden="true" />
      <div className="absolute -right-10 top-24 hidden h-48 w-48 rounded-full bg-amber-200/60 blur-3xl lg:block" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_28px_80px_rgba(124,45,18,0.16)]">
        <div className="flex h-12 items-center gap-2 border-b border-slate-100 bg-slate-50 px-5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-3 hidden h-7 flex-1 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-400 sm:flex">
            app.eris.local/dashboard
          </div>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">HR workspace</span>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">HR Risk Monitor</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Attrition overview</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Theo dõi rủi ro nghỉ việc, yếu tố ảnh hưởng và hành động giữ chân nhân viên.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Dashboard', 'Employees', 'Reports'].map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    index === 0 ? 'bg-orange-600 text-white' : 'border border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['142', 'Nhân viên theo dõi', 'text-slate-950'],
              ['18', 'Rủi ro cao', 'text-red-700'],
              ['76%', 'Độ tin cậy mô hình', 'text-emerald-700'],
            ].map(([value, label, color]) => (
              <div key={label} className="rounded-[22px] bg-slate-50 p-5 ring-1 ring-slate-100">
                <div className={`font-mono text-3xl font-bold ${color}`}>{value}</div>
                <div className="mt-2 text-sm font-semibold text-slate-600">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-950">Risk distribution</h3>
                  <p className="mt-1 text-sm text-slate-500">Workforce trend by risk band</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Q4 2026</span>
              </div>
              <div className="space-y-4">
                {[
                  ['High risk', '22%', 'bg-red-500'],
                  ['Medium risk', '41%', 'bg-amber-500'],
                  ['Low risk', '68%', 'bg-emerald-500'],
                ].map(([label, width, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
                      <span>{label}</span>
                      <span>{width}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className={`h-3 rounded-full ${color}`} style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-orange-800">
                <Sparkles size={17} />
                AI insight
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Nhóm có mức gắn kết giảm và lịch sử tăng ca cao cần được HR xem xét trong kỳ đánh giá tiếp theo.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
                <img src="/login-slides/hr-collaboration.png" alt="Nhóm nhân sự trao đổi trong văn phòng" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-950">HR review</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">AI hỗ trợ, HR quyết định cuối cùng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[#fffaf6] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <ErisLogo />
          <nav aria-label="Điều hướng giới thiệu" className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#problem" className="transition hover:text-orange-700">Bài toán</a>
            <a href="#solution" className="transition hover:text-orange-700">Giải pháp</a>
            <a href="#account-flow" className="transition hover:text-orange-700">Luồng tài khoản</a>
          </nav>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(234,88,12,0.24)] transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98]"
          >
            Đăng nhập
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-24 pt-24 sm:px-8 lg:pb-32 lg:pt-28">
        <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,237,213,0.92),rgba(255,250,246,0)_68%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-[0_12px_32px_rgba(249,115,22,0.10)]">
              <Sparkles size={16} />
              AI hỗ trợ HR giữ chân nhân tài trong doanh nghiệp
            </div>
            <h1
              className="mt-14 max-w-5xl font-bold tracking-tight text-slate-950"
              style={{ fontSize: 'clamp(42px, 4.8vw, 72px)', lineHeight: 1.1, textWrap: 'balance' }}
            >
              Nền tảng thông minh cho <span className="text-orange-600">quản trị rủi ro nghỉ việc</span>
            </h1>
            <p className="mt-12 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
              ERIS phân tích dữ liệu nhân sự hiện có, ước tính nguy cơ nghỉ việc và giúp HR ưu tiên hành động giữ chân nhân viên trước khi vấn đề trở nên bị động.
            </p>
            <div className="mt-14 flex w-full flex-col items-center justify-center gap-5 sm:w-auto sm:flex-row">
              <Link
                to="/login"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 text-base font-bold text-white shadow-[0_18px_38px_rgba(234,88,12,0.30)] transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98] sm:w-[240px]"
              >
                Vào hệ thống
                <ArrowRight size={20} />
              </Link>
              <a
                href="#solution"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-base font-bold text-slate-800 shadow-[0_14px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98] sm:w-[290px]"
              >
                <PlayCircle size={20} />
                Xem ERIS hỗ trợ HR
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              {['AI advisory cho HR review', 'Phân quyền RBAC', 'OTP Gmail cho tài khoản mới'].map((item) => (
                <span key={item} className="rounded-full border border-orange-100 bg-white px-4 py-2 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="problem" className="border-y border-orange-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Bài toán thực tế</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Nghỉ việc không chỉ là mất người.</h2>
          </div>
          <div className="grid gap-5 text-base leading-8 text-slate-600 md:grid-cols-2">
            <p>
              Tình trạng nhân viên nghỉ việc có thể làm tăng chi phí tuyển dụng, giảm năng suất và ảnh hưởng đến sự ổn định của tổ chức.
            </p>
            <p>
              Nhiều bộ phận HR vẫn dựa vào khảo sát, phản hồi từ quản lý và quan sát thủ công. Các phương pháp này dễ chủ quan, thường mang tính ứng phó và khó mở rộng khi quy mô nhân sự tăng.
            </p>
          </div>
        </div>
      </section>

      <section id="solution" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">ERIS đề xuất</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Hệ thống hỗ trợ quyết định cho kế hoạch giữ chân nhân viên.</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            ERIS sử dụng AI và phân tích dữ liệu hiện có để chuyển dữ liệu nhân sự thành thông tin dễ hiểu, giúp HR ưu tiên theo dõi, xem nguyên nhân liên quan và chuẩn bị báo cáo cho cấp quản lý.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-300">Phạm vi ứng dụng</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Phù hợp cho nhiều bối cảnh doanh nghiệp.</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Hệ thống có thể được đặt trong các lĩnh vực có biến động nhân sự đáng chú ý như công nghệ, sản xuất, bán lẻ, giáo dục hoặc dịch vụ. HR chọn ngữ cảnh, ERIS hỗ trợ nhìn ra tín hiệu từ dữ liệu.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-4">
                <CheckCircle2 className="text-orange-300" size={20} />
                <span className="font-semibold">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="account-flow" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Trước khi đăng nhập</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Không có đăng ký công khai.</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Tài khoản ERIS được tạo bởi quản trị viên của doanh nghiệp. Người dùng chỉ sử dụng chức năng sau khi tài khoản được xác thực và chuyển sang trạng thái active.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-slate-950">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <ErisLogo />
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Kết quả từ AI đóng vai trò hỗ trợ, không thay thế quyết định của bộ phận nhân sự.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98]"
          >
            Tiếp tục đăng nhập
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
