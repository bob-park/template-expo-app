import api, { generateAuthHeader } from '@/shared/api';

export async function getUserDetail(id: string) {
  return api.get(`api/v1/users/${id}`).json<UserDetail>();
}
