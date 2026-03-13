import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./hooks/useTheme";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Visits from "./pages/Visits";
import Settings from "./pages/Settings";
import Layout from "./components/layout/Layout";
import AuthGuard from "./components/layout/AuthGuard";

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 경로: 로그인 */}
        <Route path="/login" element={<Login />} />

        {/* 보호 경로: AuthGuard 내부에만 진입 가능 */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/customers" replace />} />
          <Route path="customers" element={<Customers />} />
          <Route path="visits" element={<Visits />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 알 수 없는 경로 → 루트로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
