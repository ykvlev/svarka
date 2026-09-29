"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLORS, CONTACT_METHODS, SITE, type ColorKey } from "@/lib/site";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: string;
  color: ColorKey;
  method: string;
  onMethodChange: (method: string) => void;
};

export default function RequestDialog({
  open,
  onOpenChange,
  size,
  color,
  method,
  onMethodChange,
}: Props) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          size,
          color: COLORS[color].label,
          method,
        }),
      });
      const result = (await response.json()) as { message: string };
      setStatus(result.message);
      if (response.ok) form.reset();
    } catch {
      setStatus(
        "Не удалось отправить. Попробуйте ещё раз или напишите Сергею в Telegram.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="request-modal">
        <DialogTitle className="modal-title">Оставить заявку</DialogTitle>
        <DialogDescription>Сергей свяжется с вами по заказу</DialogDescription>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>
              Ваше имя
              <input
                name="name"
                required
                maxLength={80}
                autoComplete="given-name"
                placeholder="Как к вам обращаться"
              />
            </label>
            <label>
              Телефон
              <input
                name="phone"
                required
                type="tel"
                minLength={10}
                maxLength={25}
                autoComplete="tel"
                placeholder="+7 999 123-45-67"
              />
            </label>
          </div>
          <label>
            Соцсеть или @ник <small>необязательно</small>
            <input
              name="social"
              maxLength={180}
              placeholder="Telegram, ВКонтакте или ссылка"
            />
          </label>
          <label htmlFor="request-method">Как удобнее связаться</label>
          <Select value={method} onValueChange={onMethodChange}>
            <SelectTrigger className="size-select" id="request-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_METHODS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label>
            Модель райдера <small>необязательно</small>
            <input name="rider" maxLength={120} placeholder="Марка и модель вашей техники" />
          </label>
          <label>
            Комментарий <small>необязательно</small>
            <textarea
              name="comment"
              maxLength={1500}
              rows={2}
              placeholder="Пожелания по размеру или цвету"
            />
          </label>
          <input
            className="honeypot"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <p className="small">
            {size} / {COLORS[color].label}
          </p>
          <p className="small">
            Нажимая «Отправить заявку», вы соглашаетесь передать указанные данные Сергею через
            Telegram для связи по этому заказу.
          </p>
          <button className="primary submit" disabled={busy}>
            {busy ? "Отправляем…" : "Отправить заявку"}
          </button>
          {status && (
            <p role="status" className="form-status">
              {status}{" "}
              <a href={SITE.telegram} target="_blank" rel="noreferrer">
                Telegram Сергея
              </a>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
