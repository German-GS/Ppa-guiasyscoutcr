import React, { useState } from "react";
import Sidebar from "./Sidebar";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png"; // Asegúrate de que esta ruta sea correcta

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-scout">Administración de la Sección</h1>
          <img src={comunidadIcon} alt="Comunidad" className="w-12 h-12" />
        </div>
        {renderSection()}
      </main>
    </div>
  );
}
