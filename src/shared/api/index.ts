import delay from '@/utils/delay';

import ky from 'ky';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '';

export function generateAuthHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

const index = ky.extend({
  prefix: API_HOST,
  hooks: {
    beforeRequest: [],
    afterResponse: [({ request, options, response }) => {}],
  },
});

export function getNextPageParams<T>(lastPage: PagedModel<T>, sort?: string) {
  const { totalPages, number, size } = lastPage.page;

  const nextPage = number + 1;

  if (nextPage > totalPages - 1) {
    return null;
  }

  return {
    size,
    page: nextPage,
    sort,
  };
}

export async function waitForDelay<T>(req: Promise<T>, delayTime: number = 1_000) {
  const result = Promise.allSettled([req, delay(delayTime)]);

  return result.then(([item]) => {
    if (item.status === 'rejected') {
      throw new Error(item.reason);
    }

    return item.value;
  });
}

export default index;
