import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAppSelector } from './store/hooks';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-grayNeutral">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-primary font-semibold">Tickets</Link>
          <nav className="ml-auto flex gap-3 text-sm">
            <Link className="hover:underline" to="/login">登录</Link>
            <Link className="hover:underline" to="/register">注册</Link>
            <Link className="hover:underline" to="/profile">个人中心</Link>
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
        </Routes>
      </main>
    </div>
  );
}


