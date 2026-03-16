import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCashSessions, openSession, closeSession, addMovement } from '@/services/cash'

export function useCashSessions(counterId) {
  return useQuery({
    queryKey: ['cash-sessions', counterId],
    queryFn: () => fetchCashSessions(counterId),
    staleTime: 10_000,
  })
}

export function useOpenCashSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: openSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-sessions'] }),
  })
}

export function useCloseCashSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: closeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-sessions'] }),
  })
}

export function useAddCashMovement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addMovement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cash-sessions'] }),
  })
}
