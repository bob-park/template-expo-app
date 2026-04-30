import api, { generateAuthHeader } from '@/shared/api';

export async function getUserDetail(id: string, { accessToken }: AuthRequestHeader) {
  return api.get(`api/v1/users/${id}`, { headers: generateAuthHeader(accessToken) }).json<UserDetail>();
}
