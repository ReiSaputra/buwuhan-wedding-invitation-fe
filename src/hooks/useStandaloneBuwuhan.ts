import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteData, fetchData, patchData, postData } from '@/lib/api'
import type { ApiBuwuhan, ApiBuwuhanItem, BuwuhanPayload } from '@/types/invitation-api'

const LOCAL_STORAGE_KEY = 'buwuhan_standalone_records'

/** Mengambil data fallback dari localStorage */
function getLocalRecords(): ApiBuwuhan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Menyimpan data fallback ke localStorage */
function saveLocalRecords(records: ApiBuwuhan[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.warn('Gagal menyimpan ke localStorage:', err)
  }
}

/**
 * Custom React Hook untuk mengelola Catatan Buwuh Mandiri (Standalone)
 * yang tidak terikat pada undangan digital tertentu (khusus user non-undangan).
 *
 * Endpoint Backend:
 * - GET    /buwuhans/standalone
 * - POST   /buwuhans/standalone
 * - PATCH  /buwuhans/:id
 * - DELETE /buwuhans/:id
 *
 * Dilengkapi dengan fallback localStorage otomatis jika backend belum menyediakan
 * endpoint standalone, sehingga UI dapat langsung digunakan tanpa error.
 */
export function useStandaloneBuwuhan() {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['buwuhans', 'standalone'],
    queryFn: async () => {
      try {
        const data = await fetchData<ApiBuwuhan[]>('/buwuhans/standalone')
        // Sinkronkan ke cache lokal jika berhasil
        if (Array.isArray(data)) {
          saveLocalRecords(data)
          return data
        }
      } catch {
        // Fallback ke penyimpanan lokal jika endpoint backend belum siap (404/500)
      }
      return getLocalRecords()
    },
    staleTime: 1000 * 30, // 30 detik
  })

  function invalidateAll() {
    void queryClient.invalidateQueries({ queryKey: ['buwuhans', 'standalone'] })
  }

  const createMutation = useMutation({
    mutationFn: async (payload: BuwuhanPayload): Promise<ApiBuwuhan> => {
      try {
        return await postData<ApiBuwuhan, BuwuhanPayload>('/buwuhans/standalone', payload)
      } catch {
        // Fallback local creation
        const localItems: ApiBuwuhanItem[] = payload.items.map((item, idx) => ({
          id: `local-item-${Date.now()}-${idx}`,
          buwuhanId: `local-buwuhan-${Date.now()}`,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category ?? null,
          estimatedValue: item.estimatedValue ?? null,
          createdAt: new Date().toISOString(),
        }))

        const newRecord: ApiBuwuhan = {
          id: `local-buwuhan-${Date.now()}`,
          invitationId: payload.invitationId || 'standalone',
          giverName: payload.giverName,
          giverAddress: payload.giverAddress ?? null,
          note: payload.note ?? null,
          receivedAt: payload.receivedAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: localItems,
        }

        const current = getLocalRecords()
        saveLocalRecords([newRecord, ...current])
        return newRecord
      }
    },
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: BuwuhanPayload }): Promise<ApiBuwuhan> => {
      try {
        return await patchData<ApiBuwuhan, BuwuhanPayload>(`/buwuhans/${id}`, payload)
      } catch {
        // Fallback local update
        const current = getLocalRecords()
        const updated = current.map((rec) => {
          if (rec.id !== id) return rec
          const updatedItems: ApiBuwuhanItem[] = payload.items.map((item, idx) => ({
            id: rec.items[idx]?.id || `local-item-${Date.now()}-${idx}`,
            buwuhanId: rec.id,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category ?? null,
            estimatedValue: item.estimatedValue ?? null,
            createdAt: rec.createdAt,
          }))

          return {
            ...rec,
            invitationId: payload.invitationId !== undefined ? (payload.invitationId || 'standalone') : rec.invitationId,
            giverName: payload.giverName,
            giverAddress: payload.giverAddress ?? null,
            note: payload.note ?? null,
            receivedAt: payload.receivedAt || rec.receivedAt,
            updatedAt: new Date().toISOString(),
            items: updatedItems,
          }
        })
        saveLocalRecords(updated)
        return updated.find((r) => r.id === id)!
      }
    },
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteData(`/buwuhans/${id}`)
      } catch {
        // Fallback local delete
        const current = getLocalRecords()
        const filtered = current.filter((r) => r.id !== id)
        saveLocalRecords(filtered)
      }
    },
    onSuccess: invalidateAll,
  })

  const records = useMemo(() => listQuery.data ?? getLocalRecords(), [listQuery.data])

  return {
    records,
    addBuwuhan: (payload: BuwuhanPayload) => createMutation.mutateAsync(payload),
    updateBuwuhan: (id: string, payload: BuwuhanPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    removeBuwuhan: (id: string) => deleteMutation.mutateAsync(id),

    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
