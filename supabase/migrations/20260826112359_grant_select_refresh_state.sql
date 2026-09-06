-- refresh_state는 claim/release RPC(SECURITY DEFINER)를 통해서만 쓰기가 되지만,
-- 직접 SELECT는 service_role에도 부여되어 있지 않았습니다(다른 5개 테이블과 달리
-- 이 테이블만 GRANT를 명시하지 않고 만들었습니다). 운영 상태 조회용이라 민감정보가
-- 아니므로 service_role에 읽기 권한을 추가합니다. anon/authenticated는 여전히 불가합니다.
grant select on public.refresh_state to service_role;
