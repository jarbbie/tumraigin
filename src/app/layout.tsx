import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumraigin (ทำไรกิน)",
  description: "วางแผนมื้ออาหารและรายการซื้อของจากวัตถุดิบที่มี",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
