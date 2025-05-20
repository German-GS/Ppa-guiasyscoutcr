import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { ModalAgregarProtagonista } from "./ModalAgregarProtagonista";
import { useAuth } from "../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ProtagonistasGrid } from "./ProtagonistaGrid";
import { ExpedienteProtagonista } from "./ExpedienteProtagonista";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("inicio");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recargar, setRecargar] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const { user } = useAuth();
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] = useState(null);

  const handleProtagonistaAgregado = () => {
    setRecargar(prev => !prev); // cambia para forzar reload
  };

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
    setProtagonistaSeleccionado(null);
  };

  const handleSeleccionProtagonista = (protagonistaData) => {
    setProtagonistaSeleccionado(protagonistaData);
    setCurrentView("expedienteProtagonista");
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
            <h2 className="text-xl font-bold text-scout mb-4">Mi Perfil</h2>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={user?.photoURL || "/img/avatar-default.png"}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border"
              />
              <div>
                <p className="text-lg font-semibold text-gray-800">{perfil.nombre} {perfil.apellido}</p>
                <p className="text-gray-600">{perfil.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div><strong>Edad:</strong> {perfil.edad}</div>
              <div><strong>Rol:</strong> {perfil.rol}</div>
              <div><strong>Grupo Scout:</strong> {perfil.grupo}</div>
              <div><strong>Provincia:</strong> {perfil.provincia}</div>
              <div><strong>Cantón:</strong> {perfil.canton}</div>
              <div><strong>Distrito:</strong> {perfil.distrito}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Cargando perfil...</div>
        );
      case "expedienteProtagonista":
        return protagonistaSeleccionado ? (
          <ExpedienteProtagonista
            protagonista={protagonistaSeleccionado}
            onVolver={() => setCurrentView("inicio")}
          />
        ) : (
          <div className="text-gray-500">No se ha seleccionado ningún protagonista.</div>
        );
      case "inicio":
      default:
        return (
          <ProtagonistasGrid
            onSelectProtagonista={handleSeleccionProtagonista}
            recargar={recargar} // ✅ prop para forzar actualización
          />
        );
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
        <ModalAgregarProtagonista
          onClose={() => setMostrarModal(false)}
          onProtagonistaAgregado={handleProtagonistaAgregado} // ✅ notifica al padre
        />
      )}
    </div>
  );
}
