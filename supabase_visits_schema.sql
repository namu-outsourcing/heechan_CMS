-- 3. 방문 기록 테이블 생성
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  visited_at DATE NOT NULL,
  payment_amount INT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash')),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visits 테이블 RLS 설정 (편의상 전체 허용)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all actions for public users on visits" ON visits
  FOR ALL
  USING (true)
  WITH CHECK (true);
