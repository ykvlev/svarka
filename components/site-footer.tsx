import { SITE } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="wrap">
      <span>{SITE.brand.toUpperCase()}</span>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
