"use client";

import { useCallback, useEffect, useState } from "react";
import CinemaHero from "@/components/cinema-hero";
import ConstructionSection from "@/components/construction-section";
import ContactSection from "@/components/contact-section";
import FeaturesSection from "@/components/features-section";
import GallerySection from "@/components/gallery-section";
import OrderSection from "@/components/order-section";
import PhotoDialog from "@/components/photo-dialog";
import RequestDialog from "@/components/request-dialog";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SpecStrip from "@/components/spec-strip";
import { CONTACT_METHODS, SIZES, type ColorKey } from "@/lib/site";

export default function Landing() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [color, setColor] = useState<ColorKey>("gray");
  const [size, setSize] = useState<string>(SIZES[0]);
  const [method, setMethod] = useState<string>(CONTACT_METHODS[0]);
  const [photo, setPhoto] = useState<string | null>(null);

  const openRequest = useCallback(() => setRequestOpen(true), []);

  // Optional host integration: lets an assistant open the request form.
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "open_request_form",
          description: "Открывает форму заявки, без отправки.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          execute: (input: unknown) => {
            if (
              !input ||
              typeof input !== "object" ||
              Array.isArray(input) ||
              Object.keys(input).length
            ) {
              throw new Error("Ожидается пустой объект");
            }
            setRequestOpen(true);
            return { opened: true };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, []);

  return (
    <>
      <SiteHeader onRequest={openRequest} />
      <main>
        <CinemaHero onRequest={openRequest} />
        <ConstructionSection color={color} onColorChange={setColor} />
        <SpecStrip />
        <FeaturesSection />
        <GallerySection onOpenPhoto={setPhoto} />
        <OrderSection size={size} onSizeChange={setSize} onRequest={openRequest} />
        <ContactSection />
      </main>
      <SiteFooter />
      <RequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        size={size}
        color={color}
        method={method}
        onMethodChange={setMethod}
      />
      <PhotoDialog photo={photo} onClose={() => setPhoto(null)} />
    </>
  );
}
