import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#ebebeb] px-4 py-6">
      <div className="max-w-screen-lg mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Brand */}
          <div>
            <p className="font-extrabold text-[18px] tracking-tight">
              <span className="text-brand-500">Deal</span>
              <span className="text-text-primary">2Done</span>
            </p>
            <p className="text-[12px] text-text-muted mt-0.5">От сделки до поставки</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/catalog" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              Каталог
            </Link>
            <Link href="/login" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              Войти
            </Link>
            <Link href="/register?role=supplier" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              Стать поставщиком
            </Link>
          </nav>
        </div>

        <p className="text-[11px] text-text-muted mt-5 pt-4 border-t border-[#f0f0f0]">
          © 2025 Deal2Done · Казахстан
        </p>

      </div>
    </footer>
  );
}
