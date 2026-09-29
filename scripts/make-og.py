"""Builds public/og.png (1200x630) for link previews.

Run from the project root:  python scripts/make-og.py

Cyrillic text needs a real font, which the bundled Next.js OG renderer does not
ship, so the card is composed ahead of time and committed as a static asset.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "images" / "hero-landscape.png"
TARGET = ROOT / "public" / "og.png"

BOLD_FONT = Path(r"C:\Windows\Fonts\arialbd.ttf")
REGULAR_FONT = Path(r"C:\Windows\Fonts\arial.ttf")

WIDTH, HEIGHT = 1200, 630
INK = (237, 237, 243)
MUTED = (200, 200, 212)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        sys.exit(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size)


def darken(image: Image.Image) -> Image.Image:
    """Darkens the photo so overlaid text stays readable at small sizes."""
    xs = np.linspace(0.0, 1.0, WIDTH)[None, :]
    ys = np.linspace(0.0, 1.0, HEIGHT)[:, None]
    alpha = 128 + 92 * np.clip(1.0 - xs, 0.0, 1.0) ** 1.1 + 70 * np.clip(ys - 0.3, 0.0, 1.0)
    mask = Image.fromarray(np.clip(alpha, 0, 240).astype("uint8"), "L")
    shade = Image.new("RGB", image.size, (10, 12, 18))
    return Image.composite(shade, image, mask)


def tracked(draw: ImageDraw.ImageDraw, xy, text, fnt, fill, spacing=4):
    """Draws text with manual letter spacing (no tracking control in Pillow)."""
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=fnt, fill=fill)
        x += draw.textlength(char, font=fnt) + spacing


def build() -> None:
    if not SOURCE.exists():
        sys.exit(f"Source image not found: {SOURCE}")

    photo = Image.open(SOURCE).convert("RGB")
    # Cover-fit the hero landscape, keeping the tractor-side of the frame.
    scale = max(WIDTH / photo.width, HEIGHT / photo.height)
    resized = photo.resize((round(photo.width * scale), round(photo.height * scale)), Image.LANCZOS)
    left = (resized.width - WIDTH) // 2
    top = int((resized.height - HEIGHT) * 0.35)
    card = darken(resized.crop((left, top, left + WIDTH, top + HEIGHT)))

    draw = ImageDraw.Draw(card)
    h1 = font(BOLD_FONT, 74)
    lead = font(REGULAR_FONT, 30)
    eyebrow = font(BOLD_FONT, 21)
    price = font(BOLD_FONT, 27)

    tracked(draw, (82, 148), "ВЕЛИКИЙ НОВГОРОД", eyebrow, MUTED)

    draw.text((80, 186), "Кантователь", font=h1, fill=INK)
    draw.text((80, 272), "для садового трактора", font=h1, fill=INK)

    draw.text(
        (82, 380),
        "Очистка деки, замена ножей, обслуживание райдера",
        font=lead,
        fill=MUTED,
    )

    label = "19 000 ₽  ·  доставка СДЭК включена"
    text_width = draw.textlength(label, font=price)
    box = (80, 448, 80 + text_width + 64, 448 + 68)
    draw.rounded_rectangle(box, radius=34, fill=(82, 102, 235), outline=None)
    draw.text((box[0] + 32, box[1] + 19), label, font=price, fill=(255, 255, 255))

    card.save(TARGET, "PNG", optimize=True)
    print(f"wrote {TARGET.relative_to(ROOT)} ({TARGET.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
