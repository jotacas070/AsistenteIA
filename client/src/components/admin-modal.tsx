import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "@/hooks/use-config";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminModal({ open, onClose }: AdminModalProps) {
  const [currentView, setCurrentView] = useState<'login' | 'panel'>('login');
  const [password, setPassword] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  const [formData, setFormData] = useState({
    appTitle: "",
    subtitle: "",
    primaryColor: "#1e3a8a",
    fontSize: "medium",
    apiUrl: "",
    requireUserPassword: false,
    userPassword: "",
  });

  const { 
    config, 
    authAdmin, 
    isAuthenticatingAdmin, 
    adminAuthResult, 
    adminAuthError,
    updateConfig,
    isUpdating 
  } = useConfig();
  
  const { toast } = useToast();

  useEffect(() => {
    if (config) {
      setFormData({
        appTitle: config.appTitle,
        subtitle: config.subtitle,
        primaryColor: config.primaryColor,
        fontSize: config.fontSize,
        apiUrl: config.apiUrl,
        requireUserPassword: config.requireUserPassword,
        userPassword: config.userPassword || "",
      });
    }
  }, [config]);

  useEffect(() => {
    if (adminAuthResult?.success) {
      setCurrentView('panel');
      setApiKey(adminAuthResult.apiKey || "");
    }
  }, [adminAuthResult]);

  const handleClose = () => {
    setCurrentView('login');
    setPassword("");
    setApiKey("");
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authAdmin(password);
  };

  const handleSave = () => {
    updateConfig({
      ...formData,
      apiKey: apiKey,
    });
    
    toast({
      title: "Configuración guardada",
      description: "Los cambios se aplicaron correctamente.",
    });
    
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {currentView === 'login' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100">
                  <Shield className="h-5 w-5 text-navy-600" />
                </div>
                <div>
                  <DialogTitle>Acceso Administrador</DialogTitle>
                </div>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña de administrador"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {adminAuthError && (
                <p className="text-sm text-red-600">
                  Contraseña de administrador incorrecta
                </p>
              )}
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-navy-800 hover:bg-navy-700"
                  disabled={isAuthenticatingAdmin || !password.trim()}
                >
                  {isAuthenticatingAdmin ? "Verificando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Panel de Administración</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* App Customization */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-3">Personalización</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Título Principal</Label>
                    <Input
                      type="text"
                      value={formData.appTitle}
                      onChange={(e) => setFormData({ ...formData, appTitle: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Subtítulo</Label>
                    <Input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Color Principal</Label>
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tamaño de Fuente</Label>
                    <Select 
                      value={formData.fontSize} 
                      onValueChange={(value) => setFormData({ ...formData, fontSize: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeña</SelectItem>
                        <SelectItem value="medium">Mediana</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* API Configuration */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-3">Configuración API</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">URL de la API</Label>
                    <Input
                      type="url"
                      value={formData.apiUrl}
                      onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">API Key</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 px-3 py-0 h-full"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Configuración de Seguridad</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Requerir Contraseña de Usuario</Label>
                      <p className="text-xs text-gray-500">Los usuarios necesitarán contraseña para acceder</p>
                    </div>
                    <Switch
                      checked={formData.requireUserPassword}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, requireUserPassword: checked })
                      }
                    />
                  </div>
                  
                  {formData.requireUserPassword && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Contraseña de Usuario</Label>
                      <Input
                        type="password"
                        value={formData.userPassword}
                        onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                        className="mt-1"
                        placeholder="Establecer contraseña para usuarios"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-navy-800 hover:bg-navy-700"
                disabled={isUpdating}
              >
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
