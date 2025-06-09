import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { ModalAgregarProtagonista } from "./ModalAgregarProtagonista";
import { useAuth } from "../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ProtagonistasGrid } from "./ProtagonistaGrid";
import { ExpedienteProtagonista } from "./ExpedienteProtagonista";
import { Asistencia } from "./Asistencia";
import { HistorialAsistencia } from "./HistorialAsistencia";
import { MyPerfil } from "./MyPerfil";
import { Menu } from "lucide-react";
import Swal from "sweetalert2";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("inicio");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recargar, setRecargar] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const { user } = useAuth();
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  const handleProtagonistaAgregado = () => {
    setRecargar(prev => !prev);
    Swal.fire({
      title: "¡Invitación enviada!",
      text: "El protagonista recibió una notificación para unirse a tu comunidad",
      icon: "success",
      timer: 3000
    });
  };

  // Verificar rol de consejero al cargar
  useEffect(() => {
    const verificarRol = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().rol !== "consejero") {
          Swal.fire({
            title: "Acceso restringido",
            text: "Solo los consejeros pueden acceder a esta sección",
            icon: "error"
          }).then(() => window.location.href = "/");
        }
      }
    };
    verificarRol();
  }, [user]);

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
        return <Asistencia />;

      case "historialAsistencia":
        return <HistorialAsistencia />;

      case "expedientes":
        return <div>Sección de Expedientes</div>;

      case "ppas":
        return <div>Sección de PPAs</div>;

      case "perfil":
       return <MyPerfil />;

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
            recargar={recargar}
          />
        );
    }
  };

  return (
  <div className="flex flex-col md:flex-row min-h-screen">
    {/* Botón hamburguesa solo en mobile */}
    <div className="md:hidden flex justify-between items-center p-4 bg-morado-principal text-white">
      <h1 className="text-lg font-bold">Admin Sección</h1>
      <button onClick={toggleSidebar}>
        <Menu className="w-6 h-6" />
      </button>
    </div>

    {/* Sidebar: oculto en mobile, visible si abierto */}
    <div
      className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-morado-principal text-white transform transition-transform duration-200 ease-in-out
      ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <Sidebar onNavigate={(view) => {
        setSidebarAbierto(false);
        handleNavigation(view);
      }} />
    </div>

    {/* Fondo oscuro al abrir el sidebar (mobile) */}
    {sidebarAbierto && (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
        onClick={toggleSidebar}
      />
    )}

    <main className="flex-1 bg-fondo-claro p-4 md:p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-morado-principal">
            Administración de la Sección
          </h1>
          <p className="text-gray-500 text-sm italic">
            “Siempre listo para servir”
          </p>
        </div>
        <img src={comunidadIcon} alt="Comunidad" className="w-8 md:w-10 h-8 md:h-10" />
      </div>
      {renderSection()}
    </main>

    {mostrarModal && (
      <ModalAgregarProtagonista
        onClose={() => setMostrarModal(false)}
        onProtagonistaAgregado={handleProtagonistaAgregado}
        consejeroNombre={perfil?.nombre || "Consejero"}
      />
    )}
  </div>
);

}
