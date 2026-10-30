import { MapPin } from "lucide-react";
import { LocationManager } from "@/features/locations/LocationManager";

const planningSteps = [
  { label: "เลือกพื้นที่", current: true },
  { label: "ตั้งความชอบ", note: "ข้ามได้" },
  { label: "เลือกแผนอาหาร" },
  { label: "รายการซื้อของ" },
];

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a
            href="#home"
            className="rounded-sm font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="block text-lg leading-6">ทำไรกิน</span>
            <span className="block text-xs font-normal text-muted-foreground">Tumraigin</span>
          </a>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <MapPin aria-hidden="true" className="size-4 text-primary" />
            วางแผนทำอาหารกินเอง
          </div>
        </div>
      </header>

      <main id="home" className="mx-auto w-full max-w-[90rem] px-5 pb-14 pt-7 sm:px-8 sm:pt-10">
        <nav aria-label="ขั้นตอนวางแผนอาหาร" className="mb-8">
          <ol className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4 sm:gap-4">
            {planningSteps.map((step, index) => (
              <li key={step.label} className="min-w-0">
                <span
                  aria-current={step.current ? "step" : undefined}
                  className={`inline-flex items-center gap-2 text-sm ${step.current ? "font-semibold text-primary" : "text-muted-foreground"}`}
                >
                  <span className={`flex size-7 items-center justify-center rounded-full border text-xs tabular-nums ${step.current ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {index + 1}
                  </span>
                  {step.label}
                  {step.note ? <span className="text-xs">({step.note})</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="home-heading" className="mb-7 max-w-3xl">
          <p className="text-sm font-medium text-primary">เริ่มจากบริเวณที่คุณสะดวกซื้อของ</p>
          <h1 id="home-heading" className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-tight text-foreground">
            เลือกพื้นที่สำหรับวางแผน
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            ปักหมุดบ้าน ที่ทำงาน หรือจุดที่คุณไปซื้อของบ่อย ตั้งชื่อแล้วบันทึกไว้ใช้ครั้งหน้า
          </p>
        </section>

        <LocationManager />
      </main>
    </div>
  );
}
