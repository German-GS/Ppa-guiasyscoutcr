import React, { useState } from "react";
import Sidebar from "./Sidebar";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("agregar");

  const renderSection = () => {
    switch (currentView) {
      case "documentacion":
        return <div>Sección de Documentación</div>;
      case "asistencia":
        return <div>Sección de Asistencia</div>;
      case "expedientes":
        return <div>Sección de Expedientes</div>;
      case "ppas":
        return <div>Sección de PPAs</div>;
      case "salir":
        return <div>Sesión cerrada</div>;
      default:
        return <div>Agregar nuevo Guía Mayor / Rover</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={setCurrentView} />
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-scout mb-6">Administración</h1>
        {renderSection()}
      </main>
    </div>
  );
}