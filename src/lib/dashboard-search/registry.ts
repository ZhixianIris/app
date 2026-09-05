import type { SearchMeta } from './types'

import { searchMeta as home } from '@/app/orgs/[orgslug]/dash/page.search'
import { searchMeta as courses } from '@/app/orgs/[orgslug]/dash/courses/page.search'
import { searchMeta as coursesMigrate } from '@/app/orgs/[orgslug]/dash/courses/migrate/page.search'
import { searchMeta as assignments } from '@/app/orgs/[orgslug]/dash/assignments/page.search'
import { searchMeta as communities } from '@/app/orgs/[orgslug]/dash/communities/page.search'
import { searchMeta as podcasts } from '@/app/orgs/[orgslug]/dash/podcasts/page.search'
import { searchMeta as boards } from '@/app/orgs/[orgslug]/dash/boards/page.search'
import { searchMeta as playgrounds } from '@/app/orgs/[orgslug]/dash/playgrounds/page.search'
import { searchMeta as analytics } from '@/app/orgs/[orgslug]/dash/analytics/page.search'
import { searchMetas as users } from '@/app/orgs/[orgslug]/dash/users/page.search'
import { searchMetas as org } from '@/app/orgs/[orgslug]/dash/org/page.search'
import { searchMetas as payments } from '@/app/orgs/[orgslug]/dash/payments/page.search'
import { searchMetas as account } from '@/app/orgs/[orgslug]/(withmenu)/account/page.search'

export const dashboardPages: SearchMeta[] = [
  home,
  courses,
  coursesMigrate,
  assignments,
  communities,
  podcasts,
  boards,
  playgrounds,
  analytics,
  ...users,
  ...org,
  ...payments,
  ...account,
]

/**
 * Resolve a search-result href to its final URL. Results carry org-relative
 * paths; external links pass through untouched and already-final /orgs/ paths
 * are guarded against double prefixing.
 */
export function resolveSearchHref(href: string, orgslug: string | undefined | null): string {
  if (/^https?:\/\//i.test(href)) return href
  if (href.startsWith('/orgs/')) return href
  if (!orgslug) return href
  return `/orgs/${orgslug}${href}`
}
