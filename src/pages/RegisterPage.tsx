import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerThunk } from '../store/slices/authSlice';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/profile', { replace: true });
  }, [isAuthenticated, navigate]);

  const canSubmit = useMemo(
    () => Boolean(name.trim()) && phoneNumber.trim().length >= 6 && password.length >= 6,
    [name, phoneNumber, password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await dispatch(registerThunk({ name: name.trim(), phoneNumber: phoneNumber.trim(), password })).unwrap()
      .then(() => navigate('/profile'))
      .catch(() => {});
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold mb-4">注册</h1>
      <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-md shadow-subtle">
        <div>
          <label className="block text-sm mb-1">姓名</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入姓名"
            minLength={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">手机号</label>
          <input
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="请输入手机号"
            minLength={6}
            required
            inputMode="tel"
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
            minLength={6}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" disabled={!canSubmit || loading} className="w-full bg-primary text-white rounded-md px-3 py-2 disabled:opacity-60">{loading ? '注册中...' : '注册'}</button>
        <div className="text-sm text-gray-600">已有账号？<Link className="text-primary" to="/login">去登录</Link></div>
      </form>
    </div>
  );
}


