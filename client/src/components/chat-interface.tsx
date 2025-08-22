import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bot, User, Send, Trash2, Paperclip, Copy, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const QUICK_ACTIONS = [
  "¿Cómo participar en una licitación?",
  "Documentación requerida para proveedores",
  "Plazos de entrega y evaluación",
  "Normativas y reglamentos vigentes",
];

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, isSending, clearMessages, isClearing } = useChat();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => api.uploadFiles(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-500" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    let attachments = null;

    // Upload files first if any are attached
    if (attachedFiles.length > 0) {
      try {
        const fileList = new DataTransfer();
        attachedFiles.forEach(file => fileList.items.add(file));
        const uploadedFiles = await uploadMutation.mutateAsync(fileList.files);
        
        // Convert files to base64 for Flowise API
        const attachmentPromises = attachedFiles.map(async (file) => {
          return new Promise<any>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = reader.result as string;
              resolve({
                name: file.name,
                type: file.type,
                data: base64Data, // Send base64 data instead of URL
                mime: file.type,
              });
            };
            reader.readAsDataURL(file);
          });
        });
        
        attachments = await Promise.all(attachmentPromises);

        toast({
          title: "Archivos subidos",
          description: `Se subieron ${uploadedFiles.length} archivo(s) correctamente.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron subir los archivos.",
          variant: "destructive",
        });
        return;
      }
    }

    sendMessage({ content: trimmedMessage, attachments });
    setMessage("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (actionText: string) => {
    setMessage(actionText);
    sendMessage({ content: actionText, attachments: null });
    setMessage("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Mensaje copiado al portapapeles.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Asistente IA</h3>
                <p className="text-xs text-gray-500">Especializado en Compras Públicas</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearMessages()}
              disabled={isClearing || messages.length === 0}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                <p className="text-sm text-gray-800">
                  ¡Hola! Soy tu asistente de IA especializado en compras públicas para la Armada de Chile. 
                  Puedes hacerme preguntas sobre procesos de licitación, normativas, documentación requerida y más.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start space-x-3",
                  msg.sender === 'user' ? "justify-end" : ""
                )}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "rounded-lg p-3 max-w-md",
                  msg.sender === 'user' 
                    ? "bg-navy-600 text-white" 
                    : "bg-gray-100"
                )}>
                  <p className={cn(
                    "text-sm whitespace-pre-wrap",
                    msg.sender === 'user' ? "text-white" : "text-gray-800"
                  )}>
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn(
                      "text-xs",
                      msg.sender === 'user' ? "text-white/75" : "text-gray-500"
                    )}>
                      {formatTime(new Date(msg.createdAt))}
                    </span>
                    {msg.sender === 'ai' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(msg.content)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="text-sm font-medium text-gray-700">Archivos adjuntos:</div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachedFile(index)}
                      className="h-4 w-4 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu consulta aquí..."
                  className="min-h-[40px] max-h-[120px] resize-none pr-10"
                  rows={1}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 top-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={isSending || (!message.trim() && attachedFiles.length === 0)}
              className="bg-navy-600 hover:bg-navy-700 h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              Presiona Shift+Enter para nueva línea • {attachedFiles.length > 0 && `${attachedFiles.length} archivo(s) adjunto(s)`}
            </div>
            <div className="text-xs text-gray-500">
              API: <span className="text-green-600">Conectado</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Consultas Frecuentes</h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left p-3 h-auto bg-gray-50 hover:bg-gray-100"
                onClick={() => handleQuickAction(action)}
              >
                <span className="text-sm text-gray-700">{action}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
