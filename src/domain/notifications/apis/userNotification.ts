import { NotificationType, UserNotificationProvider } from '@/domain/notifications/apis/notifications.dto';
import api, { generateAuthHeader } from '@/shared/api';
import { AuthRequestHeader } from '@/shared/api/common.dto';

export async function getUserNotifications({ userUniqueId }: { userUniqueId: string }) {
  return api.get(`api/v1/users/${userUniqueId}/notification`).json<UserNotificationProvider[]>();
}

export async function createUserNotification(
  { accessToken }: AuthRequestHeader,
  {
    userUniqueId,
    type,
    notificationToken,
  }: {
    userUniqueId: string;
    type: NotificationType;
    notificationToken: string;
  },
) {
  return api
    .post(`api/v1/users/${userUniqueId}/notification`, {
      headers: generateAuthHeader(accessToken),
      json: { type, options: { token: notificationToken } },
    })
    .json<UserNotificationProvider>();
}

export async function updateUserNotificationProvider({
  userUniqueId,
  userProviderId,
  enabled,
}: {
  userUniqueId: string;
  userProviderId: string;
  enabled: boolean;
}) {
  return api
    .put(`api/v1/users/${userUniqueId}/notification/${userProviderId}`, {
      json: { enabled },
    })
    .json<UserNotificationProvider>();
}

export async function deleteUserNotificationProvider({
  userUniqueId,
  userProviderId,
}: {
  userUniqueId: string;
  userProviderId: string;
}) {
  return api.delete(`api/v1/users/${userUniqueId}/notification/${userProviderId}`).json<{ id: string }>();
}
