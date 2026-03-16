import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBanners, createBanner, updateBanner, deleteBanner, toggleBannerActive } from '@/services/banners'

export function useBanners(venueId) {
  return useQuery({
    queryKey: ['banners', venueId],
    queryFn: () => fetchBanners(venueId),
    staleTime: 30_000,
  })
}

export function useCreateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useUpdateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => updateBanner(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useToggleBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }) => toggleBannerActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  })
}
