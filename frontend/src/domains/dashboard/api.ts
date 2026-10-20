import { apiFetch } from '@/lib/api/client';
import type { DashboardSummary } from '@/types/dashboard.types';

export const dashboardApi = {
  get: () => apiFetch<DashboardSummary>('/dashboard')
};
