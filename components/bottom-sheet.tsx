"use client";

import { Icon } from "@/components/icon";

export function BottomSheet({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-inverse-surface/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-xl p-gutter flex flex-col gap-space-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="w-12 h-1 bg-surface-container-highest rounded-full self-center" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">
              <Icon name={icon} className="text-[20px]" />
            </div>
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
            aria-label="Fechar"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
