import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { setProfile } from '../store/slices/userSlice';
import { getCurrentUser } from '../api/auth';
import { updateProfileThunk, verifyThunk } from '../store/slices/userSlice';
import { addPassenger, listPassengers, removePassenger } from '../api/passengers';
import { listOrders } from '../api/orders';
import type { OrderItem } from '../types/order';
import type { Passenger } from '../types/order';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.auth);
  const user = useAppSelector((s) => s.user);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [pName, setPName] = useState('');
  const [pId, setPId] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [openInfo, setOpenInfo] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);

  useEffect(() => {
    (async () => {
      if (!auth.currentUser) {
        const u = await getCurrentUser();
        if (u) dispatch(setProfile(u));
      } else {
        dispatch(setProfile(auth.currentUser));
      }
      const ps = await listPassengers();
      setPassengers(ps);
      const os = await listOrders();
      setOrders(os);
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

  const onAddPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pId.trim()) return;
    const created = await addPassenger({ name: pName.trim(), identityNumber: pId.trim() });
    setPassengers((prev) => [created, ...prev]);
    setPName('');
    setPId('');
  };

  const onRemovePassenger = async (id: string) => {
    await removePassenger(id);
    setPassengers((prev) => prev.filter((p) => p.id !== id));
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

      {/* 个人信息 - 折叠 */}
      <button onClick={() => setOpenInfo((v) => !v)} className="w-full flex items-center justify-between py-2">
        <span className="text-lg font-semibold">个人信息</span>
        <span className="text-sm text-gray-600">{openInfo ? '收起' : '展开'}</span>
      </button>
      {openInfo && (
        <div className="mt-2">
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
      )}

      <div className="mt-6">
        <button onClick={() => setOpenPassengers((v) => !v)} className="w-full flex items-center justify-between py-2">
          <span className="text-lg font-semibold">乘车人管理</span>
          <span className="text-sm text-gray-600">{openPassengers ? '收起' : '展开'}</span>
        </button>
        {openPassengers && (
          <div className="mt-2">
            <form onSubmit={onAddPassenger} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input className="border rounded-md px-3 py-2" placeholder="姓名" value={pName} onChange={(e) => setPName(e.target.value)} />
              <input className="border rounded-md px-3 py-2" placeholder="身份证号" value={pId} onChange={(e) => setPId(e.target.value)} />
              <button type="submit" className="bg-primary text-white rounded-md px-4 py-2">添加</button>
            </form>
            {passengers.length === 0 ? (
              <div className="text-sm text-gray-600">暂无乘车人</div>
            ) : (
              <div className="border rounded-md divide-y">
                {passengers.map((p) => (
                  <div key={p.id} className="px-3 py-2 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-gray-600">{p.identityNumber}</div>
                    </div>
                    <button onClick={() => onRemovePassenger(p.id)} className="text-red-600 text-xs">删除</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button onClick={() => setOpenOrders((v) => !v)} className="w-full flex items-center justify-between py-2">
          <span className="text-lg font-semibold">历史订单</span>
          <span className="text-sm text-gray-600">{openOrders ? '收起' : '展开'}</span>
        </button>
        {openOrders && (
          <div className="mt-2">
            {orders.length === 0 ? (
              <div className="text-sm text-gray-600">暂无订单</div>
            ) : (
              <div className="border rounded-md divide-y">
                {orders.map((o) => (
                  <span key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="block px-3 py-2 text-sm hover:bg-grayNeutral rounded cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{o.trainNo} · {o.seatClass}</div>
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-gray-700 mt-1">
                      订单号：{o.id} · 乘客数：{o.passengerIds.length} · 金额：¥{o.totalPrice}
                    </div>
                    <div className="text-xs mt-1">状态：{o.status}</div>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


