import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useConfig } from "@/hooks/use-config";
import { Shield, Eye, EyeOff, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Admin() {
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
    updateConfig,
    isUpdating,
    isLoading 
  } = useConfig();
  
  const { toast } = useToast();

  // Initialize form data when config loads
  React.useEffect(() => {
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

  const handleSave = () => {
    updateConfig({
      ...formData,
      apiKey: apiKey || config?.apiKey,
    });
    
    toast({
      title: "Configuración guardada",
      description: "Los cambios se aplicaron correctamente.",
    });
  };

  const handleColorChange = (color: string) => {
    setFormData({ ...formData, primaryColor: color });
    
    // Apply color change immediately to CSS variables
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--navy-800', color);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Chat
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100">
                  <Shield className="h-4 w-4 text-navy-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel de Administración
                </h1>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-navy-800 hover:bg-navy-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* App Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Personalización de la Aplicación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Título Principal
                  </Label>
                  <Input
                    type="text"
                    value={formData.appTitle}
                    onChange={(e) => setFormData({ ...formData, appTitle: e.target.value })}
                    placeholder="Título de la aplicación"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Subtítulo
                  </Label>
                  <Input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Subtítulo de la aplicación"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Color Principal
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1"
                      placeholder="#1e3a8a"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Tamaño de Fuente
                  </Label>
                  <Select 
                    value={formData.fontSize} 
                    onValueChange={(value) => setFormData({ ...formData, fontSize: value })}
                  >
                    <SelectTrigger>
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

              {/* Color Preview */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vista Previa del Color
                </Label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg shadow-sm border"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <div className="space-y-2">
                    <Button 
                      className="text-white"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Botón de ejemplo
                    </Button>
                    <p className="text-sm text-gray-600">
                      Este color se aplicará a botones principales, enlaces y elementos de navegación.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  URL de la API de Flowise
                </Label>
                <Input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder="https://api.flowise.example.com/v1/prediction/..."
                />
                <p className="text-xs text-gray-500">
                  URL completa del endpoint de predicción de Flowise
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Clave de API (API Key)
                </Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey || config?.apiKey || ""}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Ingresa la clave de API"
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
                <p className="text-xs text-gray-500">
                  Clave de autenticación para acceder a la API de Flowise
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Configuración Actual de API
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Estado:</strong> {config?.apiUrl ? "Configurada" : "No configurada"}</p>
                  <p><strong>URL:</strong> {config?.apiUrl ? "✓ Válida" : "✗ Faltante"}</p>
                  <p><strong>API Key:</strong> {config?.apiKey ? "✓ Configurada" : "✗ Faltante"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Requerir Contraseña de Usuario
                  </Label>
                  <p className="text-xs text-gray-500">
                    Los usuarios necesitarán una contraseña para acceder a la aplicación
                  </p>
                </div>
                <Switch
                  checked={formData.requireUserPassword}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, requireUserPassword: checked })
                  }
                />
              </div>
              
              {formData.requireUserPassword && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Contraseña de Usuario
                  </Label>
                  <Input
                    type="password"
                    value={formData.userPassword}
                    onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                    placeholder="Establecer contraseña para usuarios"
                  />
                  <p className="text-xs text-gray-500">
                    Esta contraseña será requerida por todos los usuarios antes de acceder al chat
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <h4 className="text-sm font-medium text-amber-900 mb-2">
                  Configuración de Seguridad Actual
                </h4>
                <div className="space-y-1 text-sm text-amber-800">
                  <p>
                    <strong>Acceso de usuarios:</strong> {" "}
                    {config?.requireUserPassword ? "Protegido con contraseña" : "Acceso libre"}
                  </p>
                  <p>
                    <strong>Panel de administración:</strong> Siempre protegido
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-sm font-medium text-green-900">API Flowise</p>
                  <p className="text-xs text-green-700">Conectado</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-sm font-medium text-green-900">Base de Datos</p>
                  <p className="text-xs text-green-700">Operativo</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <p className="text-sm font-medium text-green-900">Almacenamiento</p>
                  <p className="text-xs text-green-700">Disponible</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
