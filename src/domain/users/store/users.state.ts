import { UserInfo } from '@/shared/providers/auth/AuthProvider';

type UserState = {
  userinfo?: UserInfo;
  isLoggedIn: boolean;
  loggedIn: (userinfo: UserInfo) => void;
  loggedOut: () => void;
};

export type { UserState };
