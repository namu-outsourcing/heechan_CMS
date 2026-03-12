import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 디버깅을 위한 환경 변수 상태 확인 (보안을 위해 일부만 노출)
console.log("Supabase 초기화 시도:", {
  urlExists: !!supabaseUrl,
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : "없음",
  keyExists: !!supabaseAnonKey,
  keyPrefix: supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 10)}...`
    : "없음",
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경 변수가 설정되지 않았습니다. .env 파일이나 배포 플랫폼의 환경 변수 설정을 확인해주세요.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
