import type { Metadata } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumraigin (ทำไรกิน)",
  description: "ตัวช่วยวางแผนทำอาหารกินเอง ตั้งแต่เลือกพื้นที่จนถึงรายการซื้อของ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
