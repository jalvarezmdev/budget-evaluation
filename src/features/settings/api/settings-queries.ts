import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BudgetSettings } from '@/entities/budget/types';
import { settingsRepository } from '@/features/settings/api/settings-repository';

const SETTINGS_QUERY_KEY = ['settings'];

export function useSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: settingsRepository.get,
    enabled
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetSettings) => settingsRepository.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    }
  });
}
