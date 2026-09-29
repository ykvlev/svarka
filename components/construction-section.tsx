"use client";

import { Rotate3D } from "lucide-react";
import Model from "@/components/product-model";
import { COLORS, type ColorKey } from "@/lib/site";

const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

export default function ConstructionSection({
  color,
  onColorChange,
}: {
  color: ColorKey;
  onColorChange: (color: ColorKey) => void;
}) {
  return (
    <section className="model-section wrap" id="explore">
      <div className="model-intro">
        <h2>Конструкция</h2>
        <p>Стальная рама с ручной лебёдкой и колёсами для перемещения</p>
        <a className="ghost" href="#order">
          Размеры и комплектация
        </a>
      </div>
      <div className="hero-product">
        <div className="model-label">
          <span>3D-МОДЕЛЬ</span>
          <span>ОБЗОР 360°</span>
        </div>
        <Model color={color} />
        <div className="model-bottom">
          <span>
            <Rotate3D size={18} />
            Поверните модель
          </span>
          <div className="swatches">
            {COLOR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={`${COLORS[key].label} цвет`}
                aria-pressed={color === key}
                className={`swatch ${key}`}
                onClick={() => onColorChange(key)}
              />
            ))}
            <span>{COLORS[color].label}</span>
          </div>
        </div>
        <p className="model-note">Модель по фотографиям — детали уточним при заказе</p>
      </div>
    </section>
  );
}
