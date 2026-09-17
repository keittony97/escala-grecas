"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { BottomSheet } from "@/components/bottom-sheet";
import { iniciais, formatarDataBR } from "@/lib/utils";
import { criarSoldado, atualizarSoldado, inativarSoldado } from "@/lib/actions/soldados";
import { criarAcessoSoldado, redefinirSenhaSoldado } from "@/lib/actions/acessos";
import { normalizarUsuario } from "@/lib/utils";
import type { Soldado } from "@/types";
import type { Funcao } from "@/types/database";

type Filtro = "todos" | Funcao;

export function SoldadosView({ soldadosIniciais }: { soldadosIniciais: Soldado[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [soldadoAcoes, setSoldadoAcoes] = useState<Soldado | null>(null);
  const [modalEditar, setModalEditar] = useState<Soldado | null>(null);
  const [modalInativar, setModalInativar] = useState<Soldado | null>(null);
  const [modalAcesso, setModalAcesso] = useState<Soldado | null>(null);
  const [acessoCriado, setAcessoCriado] = useState<{ nomeGuerra: string; usuario: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const contagem = {
    todos: soldadosIniciais.length,
    piscineiro: soldadosIniciais.filter((s) => s.funcao === "piscineiro").length,
    permanencia: soldadosIniciais.filter((s) => s.funcao === "permanencia").length,
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toUpperCase();
    return soldadosIniciais.filter((s) => {
      const matchFiltro = filtro === "todos" || s.funcao === filtro;
      const matchBusca = !q || s.nome_guerra.toUpperCase().includes(q);
      return matchFiltro && matchBusca;
    });
  }, [soldadosIniciais, busca, filtro]);

  async function handleAdicionar(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const res = await criarSoldado(formData);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setModalAdicionar(false);
      router.refresh();
    });
  }

  async function handleEditar(formData: FormData) {
    if (!modalEditar) return;
    setErro(null);
    startTransition(async () => {
      const res = await atualizarSoldado(modalEditar.id, formData);
      if (res?.erro) {
        setErro(res.erro);
        return;
      }
      setModalEditar(null);
      router.refresh();
    });
  }

  async function handleInativar() {
    if (!modalInativar) return;
    startTransition(async () => {
      await inativarSoldado(modalInativar.id, new Date().toISOString().slice(0, 10));
      setModalInativar(null);
      router.refresh();
    });
  }

  async function handleAcesso(formData: FormData) {
    if (!modalAcesso) return;
    setErro(null);
    const senha = String(formData.get("senha") ?? "");
    const confirmar = String(formData.get("confirmar_senha") ?? "");
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    const soldado = modalAcesso;
    startTransition(async () => {
      if (soldado.perfil_id) {
        const res = await redefinirSenhaSoldado(soldado.id, senha);
        if (res?.erro) {
          setErro(res.erro);
          return;
        }
        setModalAcesso(null);
      } else {
        const res = await criarAcessoSoldado(soldado.id, senha);
        if (res?.erro) {
          setErro(res.erro);
          return;
        }
        setModalAcesso(null);
        setAcessoCriado({
          nomeGuerra: soldado.nome_guerra,
          usuario: res.usuario ?? normalizarUsuario(soldado.nome_guerra),
        });
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col w-full px-gutter py-space-sm gap-space-md pb-12">
      <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg shadow-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon name="group" className="text-[24px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide truncate">
              Efetivo Militar Ativo
            </span>
            <div className="flex items-center gap-space-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-fixed-dim" />
              <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                {soldadosIniciais.length} Soldados Cadastrados
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalAdicionar(true)}
          className="flex items-center gap-1.5 px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded shadow-sm hover:bg-primary-container transition-colors active:scale-95 flex-shrink-0"
        >
          <Icon name="person_add" className="text-[18px]" />
          <span>+ Adicionar</span>
        </button>
      </div>

      <div className="flex flex-col gap-space-sm">
        <div className="relative w-full">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="BUSCAR NOME DE GUERRA..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface rounded font-body-md text-body-md placeholder:text-outline placeholder:font-label-sm uppercase focus:outline-none focus:bg-surface-container-low shadow-sm"
          />
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto pb-0.5">
          {(["todos", "piscineiro", "permanencia"] as Filtro[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-lg font-label-sm text-label-sm uppercase transition-all flex-shrink-0 ${
                filtro === f
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={f === "piscineiro" ? "pool" : f === "permanencia" ? "security" : "military_tech"} className="text-[16px]" />
              <span>
                {f === "todos" ? "Todos" : f === "piscineiro" ? "Piscineiro" : "Permanência"} ({contagem[f]})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        {filtrados.map((soldado) => (
          <div
            key={soldado.id}
            className="relative bg-surface-container-lowest rounded-lg p-space-md shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-sm min-w-0">
                <div className="w-11 h-11 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-headline-sm uppercase flex-shrink-0">
                  {iniciais(soldado.nome_guerra)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                      Sd. {soldado.nome_guerra}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase">
                      6º BEC
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase flex items-center gap-1">
                      <Icon
                        name={soldado.funcao === "piscineiro" ? "pool" : "security"}
                        className="text-[13px] text-primary"
                      />
                      {soldado.funcao === "piscineiro" ? "Piscineiro" : "Permanência"}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <Icon name="calendar_today" className="text-[13px]" />
                      {formatarDataBR(soldado.data_entrada)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!soldado.perfil_id && (
                  <span
                    className="w-2 h-2 rounded-full bg-outline"
                    title="Sem acesso ao sistema"
                  />
                )}
                <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase rounded">
                  Ativo
                </span>
                <button
                  type="button"
                  onClick={() => setSoldadoAcoes(soldado)}
                  className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                  aria-label={`Ações para ${soldado.nome_guerra}`}
                >
                  <Icon name="more_vert" className="text-[20px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-space-md text-center">
            Nenhum soldado encontrado.
          </p>
        )}
      </div>

      {/* Bottom sheet de ações */}
      <BottomSheet
        open={!!soldadoAcoes}
        onClose={() => setSoldadoAcoes(null)}
        title={soldadoAcoes ? `Sd. ${soldadoAcoes.nome_guerra}` : ""}
        icon="badge"
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setModalEditar(soldadoAcoes);
              setSoldadoAcoes(null);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-surface-container-low text-left transition-colors"
          >
            <Icon name="edit_note" className="text-on-surface-variant text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase text-on-surface">Editar Dados</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Alterar função, nome ou observação
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              if (soldadoAcoes) router.push(`/historico?id=${soldadoAcoes.id}`);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-surface-container-low text-left transition-colors"
          >
            <Icon name="history" className="text-on-surface-variant text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase text-on-surface">Ver Histórico</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Relatório de serviços e escalas cumpridas
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalAcesso(soldadoAcoes);
              setErro(null);
              setSoldadoAcoes(null);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-surface-container-low text-left transition-colors"
          >
            <Icon name={soldadoAcoes?.perfil_id ? "lock_reset" : "person_add"} className="text-on-surface-variant text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase text-on-surface">
                {soldadoAcoes?.perfil_id ? "Redefinir Senha" : "Criar Acesso ao Sistema"}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {soldadoAcoes?.perfil_id
                  ? "Definir uma nova senha de login"
                  : "Gerar login (nome de guerra + senha) para este soldado"}
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalInativar(soldadoAcoes);
              setSoldadoAcoes(null);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-error-container/30 hover:bg-error-container text-left transition-colors"
          >
            <Icon name="person_off" className="text-error text-[20px]" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase text-on-error-container">
                Inativar Soldado
              </span>
              <span className="font-body-sm text-body-sm text-on-error-container/80">
                Remover da rotatividade operacional
              </span>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Modal: adicionar soldado */}
      <BottomSheet
        open={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        title="Adicionar Novo Soldado"
        icon="person_add"
      >
        <form action={handleAdicionar} className="flex flex-col gap-space-md">
          <CampoTexto label="Nome de Guerra" name="nome_guerra" placeholder="EX: SOUZA" required uppercase />
          <CampoTexto label="Nome Completo (opcional)" name="nome_completo" placeholder="Nome completo" />
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Função Operacional
            </label>
            <div className="grid grid-cols-2 gap-space-sm">
              <RadioFuncao name="funcao" value="piscineiro" label="Piscineiro" sub="Manutenção/Parque" defaultChecked />
              <RadioFuncao name="funcao" value="permanencia" label="Permanência" sub="Guarda & Alojamento" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
              Data de Incorporação
            </label>
            <input
              name="data_entrada"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2.5 bg-surface-container-low rounded text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-sm"
            />
          </div>
          <CampoTexto label="Observação" name="observacao" placeholder="Opcional" />
          {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}
          <div className="flex items-center gap-space-sm pt-2">
            <button
              type="button"
              onClick={() => setModalAdicionar(false)}
              className="flex-1 py-3 bg-surface-container text-on-surface font-label-md text-label-md uppercase rounded hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 bg-primary text-on-primary font-label-md text-label-md uppercase rounded shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <Icon name="check" className="text-[18px]" />
              <span>Salvar Militar</span>
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Modal: editar soldado */}
      <BottomSheet
        open={!!modalEditar}
        onClose={() => setModalEditar(null)}
        title="Editar Soldado"
        icon="edit_note"
      >
        {modalEditar && (
          <form action={handleEditar} className="flex flex-col gap-space-md">
            <CampoTexto
              label="Nome de Guerra"
              name="nome_guerra"
              defaultValue={modalEditar.nome_guerra}
              required
              uppercase
            />
            <CampoTexto
              label="Nome Completo"
              name="nome_completo"
              defaultValue={modalEditar.nome_completo ?? ""}
            />
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
                Função Operacional
              </label>
              <div className="grid grid-cols-2 gap-space-sm">
                <RadioFuncao
                  name="funcao"
                  value="piscineiro"
                  label="Piscineiro"
                  sub="Manutenção/Parque"
                  defaultChecked={modalEditar.funcao === "piscineiro"}
                />
                <RadioFuncao
                  name="funcao"
                  value="permanencia"
                  label="Permanência"
                  sub="Guarda & Alojamento"
                  defaultChecked={modalEditar.funcao === "permanencia"}
                />
              </div>
            </div>
            <CampoTexto label="Observação" name="observacao" defaultValue={modalEditar.observacao ?? ""} />
            {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}
            <div className="flex items-center gap-space-sm pt-2">
              <button
                type="button"
                onClick={() => setModalEditar(null)}
                className="flex-1 py-3 bg-surface-container text-on-surface font-label-md text-label-md uppercase rounded hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-3 bg-primary text-on-primary font-label-md text-label-md uppercase rounded shadow-sm hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* Modal: criar acesso / redefinir senha */}
      <BottomSheet
        open={!!modalAcesso}
        onClose={() => setModalAcesso(null)}
        title={modalAcesso?.perfil_id ? "Redefinir Senha" : "Criar Acesso ao Sistema"}
        icon={modalAcesso?.perfil_id ? "lock_reset" : "person_add"}
      >
        {modalAcesso && (
          <form action={handleAcesso} className="flex flex-col gap-space-md">
            <div className="bg-surface-container-low p-space-sm rounded text-left flex items-start gap-2">
              <Icon name="info" className="text-secondary text-[20px] flex-shrink-0 mt-0.5" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Nome de guerra para login: <strong>{normalizarUsuario(modalAcesso.nome_guerra)}</strong>.
                Não há e-mail — o soldado entra apenas com nome de guerra e senha.
              </span>
            </div>
            <CampoTexto
              label="Senha"
              name="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
            />
            <CampoTexto
              label="Confirmar Senha"
              name="confirmar_senha"
              type="password"
              placeholder="Repita a senha"
              required
            />
            {erro && <p className="font-body-sm text-body-sm text-error">{erro}</p>}
            <div className="flex items-center gap-space-sm pt-2">
              <button
                type="button"
                onClick={() => setModalAcesso(null)}
                className="flex-1 py-3 bg-surface-container text-on-surface font-label-md text-label-md uppercase rounded hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-3 bg-primary text-on-primary font-label-md text-label-md uppercase rounded shadow-sm hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                {modalAcesso.perfil_id ? "Salvar Nova Senha" : "Criar Acesso"}
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* Confirmação de acesso criado */}
      {acessoCriado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter bg-inverse-surface/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl p-gutter shadow-2xl flex flex-col gap-space-md">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center mx-auto">
              <Icon name="check_circle" className="text-[28px]" />
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-1">
                Acesso Criado
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sd. {acessoCriado.nomeGuerra} já pode entrar no sistema com:
              </p>
            </div>
            <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-1 text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Nome de Guerra (login)
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">{acessoCriado.usuario}</span>
            </div>
            <button
              type="button"
              onClick={() => setAcessoCriado(null)}
              className="w-full py-3 bg-primary text-on-primary font-label-md text-label-md uppercase rounded shadow-sm hover:bg-primary-container transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Confirmação de inativação */}
      {modalInativar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter bg-inverse-surface/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl p-gutter shadow-2xl flex flex-col gap-space-md">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <Icon name="person_off" className="text-[28px]" />
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-1">
                Inativar Militar?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tem certeza que deseja inativar{" "}
                <strong className="text-on-surface">Sd. {modalInativar.nome_guerra}</strong>? Ele será
                movido para o histórico e removido das próximas escalas.
              </p>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded text-left flex items-start gap-2">
              <Icon name="info" className="text-secondary text-[20px] flex-shrink-0 mt-0.5" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                A escala das próximas semanas será recalculada automaticamente para a função{" "}
                {modalInativar.funcao === "piscineiro" ? "Piscineiro" : "Permanência"}.
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleInativar}
                disabled={pending}
                className="w-full py-3 bg-tertiary text-on-tertiary font-label-md text-label-md uppercase rounded shadow-sm hover:bg-tertiary-container transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60"
              >
                <Icon name="archive" className="text-[18px]" />
                <span>Inativar e Mover ao Histórico</span>
              </button>
              <button
                type="button"
                onClick={() => setModalInativar(null)}
                className="w-full py-2.5 bg-surface-container text-on-surface font-label-md text-label-md uppercase rounded hover:bg-surface-container-high transition-colors"
              >
                Manter Ativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CampoTexto({
  label,
  name,
  placeholder,
  required,
  uppercase,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  uppercase?: boolean;
  defaultValue?: string;
  type?: "text" | "password";
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`w-full px-3 py-2.5 bg-surface-container-low rounded text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-sm placeholder:text-outline ${
          uppercase ? "uppercase" : ""
        }`}
      />
    </div>
  );
}

function RadioFuncao({
  name,
  value,
  label,
  sub,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  sub: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="relative flex items-center gap-2 p-3 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container has-[:checked]:bg-primary-container has-[:checked]:text-on-primary-container transition-all">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="accent-primary"
      />
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm uppercase font-bold">{label}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span>
      </div>
    </label>
  );
}
