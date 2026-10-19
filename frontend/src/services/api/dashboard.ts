import { apiFetch } from './client';
import type { DashboardResumen } from '@/types';

export const dashboardApi = {
  get: () => apiFetch<DashboardResumen>('/dashboard'),
};
