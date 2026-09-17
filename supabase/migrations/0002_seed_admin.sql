-- Bootstrap do administrador (Erivan Arraiz).
--
-- 1) Crie o usuário no Supabase Auth (Dashboard > Authentication > Users > Add user,
--    ou via `supabase.auth.admin.createUser`) com o e-mail/senha de acesso do Erivan.
-- 2) Copie o UUID gerado para esse usuário e substitua '<UUID_DO_ERIVAN>' abaixo.
-- 3) Rode este script (ou o insert manualmente) para vincular o perfil de admin.

-- insert into perfis (id, nome_completo, nome_guerra, role)
-- values ('<UUID_DO_ERIVAN>', 'Erivan Arraiz', 'Arraiz', 'admin')
-- on conflict (id) do update set role = 'admin';
