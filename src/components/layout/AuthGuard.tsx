import { useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  // 개발 및 디버깅을 위해 일시적으로 인증을 항상 허용함
  useEffect(() => {
    console.log("⚠️ AuthGuard: 인증 기능이 일시적으로 비활성화된 상태입니다.");
    // 기존 인증 로직은 유지하되 로깅만 수행 (필요 시 나중에 복구 가능)
    supabase.auth.getSession().then(({ data }) => {
       console.log("현재 세션 상태 (디버깅):", !!data.session);
    });
  }, []);

  return <>{children}</>;
}
