import { useQuery } from '@tanstack/react-query'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import { queryKeys } from '@lib/query/keys'
import { getBoard, getBoards } from '@services/boards/boards'

export function useBoards(orgId: number) {
  const session = useAppSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined

  return useQuery({
    queryKey: queryKeys.boards.list(orgId),
    queryFn: () => getBoards(orgId, accessToken!),
    enabled: !!orgId && !!accessToken,
    staleTime: 60_000,
  })
}

export function useBoard(boardUuid: string) {
  const session = useAppSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined

  return useQuery({
    queryKey: queryKeys.boards.detail(boardUuid),
    queryFn: () => getBoard(boardUuid, accessToken!),
    enabled: !!boardUuid && !!accessToken,
    staleTime: 60_000,
  })
}
