-- visits 테이블에 선택된 시술 목록(services)을 저장할 컬럼 추가
ALTER TABLE visits ADD COLUMN IF NOT EXISTS services TEXT[];

-- 기존에 생성한 customers 메모 컬럼 확인 (이미 수행했으나 안전을 위해 유지)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS memo TEXT;
