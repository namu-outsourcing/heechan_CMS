import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL as string;

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
      targetEmail: OWNER_EMAIL?.trim().toLowerCase(),
      isMatch: email.trim().toLowerCase() === OWNER_EMAIL?.trim().toLowerCase(),
    });

    // 1단계: 이메일 화이트리스트 검사 (앞단 차단)
    if (
      !OWNER_EMAIL ||
      email.trim().toLowerCase() !== OWNER_EMAIL.trim().toLowerCase()
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-extrabold text-3xl">H</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hair CMS</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="이메일 주소 입력"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          이 시스템은 관리자 전용입니다.
        </p>
      </div>
    </div>
  );
}
