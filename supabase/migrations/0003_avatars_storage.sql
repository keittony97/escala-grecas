-- Bucket "avatars": fotos de perfil dos usuários (público para leitura —
-- exibido no topo do app e nos cartões de escala; escrita restrita a cada
-- usuário sobre a própria pasta, nomeada pelo seu auth.uid()).
--
-- Se o bucket ainda não existir neste projeto, crie-o antes de rodar este
-- arquivo (Dashboard > Storage > New bucket "avatars", marcar como Public),
-- ou via API:
--   curl -X POST 'https://SEU-PROJETO.supabase.co/storage/v1/bucket' \
--     -H "apikey: SERVICE_ROLE_KEY" -H "Authorization: Bearer SERVICE_ROLE_KEY" \
--     -H 'Content-Type: application/json' \
--     -d '{"id":"avatars","name":"avatars","public":true,"file_size_limit":5242880,"allowed_mime_types":["image/png","image/jpeg","image/webp"]}'

drop policy if exists avatars_leitura_publica on storage.objects;
create policy avatars_leitura_publica on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_upload_propria_pasta on storage.objects;
create policy avatars_upload_propria_pasta on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update_propria_pasta on storage.objects;
create policy avatars_update_propria_pasta on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_delete_propria_pasta on storage.objects;
create policy avatars_delete_propria_pasta on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
