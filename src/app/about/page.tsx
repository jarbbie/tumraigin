import type { Metadata } from "next";
import { AboutScreen } from "@/features/about/AboutScreen";

export const metadata: Metadata = {
  title: "ข้อมูลและข้อจำกัด | ทำไรกิน",
  description: "ที่มาของข้อมูล วิธีคำนวณ ราคาและตำแหน่งตัวอย่าง ตลอดจนข้อจำกัดด้านโภชนาการและความเป็นส่วนตัวของทำไรกิน",
};

export default function AboutPage() {
  return <AboutScreen />;
}
