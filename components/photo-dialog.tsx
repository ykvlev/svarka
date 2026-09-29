"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PhotoDialog({
  photo,
  onClose,
}: {
  photo: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(photo)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="photo-modal">
        <DialogTitle className="sr-only">Кантователь в работе</DialogTitle>
        <DialogDescription className="sr-only">Фотография изделия</DialogDescription>
        {photo && <img src={`/images/${photo}`} alt="Кантователь в работе" />}
      </DialogContent>
    </Dialog>
  );
}
