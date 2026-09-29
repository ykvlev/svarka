"use client";

import { MoveUpRight } from "lucide-react";
import { GALLERY } from "@/lib/site";

export default function GallerySection({
  onOpenPhoto,
}: {
  onOpenPhoto: (file: string) => void;
}) {
  return (
    <section className="section wrap" id="photos">
      <div className="gallery-heading">
        <div>
          <h2>Фото в работе</h2>
        </div>
      </div>
      <div className="gallery">
        {GALLERY.map((item) => (
          <button
            className="photo-card"
            type="button"
            key={item.file}
            onClick={() => onOpenPhoto(item.file)}
          >
            <div>
              <img
                src={`/images/${item.file}`}
                alt={`Кантователь с райдером ${item.title}`}
                loading="lazy"
              />
              <span>
                <MoveUpRight size={18} />
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </button>
        ))}
      </div>
      <p className="small">Размер подберём по модели вашего райдера</p>
    </section>
  );
}
