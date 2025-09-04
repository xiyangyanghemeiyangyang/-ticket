export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  identityNumber: string;
  isVerified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: UserProfile | null;
  loading: boolean;
  error: string | null;
}

