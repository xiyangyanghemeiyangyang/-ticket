import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { setProfile } from '../store/slices/userSlice';
import { getCurrentUser } from '../api/auth';
import { updateProfileThunk, verifyThunk } from '../store/slices/userSlice';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.auth);
  const user = useAppSelector((s) => s.user);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  useEffect(() => {
    (async () => {
      if (!auth.currentUser) {
        const u = await getCurrentUser();
        if (u) dispatch(setProfile(u));
      } else {
        dispatch(setProfile(auth.currentUser));
      }
    })();
  }, [auth.currentUser, dispatch]);

  useEffect(() => {
    if (user.profile) {
      setName(user.profile.name);
      setPhoneNumber(user.profile.phoneNumber);
      setIdentityNumber(user.profile.identityNumber || '');
    }
  }, [user.profile]);

  const canSave = useMemo(() => name.trim() && phoneNumber.trim().length >= 6, [name, phoneNumber]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    await dispatch(updateProfileThunk({ name: name.trim(), phoneNumber: phoneNumber.trim(), identityNumber: identityNumber.trim() }))
      .unwrap()
      .catch(() => {});
  };

  const onVerify = async () => {
    await dispatch(verifyThunk()).unwrap().catch(() => {});
  };

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  if (!user.profile) {
    return <div className="text-sm text-gray-600">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-lg bg-white p-4 rounded-md shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">个人中心</h1>
        <button onClick={onLogout} className="text-sm text-red-600">退出</button>
      </div>
      <div className="mb-3 text-sm">
        身份认证：
        {user.profile.isVerified ? (
          <span className="ml-2 text-green-600">已认证</span>
        ) : (
          <button onClick={onVerify} className="ml-2 text-primary underline">去认证(模拟)</button>
        )}
      </div>
      <form onSubmit={onSave} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">姓名</label>
          <input className="w-full border rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">手机号</label>
          <input className="w-full border rounded-md px-3 py-2" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">身份证号</label>
          <input className="w-full border rounded-md px-3 py-2" value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} />
        </div>
        {user.error && <div className="text-red-600 text-sm">{user.error}</div>}
        <button type="submit" disabled={!canSave || user.loading} className="bg-primary text-white rounded-md px-4 py-2 disabled:opacity-60">保存</button>
      </form>
    </div>
  );
}


