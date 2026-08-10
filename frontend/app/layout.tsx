import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "DevPath",
    template: "%s · DevPath",
  },
  description: "AI-powered career intelligence and developer growth platform.",
  openGraph: {
    title: "DevPath — Navigate your career with intelligence.",
    description:
      "Understand your skills, identify gaps, and build a personalized growth path with AI career intelligence.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "DevPath career intelligence graph" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPath — Navigate your career with intelligence.",
    description: "AI career intelligence for a clearer path forward.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
