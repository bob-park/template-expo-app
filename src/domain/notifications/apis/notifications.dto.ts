import { User } from '@/shared/providers/auth/AuthProvider';

type NotificationType = 'IOS' | 'ANDROID' | 'SLACK' | 'SMTP' | 'FLOW' | 'FLOW_HOOKS';

interface NotificationProvider {
  id: number;
  type: NotificationType;
  name: string;
  options?: {
    token: string;
  };
}

interface UserNotificationProvider {
  id: string;
  provider: NotificationProvider;
  user?: User;
  enabled: boolean;
}

export type { NotificationType, NotificationProvider, UserNotificationProvider };
