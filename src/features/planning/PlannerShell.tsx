import Link from "next/link";
import type { ReactNode } from "react";

const journey = [
  { label: "สถานที่", href: "/" },
  { label: "ความชอบ", href: "/preferences", note: "ข้ามได้" },
  { label: "เมนูและแผน", href: "/meals" },
  { label: "รายการซื้อ", href: "/shopping-list" },
] as const;

export function PlannerShell({
  step,
  title,
  description,
  children,
}: {
  step: 0 | 1 | 2 | 3;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="rounded-sm leading-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="block text-lg font-bold tracking-tight">ทำไรกิน</span>
            <span className="block text-xs text-muted-foreground">Tumraigin</span>
          </Link>
          <p className="max-w-[13rem] text-right text-xs leading-5 text-muted-foreground sm:max-w-none sm:text-sm">ตัวช่วยการวางแผนทำอาหารกินเองของคุณ</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[90rem] px-5 pb-16 pt-6 sm:px-8 sm:pt-9">
        <nav aria-label="ขั้นตอนวางแผนอาหาร" className="mb-9 border-b border-border pb-5">
          <ol className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-5">
            {journey.map((item, index) => {
              const current = index === step;
              const complete = index < step;
              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    aria-current={current ? "step" : undefined}
                    className={`group inline-flex max-w-full items-center gap-2 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${current ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums ${current ? "border-primary bg-primary text-primary-foreground" : complete ? "border-primary/40 bg-secondary text-primary" : "border-border bg-card"}`}>
                      {index + 1}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {"note" in item ? <span className="hidden text-xs font-normal sm:inline">({item.note})</span> : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <section aria-labelledby="page-heading" className="mb-7 max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">ขั้นตอน {step + 1} / 4</p>
          <h1 id="page-heading" className="text-[clamp(1.85rem,4vw,3.15rem)] font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{description}</p>
        </section>

        {children}
      </main>
    </div>
  );
}

export function formatBaht(priceSatang: number | null): string {
  if (priceSatang === null) return "ราคารวมยังไม่ครบ";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceSatang / 100);
}

export function formatGrams(grams: number): string {
  return `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 }).format(grams)} g`;
}

export function DisclosureNote({ children }: { children?: ReactNode }) {
  return (
    <p className="border-l-2 border-accent bg-accent/10 px-3 py-2 text-xs leading-5 text-foreground">
      {children ?? "ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา"}
    </p>
  );
}
