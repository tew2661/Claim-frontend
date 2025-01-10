import type { Metadata } from "next";
import { Niramit } from "next/font/google";
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

import "./globals.css";

const niramit = Niramit({
  variable: "--font-niramit",
  subsets: ["latin"],
  weight: ["400", "700"], // เลือกน้ำหนักฟ้อนต์ที่ต้องการ
  display: "swap",
});

export const metadata: Metadata = {
  title: "Claim System",
  description: "Claim System Specifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  if (typeof window !== "undefined") {
    // ทำงานเฉพาะบนฝั่งไคลเอนต์
  }

  return (
    <html lang="en" className="my-0">
      <body
        className={`${niramit.variable} antialiased m-0 h-[calc(100vh-110px)]`}
      >
        {children}
      </body>
    </html>
  );
}
