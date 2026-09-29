import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const title = "Кантователь для райдера — 19 000 ₽ с доставкой";
const description =
  "Кантователь для садового трактора и райдера: стальная рама, ручная лебёдка, порошковая окраска. Размеры 1200 × 300 и 1300 × 300 мм, изготовление под вашу технику, доставка СДЭК по России включена в цену.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${title} | ${SITE.city}`,
    template: `%s | ${SITE.brand}`,
  },
  description,
  applicationName: SITE.brand,
  keywords: [
    "кантователь",
    "кантователь для райдера",
    "кантователь для садового трактора",
    "подъёмник для райдера",
    "обслуживание деки райдера",
    "замена ножей райдера",
    "Великий Новгород",
  ],
  authors: [{ name: SITE.owner }],
  creator: SITE.owner,
  publisher: SITE.brand,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE.brand,
    title: `${title} | ${SITE.city}`,
    description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Кантователь для садового трактора — 19 000 ₽ с доставкой",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE.city}`,
    description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  formatDetection: { telephone: true, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#171721",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
