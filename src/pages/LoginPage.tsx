import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, restoreSessionThunk } from '../store/slices/authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(restoreSessionThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tickets', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const canSubmit = useMemo(() => account.trim().length >= 3 && password.length >= 6, [account, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await dispatch(loginThunk({ account: account.trim(), password }))
      .unwrap()
      .then(() => {
        navigate('/tickets');
      })
      .catch(() => {});
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold mb-4">登录</h1>
      <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-md shadow-subtle">
        <div>
          <label className="block text-sm mb-1">手机号 / 账号</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="请输入手机号或账号"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">密码</label>
          <input
            type="password"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少6位"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full bg-primary text-white rounded-md px-3 py-2 disabled:opacity-60"
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <div className="text-sm text-gray-600">没有账号？<Link className="text-primary" to="/register">去注册</Link></div>
      </form>
    </div>
  );
}


