import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Puncak Travellers | Healthy Adventures in Indonesia's Highlands",
  description:
    "Join Puncak Travellers for trail runs, healthy walks, camping trips, and community adventures across Indonesia's mountain regions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
