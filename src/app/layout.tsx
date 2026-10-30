import type { Metadata } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { PlanningProvider } from "@/features/planning/PlanningProvider";

export const metadata: Metadata = {
  title: "Tumraigin (ทำไรกิน)",
  description: "ตัวช่วยการวางแผนทำอาหารกินเองของคุณ ตั้งแต่เลือกสถานที่ วางแผนเมนู ไปจนถึงรายการซื้อของ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full">
        <PlanningProvider>{children}</PlanningProvider>
      </body>
    </html>
  );
}
