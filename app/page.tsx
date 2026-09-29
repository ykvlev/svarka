import type { Metadata } from "next";
import Landing from "@/components/landing";
import { siteUrl } from "@/lib/site-url";
import { SITE } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const productName = "Кантователь для садового трактора и райдера";

function structuredData() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${base}/#product`,
        name: productName,
        description:
          "Кантователь для очистки деки, замены ножей и обслуживания садового райдера. Стальная рама, ручная лебёдка, порошковая окраска, размеры 1200 × 300 и 1300 × 300 мм.",
        image: [`${base}/images/work.png`, `${base}/images/caiman.jpg`],
        brand: { "@type": "Brand", name: SITE.brand },
        material: "Сталь",
        offers: {
          "@type": "Offer",
          url: `${base}/#order`,
          price: SITE.price,
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          areaServed: { "@type": "Country", name: "Россия" },
          seller: { "@id": `${base}/#business` },
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${base}/#business`,
        name: "Кантователь — изготовление под заказ",
        description:
          "Изготовление кантователей для садовых тракторов и райдеров на заказ в Великом Новгороде.",
        url: base,
        telephone: SITE.phoneDisplay,
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.city,
          addressCountry: "RU",
        },
        sameAs: [SITE.telegram, SITE.vk],
      },
    ],
  };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is static and built from local constants only.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
      <Landing />
    </>
  );
}
