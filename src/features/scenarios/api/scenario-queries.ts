import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScenarioInput } from '@/entities/budget/types';
import { scenarioRepository } from '@/features/scenarios/api/scenario-repository';

const SCENARIOS_QUERY_KEY = ['scenarios'];

export function useScenariosQuery() {
  return useQuery({
    queryKey: SCENARIOS_QUERY_KEY,
    queryFn: scenarioRepository.list
  });
}

export function useScenarioQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: () => scenarioRepository.getById(id!),
    enabled: Boolean(id)
  });
}

export function useCreateScenarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScenarioInput) => scenarioRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY });
    }
  });
}

export function useUpdateScenarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ScenarioInput }) =>
      scenarioRepository.update(id, input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['scenario', variables.id] });
    }
  });
}

export function useDeleteScenarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scenarioRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCENARIOS_QUERY_KEY });
    }
  });
}

