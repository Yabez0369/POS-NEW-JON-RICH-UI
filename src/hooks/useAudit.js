import { useQuery } from '@tanstack/react-query'
import { fetchAuditLogs } from '@/services/audit'

export function useAuditLogs(filters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30_000,
  })
}
