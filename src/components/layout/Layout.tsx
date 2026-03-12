import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarClock,
  LineChart,
  LogOut,
  Settings2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex justify-center items-center mr-2 shadow-sm">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Hair CMS
                </span>
              </div>
              <nav className="hidden sm:ml-10 sm:flex sm:space-x-8 h-full">
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"}`
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  고객 관리
                </NavLink>
                <NavLink
                  to="/visits"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"}`
                  }
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  방문 기록
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"}`
                  }
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  매출 대시보드
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"}`
                  }
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  시스템 설정
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                title="로그아웃"
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 하단 네비게이션용 (필요시 활성화, 현재는 PC 최적화 원칙) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 sm:hidden z-40 flex">
        <NavLink
          to="/customers"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`
          }
        >
          <Users className="w-6 h-6 mb-1" />
          고객 관리
        </NavLink>
        <NavLink
          to="/visits"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`
          }
        >
          <CalendarClock className="w-6 h-6 mb-1" />
          방문 기록
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 py-3 text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`
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
