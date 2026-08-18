import type { Metadata } from "next";
import "./globals.css";
import Preloader from "@/components/common/Preloader";
import SmoothScroll from "@/components/common/SmoothScroll";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import CatalogueProvider from "@/components/providers/CatalogueProvider";
import AccountSync from "@/components/layout/AccountSync";

// Only run the Clerk-backed sync when Clerk is configured (needs a provider).
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata: Metadata = {
  title: "JessAura — Modern South Asian Dailywear & Casual Fashion",
  description:
    "Discover effortless everyday South Asian fashion at JessAura. Shop breathable cotton kurtis, short kurtas, linen palazzos, and relaxed dailywear for men and women. Comfort meets tradition.",
  keywords: [
    "JessAura",
    "casual ethnic wear",
    "dailywear kurti",
    "cotton kurtas",
    "short kurta",
    "linen palazzo",
    "everyday South Asian fashion",
    "ready-to-wear",
    "contemporary ethnic fashion",
  ],
  openGraph: {
    title: "JessAura — Modern South Asian Dailywear",
    description:
      "Breathable cottons, modern silhouettes, and effortless everyday clothing for men and women.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <CatalogueProvider>
            <SmoothScroll />
            <Preloader />
            {clerkEnabled && <AccountSync />}
            {children}
          </CatalogueProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
