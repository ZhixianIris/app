import { useQuery } from '@tanstack/react-query'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import { queryKeys } from '@lib/query/keys'
import { getActivityWithAuthHeader } from '@services/courses/activities'

export function useActivity(activityUuid: string) {
  const session = useAppSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined

  return useQuery({
    queryKey: queryKeys.activity.detail(activityUuid),
    queryFn: () => getActivityWithAuthHeader(activityUuid, {}, accessToken),
    enabled: !!activityUuid,
    staleTime: 60_000,
  })
}
