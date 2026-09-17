"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase";
import { iniciais, normalizarUsuario } from "@/lib/utils";
import { atualizarMinhaSenha, atualizarMeuLogin, atualizarMinhaFoto } from "@/lib/actions/perfil";
import type { Perfil } from "@/types";

const TAMANHO_MAX_FOTO = 5 * 1024 * 1024;

export function PerfilView({ perfil, usuarioAtual }: { perfil: Perfil; usuarioAtual: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotoUrl, setFotoUrl] = useState(perfil.foto_url);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  const [novoUsuario, setNovoUsuario] = useState(usuarioAtual);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [sucessoLogin, setSucessoLogin] = useState<string | null>(null);
  const [pendingLogin, startLoginTransition] = useTransition();

  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState<string | null>(null);
  const [pendingSenha, startSenhaTransition] = useTransition();

  async function handleFotoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setErroFoto(null);
    if (!file.type.startsWith("image/")) {
      setErroFoto("Selecione um arquivo de imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (file.size > TAMANHO_MAX_FOTO) {
      setErroFoto("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setEnviandoFoto(true);
    try {
      const supabase = createClient();
      const extensao = file.name.split(".").pop() || "jpg";
      const caminho = `${perfil.id}/avatar.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from("avatars")
        .upload(caminho, file, { upsert: true, contentType: file.type });

      if (erroUpload) {
        setErroFoto(erroUpload.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
      const urlComCacheBust = `${data.publicUrl}?t=${Date.now()}`;

      const res = await atualizarMinhaFoto(urlComCacheBust);
      if (res?.erro) {
        setErroFoto(res.erro);
        return;
      }

      setFotoUrl(urlComCacheBust);
      router.refresh();
    } catch {
      setErroFoto("Falha ao enviar a foto. Tente novamente.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function handleAlterarLogin(formData: FormData) {
    setErroLogin(null);
    setSucessoLogin(null);
    const senhaAtual = String(formData.get("senha_atual_login") ?? "");

    startLoginTransition(async () => {
      const res = await atualizarMeuLogin(novoUsuario, senhaAtual);
      if (res?.erro) {
        setErroLogin(res.erro);
        return;
      }
      setSucessoLogin(`Login atualizado para "${res.usuario}". Use-o no próximo acesso.`);
      router.refresh();
    });
  }

  async function handleAlterarSenha(formData: FormData) {
    setErroSenha(null);
    setSucessoSenha(null);
    const senhaAtual = String(formData.get("senha_atual") ?? "");
    const novaSenha = String(formData.get("nova_senha") ?? "");
    const confirmarSenha = String(formData.get("confirmar_nova_senha") ?? "");

    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    startSenhaTransition(async () => {
      const res = await atualizarMinhaSenha(senhaAtual, novaSenha);
      if (res?.erro) {
        setErroSenha(res.erro);
        return;
      }
      setSucessoSenha("Senha atualizada com sucesso.");
    });
  }

  return (
    <div className="flex flex-col w-full px-gutter py-space-md gap-space-lg pb-12">
      <div className="flex flex-col items-center gap-space-sm bg-surface-container-low rounded-xl p-space-lg shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-container flex items-center justify-center shadow-md">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- vem do Storage do Supabase, sem domínio fixo conhecido
              <img src={fotoUrl} alt={perfil.nome_guerra ?? "Foto de perfil"} className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-primary-container">
                {iniciais(perfil.nome_guerra ?? perfil.nome_completo)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={enviandoFoto}
            aria-label="Alterar foto de perfil"
            className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            <Icon name={enviandoFoto ? "sync" : "photo_camera"} className={`text-[18px] ${enviandoFoto ? "animate-spin" : ""}`} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFotoSelecionada}
          />
        </div>
        <div className="flex flex-col items-center text-center">
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase">
            {perfil.nome_completo}
          </h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {perfil.role === "admin" ? "Administrador" : "Soldado"}
          </span>
        </div>
        {erroFoto && <p className="font-body-sm text-body-sm text-error text-center">{erroFoto}</p>}
      </div>

      <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="badge" className="text-primary text-[20px]" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase">
            Nome de Guerra / Login
          </h3>
        </div>
        <form action={handleAlterarLogin} className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Novo Login
            </label>
            <input
              type="text"
              value={novoUsuario}
              onChange={(e) => setNovoUsuario(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-container-lowest rounded text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {novoUsuario && normalizarUsuario(novoUsuario) !== usuarioAtual && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Novo login será: <strong>{normalizarUsuario(novoUsuario)}</strong>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Senha Atual (confirmação)
            </label>
            <input
              name="senha_atual_login"
              type="password"
              required
              placeholder="Digite sua senha para confirmar"
              className="w-full px-3 py-2.5 bg-surface-container-lowest rounded text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          {erroLogin && <p className="font-body-sm text-body-sm text-error">{erroLogin}</p>}
          {sucessoLogin && (
            <p className="font-body-sm text-body-sm text-primary flex items-center gap-1">
              <Icon name="check_circle" className="text-[16px]" />
              {sucessoLogin}
            </p>
          )}
          <button
            type="submit"
            disabled={pendingLogin || normalizarUsuario(novoUsuario) === usuarioAtual}
            className="self-start px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded shadow-sm hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {pendingLogin ? "Salvando..." : "Salvar Novo Login"}
          </button>
        </form>
      </div>

      <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="key" className="text-primary text-[20px]" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase">
            Alterar Senha
          </h3>
        </div>
        <form action={handleAlterarSenha} className="flex flex-col gap-space-sm">
          <CampoSenha label="Senha Atual" name="senha_atual" />
          <CampoSenha label="Nova Senha" name="nova_senha" placeholder="Mínimo 6 caracteres" />
          <CampoSenha label="Confirmar Nova Senha" name="confirmar_nova_senha" />
          {erroSenha && <p className="font-body-sm text-body-sm text-error">{erroSenha}</p>}
          {sucessoSenha && (
            <p className="font-body-sm text-body-sm text-primary flex items-center gap-1">
              <Icon name="check_circle" className="text-[16px]" />
              {sucessoSenha}
            </p>
          )}
          <button
            type="submit"
            disabled={pendingSenha}
            className="self-start px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded shadow-sm hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {pendingSenha ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CampoSenha({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
        {label}
      </label>
      <input
        name={name}
        type="password"
        required
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-surface-container-lowest rounded text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
      />
    </div>
  );
}
