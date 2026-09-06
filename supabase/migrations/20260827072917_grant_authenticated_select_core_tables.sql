-- authenticated 대상 SELECT RLS 정책은 create_learning_data_schema 에서 이미 5개 테이블에
-- 만들어졌지만, 테이블 자체에 SELECT GRANT가 없어 정책이 무효였던 문제를 해결합니다.
-- (Postgres는 GRANT가 없으면 RLS 정책과 무관하게 접근 자체를 거부합니다.)
--
-- RLS 정책은 건드리지 않고, anon에는 권한을 주지 않으며, SELECT 외 권한도 추가하지 않습니다.
grant select on public.material_metadata to authenticated;
grant select on public.relations to authenticated;
grant select on public.learning_documents to authenticated;
grant select on public.comparisons to authenticated;
grant select on public.study_guides to authenticated;
