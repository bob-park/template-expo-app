import { useContext } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { NotificationType, UserNotificationProvider } from '@/domain/notifications/apis/notifications.dto';
import {
  createUserNotification,
  getUserNotifications,
  updateUserNotificationProvider,
} from '@/domain/notifications/apis/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { QueryMutationHandle } from '@/shared/queries';

export function useUserNotification(
  { userUniqueId }: { userUniqueId: string },
  { onSuccess }: QueryMutationHandle<UserNotificationProvider>,
) {
  const { accessToken } = useContext(AuthContext);

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userUniqueId, 'notification', 'create'],
    mutationFn: (req: { type: NotificationType; notificationToken: string }) =>
      createUserNotification({ accessToken }, { ...req, userUniqueId }),
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
  });

  return { createUserNotification: mutate, isLoading: isPending };
}

export function useUserNotifications({ userUniqueId }: { userUniqueId?: string }) {
  const { data, isLoading } = useQuery<UserNotificationProvider[]>({
    queryKey: ['users', userUniqueId, 'notifications', 'providers'],
    queryFn: () => getUserNotifications({ userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { notificationProviders: data || [], isLoading };
}

export function useUpdateUserNotification(
  { userUniqueId }: { userUniqueId: string },
  { onSuccess }: QueryMutationHandle<UserNotificationProvider>,
) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', userUniqueId, 'notification', 'update'],
    mutationFn: ({ userProviderId, enabled }: { userProviderId: string; enabled: boolean }) =>
      updateUserNotificationProvider({ userUniqueId, userProviderId, enabled }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users', userUniqueId, 'notifications'] });
    },
  });

  return { updateProvider: mutate, isLoading: isPending };
}
