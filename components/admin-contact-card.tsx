import Image from "next/image";
import { Icon } from "@/components/icon";

export function AdminContactCard() {
  return (
    <div className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-md">
        <div className="relative flex-shrink-0">
          <Image
            src="/brand/admin-continencia.png"
            alt="Administrador prestando continência"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover shadow-sm bg-surface-container-highest"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center shadow-sm">
            <Icon name="military_tech" className="text-[13px]" filled />
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
            Coordenação de Escala
          </span>
          <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface truncate">
            Erivan Arraiz
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Secretário Administrativo
          </p>
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
        Em caso de dúvida ou solicitação de alterações na escala, falar com{" "}
        <strong>Erivan Arraiz (Administrador)</strong>.
      </p>
    </div>
  );
}
