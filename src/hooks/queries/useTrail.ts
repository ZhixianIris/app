import { useQuery } from '@tanstack/react-query'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import { queryKeys } from '@lib/query/keys'
import { getAPIUrl } from '@services/config/config'
import { apiFetch } from '@services/utils/ts/requests'

async function fetchTrail(orgId: number, accessToken?: string) {
  const url = `${getAPIUrl()}trail/org/${orgId}/trail`
  return apiFetch(url, accessToken)
}

export function useTrail(orgId: number | undefined) {
  const session = useAppSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined

  return useQuery({
    queryKey: queryKeys.trail.org(orgId!),
    queryFn: () => fetchTrail(orgId!, accessToken),
    enabled: !!orgId,
    staleTime: 30_000,
  })
}
