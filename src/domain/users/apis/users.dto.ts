import { UserRole } from '@/shared/providers/auth/AuthProvider';

interface UserRoleDetail {
  id: string;
  type: UserRole;
  description?: string;
}

interface UserDetail {
  id: string;
  userId: string;
  username: string;
  role: UserRoleDetail;
  email?: string;
}

export type { UserDetail, UserRoleDetail };
