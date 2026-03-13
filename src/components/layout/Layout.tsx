import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarClock,
  LineChart,
  LogOut,
  Settings2,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useThemeStore } from "../../hooks/useTheme";

export default function Layout() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900 font-sans"}`}>
      <header className={`border-b transition-colors duration-300 sticky top-0 z-40 ${isDarkMode ? "bg-slate-900/80 backdrop-blur-md border-slate-800" : "bg-white border-gray-200"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className={`w-8 h-8 mr-2 shadow-sm overflow-hidden rounded-lg ${isDarkMode ? "ring-1 ring-slate-700" : ""}`}>
                  <img src="/logo.png" alt="Theo Barbershop" className="w-full h-full object-cover" />
                </div>
                <span className={`text-xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  theo barbershop
                </span>
              </div>
              <nav className="hidden sm:ml-10 sm:flex sm:space-x-8 h-full">
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-all ${
                      isActive 
                        ? (isDarkMode ? "border-blue-400 text-blue-400" : "border-blue-600 text-blue-600") 
                        : (isDarkMode ? "border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300")
                    }`
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  고객 관리
                </NavLink>
                <NavLink
                  to="/visits"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-all ${
                      isActive 
                        ? (isDarkMode ? "border-blue-400 text-blue-400" : "border-blue-600 text-blue-600") 
                        : (isDarkMode ? "border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300")
                    }`
                  }
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  방문 기록
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-all ${
                      isActive 
                        ? (isDarkMode ? "border-blue-400 text-blue-400" : "border-blue-600 text-blue-600") 
                        : (isDarkMode ? "border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300")
                    }`
                  }
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  매출 대시보드
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-all ${
                      isActive 
                        ? (isDarkMode ? "border-blue-400 text-blue-400" : "border-blue-600 text-blue-600") 
                        : (isDarkMode ? "border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300")
                    }`
                  }
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  시스템 설정
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? "text-yellow-400 hover:bg-slate-800" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                title="로그아웃"
                className={`p-2 transition-colors rounded-full ${
                  isDarkMode 
                    ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" 
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 하단 네비게이션용 (필요시 활성화, 현재는 PC 최적화 원칙) */}
      <div className={`fixed bottom-0 w-full border-t sm:hidden z-40 flex transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium transition-colors ${
              isActive 
                ? (isDarkMode ? "text-blue-400" : "text-blue-600") 
                : (isDarkMode ? "text-slate-500" : "text-gray-500")
            }`
          }
        >
          <Users className="w-6 h-6 mb-1" />
          고객 관리
        </NavLink>
        <NavLink
          to="/visits"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium transition-colors ${
              isActive 
                ? (isDarkMode ? "text-blue-400" : "text-blue-600") 
                : (isDarkMode ? "text-slate-500" : "text-gray-500")
            }`
          }
        >
          <CalendarClock className="w-6 h-6 mb-1" />
          방문 기록
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium transition-colors ${
              isActive 
                ? (isDarkMode ? "text-blue-400" : "text-blue-600") 
                : (isDarkMode ? "text-slate-500" : "text-gray-500")
            }`
          }
        >
          <LineChart className="w-6 h-6 mb-1" />
          대시보드
        </NavLink>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-24 sm:pb-12">
        <Outlet />
      </main>
    </div>
  );
}
