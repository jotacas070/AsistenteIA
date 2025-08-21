import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AppConfig } from "@shared/schema";

export function useConfig() {
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/config'],
    queryFn: () => api.getConfig(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Partial<AppConfig>) => api.updateConfig(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
  });

  const authAdminMutation = useMutation({
    mutationFn: (password: string) => api.authAdmin(password),
  });

  const authUserMutation = useMutation({
    mutationFn: (password: string) => api.authUser(password),
  });

  return {
    config,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    authAdmin: authAdminMutation.mutate,
    isAuthenticatingAdmin: authAdminMutation.isPending,
    authUser: authUserMutation.mutate,
    isAuthenticatingUser: authUserMutation.isPending,
    adminAuthResult: authAdminMutation.data,
    adminAuthError: authAdminMutation.error,
    userAuthResult: authUserMutation.data,
    userAuthError: authUserMutation.error,
  };
}
