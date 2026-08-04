import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ResumeIQ - AI Resume Analyzer & Interview Coach",
  description: "Transform your resume with instant AI feedback, ATS optimization, and tailored interview prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
