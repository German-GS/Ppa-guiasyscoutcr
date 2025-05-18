import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { ModalAgregarProtagonista } from "./ModalAgregarProtagonista";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("agregar");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    console.log("Vista actual:", currentView);
    console.log("¿Mostrar modal?:", mostrarModal);
  }, [currentView, mostrarModal]);

  const handleNavigation = (view) => {
    console.log("Navegando a:", view);
    setCurrentView(view);
    setMostrarModal(view === "agregar");
  };

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
        return <div>Use el botón del menú para agregar un Guía Mayor / Rover.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={handleNavigation} />
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-scout">Administración de la Sección</h1>
          <img src={comunidadIcon} alt="Comunidad" className="w-10 h-10" />
        </div>
        {renderSection()}
      </main>

      {mostrarModal && (
        <ModalAgregarProtagonista onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
}
