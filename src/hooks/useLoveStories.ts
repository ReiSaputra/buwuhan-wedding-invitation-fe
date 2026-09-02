import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteData, patchData, postData } from '@/lib/api'
import type { ApiLoveStory } from '@/types/invitation-api'

export type LoveStoryPayload = {
  yearOrDate: string
  title: string
  story: string
  imageUrl?: string | null
  order?: number
}

export type UpdateLoveStoryParams = {
  storyId: string
  payload: Partial<LoveStoryPayload>
}

/**
 * Hook aksi untuk mengelola momen kisah cinta (Love Story) sebuah undangan.
 *
 * Endpoint:
 * - POST   /invitations/:invitationId/stories
 * - PATCH  /invitations/:invitationId/stories/:storyId
 * - DELETE /invitations/:invitationId/stories/:storyId
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useLoveStories(invitationId: string) {
  const queryClient = useQueryClient()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
  }

  const addStory = useMutation({
    mutationFn: (payload: LoveStoryPayload) =>
      postData<ApiLoveStory, LoveStoryPayload>(
        `/invitations/${invitationId}/stories`,
        payload,
      ),
    onSuccess: invalidate,
  })

  const updateStory = useMutation({
    mutationFn: ({ storyId, payload }: UpdateLoveStoryParams) =>
      patchData<ApiLoveStory, Partial<LoveStoryPayload>>(
        `/invitations/${invitationId}/stories/${storyId}`,
        payload,
      ),
    onSuccess: invalidate,
  })

  const removeStory = useMutation({
    mutationFn: (storyId: string) =>
      deleteData(`/invitations/${invitationId}/stories/${storyId}`),
    onSuccess: invalidate,
  })

  return {
    addStory,
    updateStory,
    removeStory,
    isMutating: addStory.isPending || updateStory.isPending || removeStory.isPending,
  }
}
