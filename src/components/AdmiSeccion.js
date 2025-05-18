import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { ModalAgregarProtagonista } from "./ModalAgregarProtagonista";
import { useAuth } from "../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ProtagonistasGrid } from "./ProtagonistaGrid";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("inicio");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const cargarPerfil = async () => {
      if (user) {
        const perfilRef = doc(db, "users", user.uid);
        const perfilSnap = await getDoc(perfilRef);
        if (perfilSnap.exists()) {
          setPerfil(perfilSnap.data());
        }
      }
    };

    if (currentView === "perfil") {
      cargarPerfil();
    }
  }, [currentView, user]);

  const handleNavigation = (view) => {
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
      case "perfil":
        return perfil ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
            {/* ...contenido de perfil */}
          </div>
        ) : (
          <div className="text-gray-600">Cargando perfil...</div>
        );
      case "inicio":
      default:
        return <ProtagonistasGrid />;
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
