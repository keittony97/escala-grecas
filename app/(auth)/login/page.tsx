"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Icon } from "@/components/icon";
import { emailSinteticoDeUsuario } from "@/lib/utils";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const supabase = createClient();
      const email = emailSinteticoDeUsuario(usuario);
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

      if (error) {
        setErro("Identidade ou senha inválida. Verifique e tente novamente.");
        setCarregando(false);
        return;
      }

      // Navegação hard (não router.push) para garantir que o servidor releia
      // o cookie de sessão recém-gravado antes de renderizar as rotas do app.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/escala";
    } catch {
      setErro("Falha de conexão. Verifique sua rede e tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <main className="flex flex-col relative w-full bg-surface flex-grow">
      <div className="flex flex-col w-full px-margin pb-space-xl pt-space-lg max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-space-lg relative">
          <div className="relative mb-space-sm flex items-center justify-center">
            <div className="relative p-1 bg-surface-container rounded-full shadow-md">
              <Image
                src="/brand/brasao-grecas.png"
                alt="Brasão Oficial GRECAS 6º BEC"
                width={112}
                height={112}
                className="w-28 h-28 object-contain drop-shadow-md"
              />
            </div>
            <div className="absolute -bottom-2 bg-secondary text-surface rounded px-2 py-0.5 shadow flex items-center gap-1 border border-secondary-fixed">
              <Icon name="military_tech" className="text-[13px] text-secondary-container" filled />
              <span className="font-label-sm text-label-sm text-on-secondary uppercase font-semibold tracking-wider">
                6º BEC
              </span>
            </div>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wide uppercase mt-1">
            ESCALA GRECAS
          </h1>
          <div className="flex items-center gap-space-xs mt-0.5">
            <span className="w-2 h-0.5 bg-secondary" />
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              6º Batalhão de Engenharia de Construção • Boa Vista - RR
            </p>
            <span className="w-2 h-0.5 bg-secondary" />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
            Sistema Integrado de Escala de Serviços
          </p>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-lg p-space-lg shadow-md mb-space-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
          <div className="flex items-center justify-between mb-space-md pt-space-xs">
            <div className="flex items-center gap-space-xs">
              <Icon name="lock_open" className="text-primary text-[20px]" filled />
              <span className="font-label-md text-label-md text-primary uppercase">
                Autenticação do Efetivo
              </span>
            </div>
          </div>
          <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="usuario">
                Nome de Guerra
              </label>
              <div className="relative flex items-center">
                <Icon name="badge" className="absolute left-space-sm text-outline text-[20px]" />
                <input
                  id="usuario"
                  type="text"
                  required
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ex: Arraiz"
                  className="w-full pl-10 pr-space-md py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded placeholder-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-inner"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="senha">
                Senha de Acesso
              </label>
              <div className="relative flex items-center">
                <Icon name="key" className="absolute left-space-sm text-outline text-[20px]" />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded placeholder-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-colors shadow-inner"
                />
                <button
                  type="button"
                  aria-label="Alternar visibilidade da senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-space-sm text-outline hover:text-on-surface transition-colors p-1 flex items-center justify-center"
                >
                  <Icon name={mostrarSenha ? "visibility_off" : "visibility"} className="text-[20px]" />
                </button>
              </div>
            </div>

            {erro && (
              <div className="p-space-sm bg-error-container text-on-error-container rounded font-body-sm text-body-sm flex items-center gap-space-xs">
                <Icon name="error" className="text-[18px]" />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full mt-space-xs py-3 px-space-md bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded shadow-md flex items-center justify-center gap-space-sm transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <span>{carregando ? "Autenticando..." : "ENTRAR NO SISTEMA"}</span>
              {!carregando && <Icon name="login" className="text-[20px] text-secondary-container" />}
            </button>
          </form>
        </div>

        <div className="w-full mt-auto pt-space-xs pb-space-sm flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-secondary mb-1">
            <Icon name="warning" className="text-[18px]" />
            <span className="font-label-md text-label-md uppercase tracking-wider">
              Aviso de Segurança Tática
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
            Uso exclusivo do efetivo militar do 6º BEC e clube GRECAS.
          </p>
        </div>
      </div>
    </main>
  );
}
