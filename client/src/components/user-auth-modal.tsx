import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/hooks/use-config";
import { Anchor } from "lucide-react";

interface UserAuthModalProps {
  open: boolean;
  onAuthenticated: () => void;
}

export function UserAuthModal({ open, onAuthenticated }: UserAuthModalProps) {
  const [password, setPassword] = useState("");
  const { config, authUser, isAuthenticatingUser, userAuthResult, userAuthError } = useConfig();

  useEffect(() => {
    if (userAuthResult?.success) {
      onAuthenticated();
    }
  }, [userAuthResult, onAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authUser(password);
  };

  // Don't show modal if user auth is not required
  if (!config?.requireUserPassword) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 mb-4">
            <Anchor className="h-8 w-8 text-navy-600" />
          </div>
          <DialogTitle className="text-lg font-medium text-gray-900">
            Acceso al Sistema
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa la contraseña para acceder al Asistente IA
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Contraseña de acceso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          
          {userAuthError && (
            <p className="text-sm text-red-600 text-center">
              Contraseña incorrecta
            </p>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-navy-800 hover:bg-navy-700"
            disabled={isAuthenticatingUser || !password.trim()}
          >
            {isAuthenticatingUser ? "Verificando..." : "Ingresar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
