import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: messages = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: () => api.getMessages(),
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: string; attachments?: any }) => 
      api.sendMessage(content, attachments),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      
      if (data.error) {
        toast({
          title: "Advertencia",
          description: "El servicio de IA no está disponible temporalmente, pero tu mensaje fue guardado.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: () => api.clearMessages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Historial limpio",
        description: "Se eliminaron todos los mensajes del chat.",
      });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    clearMessages: clearMessagesMutation.mutate,
    isClearing: clearMessagesMutation.isPending,
  };
}
