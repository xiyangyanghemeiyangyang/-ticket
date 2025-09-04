import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import TrainsPage from './pages/TrainsPage';
import { useAppSelector } from './store/hooks';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();
  const onAuthPages = location.pathname === '/login' || location.pathname === '/register';
  return (
    <div className="min-h-screen bg-grayNeutral">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-primary font-semibold">Tickets</Link>
          <nav className="ml-auto flex gap-3 text-sm">
            {!isAuthenticated && (
              <>
                {!onAuthPages && <Link className="hover:underline" to="/login">登录</Link>}
                {!onAuthPages && <Link className="hover:underline" to="/register">注册</Link>}
              </>
            )}
            {isAuthenticated && !onAuthPages && (
              <>
                <Link className="hover:underline" to="/profile">个人中心</Link>
                <Link className="hover:underline" to="/trains">车次管理</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trains"
            element={
              <ProtectedRoute>
                <TrainsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}


