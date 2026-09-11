import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BackendSuccessEnvelope } from '@/types/auth'
import type { InvitationStory } from '@/types/invitation-api'

export type StoryPayload = {
  yearOrDate: string
  title: string
  story: string
  imageUrl?: string | null
  order?: number
}

export type LoveStoryPayload = StoryPayload

export type UpdateStoryParams = {
  storyId: string
  payload: Partial<StoryPayload>
}

export type UpdateLoveStoryParams = UpdateStoryParams

export interface StoryMutationResult {
  data?: InvitationStory
  message?: string
}

/**
 * Hook aksi untuk mengelola momen cerita / linimasa (Story Timeline) sebuah undangan.
 * Mendukung berbagai kategori acara (Wedding, Khitanan, Aqiqah, Rasulan, dll).
 *
 * Endpoint:
 * - POST   /invitations/:invitationId/stories
 * - PATCH  /invitations/:invitationId/stories/:storyId
 * - DELETE /invitations/:invitationId/stories/:storyId
 *
 * @param invitationId - ID undangan yang sedang dikelola
 */
export function useStories(invitationId: string) {
  const queryClient = useQueryClient()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['invitation', invitationId] })
  }

  const addStory = useMutation<StoryMutationResult, Error, StoryPayload>({
    mutationFn: async (payload: StoryPayload) => {
      const res = await api.post<BackendSuccessEnvelope<InvitationStory>>(
        `/invitations/${invitationId}/stories`,
        payload,
      )
      return { data: res.data.data, message: res.data.message }
    },
    onSuccess: invalidate,
  })

  const updateStory = useMutation<StoryMutationResult, Error, UpdateStoryParams>({
    mutationFn: async ({ storyId, payload }: UpdateStoryParams) => {
      const res = await api.patch<BackendSuccessEnvelope<InvitationStory>>(
        `/invitations/${invitationId}/stories/${storyId}`,
        payload,
      )
      return { data: res.data.data, message: res.data.message }
    },
    onSuccess: invalidate,
  })

  const removeStory = useMutation<StoryMutationResult, Error, string>({
    mutationFn: async (storyId: string) => {
      const res = await api.delete<BackendSuccessEnvelope<null>>(
        `/invitations/${invitationId}/stories/${storyId}`,
      )
      return { message: res.data?.message }
    },
    onSuccess: invalidate,
  })

  return {
    addStory,
    updateStory,
    removeStory,
    isMutating: addStory.isPending || updateStory.isPending || removeStory.isPending,
  }
}

/** Alias untuk backward compatibility */
export const useLoveStories = useStories

