import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS as string || "").split(",");

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("로그인 시도 시작:", {
      inputEmail: email.trim().toLowerCase(),
      allowedEmails: ALLOWED_EMAILS,
      isMatch: ALLOWED_EMAILS.some(e => e.trim().toLowerCase() === email.trim().toLowerCase()),
    });

    // 1단계: 이메일 화이트리스트 검사 (앞단 차단)
    if (
      ALLOWED_EMAILS.length === 0 ||
      !ALLOWED_EMAILS.some(e => e.trim().toLowerCase() === email.trim().toLowerCase())
    ) {
      console.warn("화이트리스트 검증 실패");
      setError("접근 권한이 없습니다. 관리자 이메일 설정을 확인해주세요.");
      setIsLoading(false);
      return;
    }

    console.log("Supabase 로그인 시도 중...");

    // 2단계: Supabase 이메일+비밀번호 인증
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (authError) {
        console.error("Supabase 인증 에러 상세:", authError);
        if (authError.message.includes("Email not confirmed")) {
          setError("이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
        } else {
          setError(`로그인 실패: ${authError.message}`);
        }
        setIsLoading(false);
        return;
      }

      console.log("로그인 성공! 세션 데이터:", data);
      navigate("/customers");
    } catch (err) {
      console.error("로그인 프로세스 중 예외 발생:", err);
      setError("시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-lg mb-4 overflow-hidden border border-gray-100 dark:border-slate-800 transition-all">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">theo barbershop</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 transition-colors">관리자 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 transition-colors">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 transition-colors">
                이메일
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="이메일 주소 입력"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 transition-colors">
                비밀번호
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-rose-900/20 border border-red-200 dark:border-rose-900/30 rounded-xl text-sm text-red-600 dark:text-rose-400 font-bold transition-all animate-in shake-in duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-black rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              {isLoading ? "로그인 중..." : "시스템 접속"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-8 font-medium transition-colors">
          이 시스템은 관리자 전용입니다.
        </p>
      </div>
    </div>
  );
}
