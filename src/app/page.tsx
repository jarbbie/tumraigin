import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationManager } from "@/features/locations/LocationManager";
import { PlannerShell } from "@/features/planning/PlannerShell";

export default function Home() {
  return (
    <PlannerShell
      step={0}
      title="ตัวช่วยการวางแผนทำอาหารกินเองของคุณ"
      description="เริ่มจากสถานที่ที่คุณเลือกเอง แล้วค่อยวางแผนเมนูตามความชอบ ดูรายละเอียด และสรุปของที่ต้องซื้อ"
    >
      <LocationManager />
      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          เลือกจุดที่จะใช้อ้างอิงหรือใช้พื้นที่สาธิตก็ได้ บันทึกแผนที่นี้ไว้ในเบราว์เซอร์ของคุณเท่านั้น
        </p>
        <Button nativeButton={false} render={<Link href="/preferences" />} className="h-11 w-full sm:w-auto">
          ต่อไป · ตั้งความชอบ (ข้ามได้) <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </PlannerShell>
  );
}
