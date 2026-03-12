-- ① 고객 메모 컬럼 추가 (customers 테이블)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS memo TEXT;

-- ② 시술 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS service_categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ③ 시술 카테고리 RLS 설정 (전체 허용)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enable all on service_categories" ON service_categories
  FOR ALL USING (true) WITH CHECK (true);

-- ④ 기본 시술 데이터 삽입
INSERT INTO service_categories (name, price) VALUES
  ('커트', 15000),
  ('염색', 80000),
  ('펌', 100000),
  ('클리닉', 30000),
  ('드라이', 10000)
ON CONFLICT DO NOTHING;
