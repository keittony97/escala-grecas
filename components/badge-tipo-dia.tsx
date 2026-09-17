import type { TipoDia } from "@/types/database";
import { cn } from "@/lib/utils";

export function BadgeTipoDia({
  tipo,
  className,
}: {
  tipo: TipoDia;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded font-label-sm text-label-sm uppercase font-bold tracking-wider",
        tipo === "preta"
          ? "bg-dia-preta text-surface-container-lowest"
          : "bg-dia-vermelha text-surface-container-lowest",
        className
      )}
    >
      {tipo === "preta" ? "Preto" : "Vermelho"}
    </span>
  );
}
