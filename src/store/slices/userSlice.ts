import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { updateProfile, verifyIdentityMock } from '../../api/auth';
import type { UserProfile } from '../../types/user';

interface UserLocalState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserLocalState = {
  profile: null,
  loading: false,
  error: null,
};

export const updateProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (payload: Partial<Pick<UserProfile, 'name' | 'phoneNumber' | 'identityNumber'>>) => {
    return updateProfile(payload);
  }
);

export const verifyThunk = createAsyncThunk('user/verify', async () => {
  return verifyIdentityMock();
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新失败';
      })
      .addCase(verifyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(verifyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '认证失败';
      });
  },
});

export const { setProfile } = userSlice.actions;
export default userSlice.reducer;


