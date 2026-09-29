import { SPECS } from "@/lib/site";

export default function SpecStrip() {
  return (
    <div className="spec-strip wrap">
      {SPECS.map((spec) => (
        <div key={spec.label}>
          <span>{spec.label.toUpperCase()}</span>
          <strong>{spec.value}</strong>
        </div>
      ))}
    </div>
  );
}
