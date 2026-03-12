-- hair_cms Supabase Database Schema (Phase 1)

-- 1. 고객 테이블 생성
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  visit_cycle INT NOT NULL CHECK (visit_cycle IN (2, 3, 4)), -- 기준: 2주, 3주, 4주
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS(Row Level Security) 설정
-- 테스트 및 개인 사용 목적이므로 인증 여부와 무관하게 모든 권한을 허용 (public) 하거나 정책 적용 가능성에 대비합니다.
-- 개발 환경 간편화를 위해 우선 모두 허용
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all actions for public users" ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. 더미 데이터(선택)
-- INSERT INTO customers (name, phone, visit_cycle) VALUES ('홍길동', '010-1234-5678', 3);
