import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL as string;

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );

  useEffect(() => {
    console.log("AuthGuard: 세션 체크 시작...", {
      OWNER_EMAIL_SET: !!OWNER_EMAIL,
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("AuthGuard 세션 조회 실패 상세:", {
            message: error.message,
            status: error.status,
            name: error.name,
          });
          setStatus("denied");
          return;
        }

        const session = data.session;
        console.log("AuthGuard: 세션 데이터 수신 성공", {
          hasSession: !!session,
        });

        if (!session) {
          setStatus("denied");
          return;
        }

        const userEmail = session.user.email ?? "";
        if (!OWNER_EMAIL) {
          console.error("VITE_OWNER_EMAIL 환경 변수가 설정되지 않았습니다.");
          setStatus("denied");
          return;
        }

        if (userEmail.toLowerCase() !== OWNER_EMAIL.trim().toLowerCase()) {
          console.warn("허용되지 않은 이메일 접근:", userEmail);
          supabase.auth.signOut().then(() => setStatus("denied"));
          return;
        }

        setStatus("allowed");
      })
      .catch((err) => {
        console.error("AuthGuard 예외 발생:", err);
        setStatus("denied");
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("인증 상태 변경됨:", _event);
        if (!session) setStatus("denied");
      },
    );

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
