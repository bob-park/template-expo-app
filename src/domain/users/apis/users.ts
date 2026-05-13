import { UserDetail } from '@/domain/users/apis/users.dto';
import api, { generateAuthHeader } from '@/shared/api';
import type { AuthRequestHeader } from '@/shared/api/common.dto';

export async function getUserDetail(id: string, { accessToken }: AuthRequestHeader) {
  return api.get(`api/v1/users/${id}`, { headers: generateAuthHeader(accessToken) }).json<UserDetail>();
}
