//逻辑存储
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../../types/user';
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../../api/auth';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  currentUser: null,
  loading: false,
  error: null,
};

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; phoneNumber: string; password: string }) => {
    return apiRegister(payload);
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { account: string; password: string }) => {//显式定义输入参数
    return apiLogin(payload);
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await apiLogout();
});

export const restoreSessionThunk = createAsyncThunk('auth/restore', async () => {
  const user = await getCurrentUser();
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {//处理action
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.currentUser = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.currentUser = null;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.currentUser = action.payload;
          state.token = 'restored';
        }
      });
  },
});

export default authSlice.reducer;


