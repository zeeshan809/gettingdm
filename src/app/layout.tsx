import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_DOMAIN, APP_NAME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION = "Automatically DM everyone who comments your keyword on Instagram Reels and posts. Comment-to-DM automation for Indian creators, from ₹99/month.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${APP_DOMAIN}`),
  title: { default: `${APP_NAME} · Instagram comment-to-DM automation`, template: `%s · ${APP_NAME}` },
  description: DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["Instagram DM automation", "comment to DM", "auto DM Instagram", "Instagram automation India", "ManyChat alternative", "link in bio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} · Turn Instagram comments into DMs`,
    description: DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: `${APP_NAME} · Turn Instagram comments into DMs`, description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#E9E8F8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
