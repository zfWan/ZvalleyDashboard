// import request from '@/utils/request'
import type { Statistics } from '@/types'

/**
 * Fetch dashboard statistics.
 *
 * NOTE: This skeleton ships without a real backend. A local mock implementation
 * is used here so the example flow works out of the box. When a real backend is
 * available, replace the body with:
 *
 *   return request.get<Statistics, Statistics>('/dashboard/statistics')
 */
export function getStatistics(): Promise<Statistics> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: 1280,
        orders: 3642,
        revenue: 987654,
        visits: 15234,
      })
    }, 300)
  })
}
