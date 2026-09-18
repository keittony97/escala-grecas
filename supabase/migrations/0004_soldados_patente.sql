-- Adiciona a patente do soldado, selecionável pelo administrador no cadastro.
-- Default 'soldado' preserva o comportamento atual ("Sd.") para quem já está cadastrado.

alter table soldados add column if not exists patente text not null default 'soldado';

alter table soldados drop constraint if exists soldados_patente_check;
alter table soldados add constraint soldados_patente_check check (
  patente in (
    'soldado',
    'cabo',
    'terceiro_sargento',
    'segundo_sargento',
    'primeiro_sargento',
    'subtenente',
    'aspirante',
    'segundo_tenente',
    'primeiro_tenente',
    'capitao',
    'major',
    'tenente_coronel',
    'coronel'
  )
);
