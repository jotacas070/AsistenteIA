import { useState, useEffect } from "react";
import { Settings, Anchor, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat-interface";
import { FileUpload } from "@/components/file-upload";
import { AdminModal } from "@/components/admin-modal";
import { UserAuthModal } from "@/components/user-auth-modal";
import { useConfig } from "@/hooks/use-config";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { config } = useConfig();

  useEffect(() => {
    // Check if user authentication is required
    if (!config?.requireUserPassword) {
      setIsUserAuthenticated(true);
    }
  }, [config]);

  if (!config) {
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
      {/* Admin Access Button */}
      <Button
        onClick={() => setShowAdminModal(true)}
        className="fixed top-4 right-4 z-50 bg-navy-800 hover:bg-navy-700 p-3 rounded-full shadow-lg"
        size="sm"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {config.appTitle}
                </h1>
                <p className="text-sm text-gray-500">
                  {config.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 flex items-center">
                <Circle className="h-3 w-3 text-green-500 mr-1 fill-current" />
                En línea
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>

          {/* File Upload and System Info */}
          <div className="space-y-6">
            <FileUpload />
            
            {/* System Status */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Estado del Sistema</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Flowise</span>
                    <span className="flex items-center text-sm text-green-600">
                      <Circle className="h-3 w-3 mr-1 fill-current" />
                      Conectado
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base de Datos</span>
                    <span className="flex items-center text-sm text-green-600">
                      <Circle className="h-3 w-3 mr-1 fill-current" />
                      Operativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Almacenamiento</span>
                    <span className="text-sm text-gray-600">Disponible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminModal 
        open={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
      
      <UserAuthModal 
        open={!isUserAuthenticated}
        onAuthenticated={() => setIsUserAuthenticated(true)}
      />
    </div>
  );
}
