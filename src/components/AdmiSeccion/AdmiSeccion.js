// src/components/AdminSeccion.js

import React, { useState, useEffect } from "react";
import Sidebar from "../SideBar/Sidebar";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";
import { useAuth } from "../../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Menu } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./AdmiSeccion.module.css";

// Importa los componentes de las secciones
import { DashboardInicio } from "../DashboardInicio/DashboardInicio";
import { GestionComunidad } from "../GestionComunidad/GestionComunidad";
import { ProtagonistasGrid } from "../ProtagonistasGrid/ProtagonistaGrid";
import { ExpedienteProtagonista } from "../ExpedienteProtagonista/ExpedienteProtagonista";
import { Asistencia } from "../Asistencia/Asistencia";
import { HistorialAsistencia } from "../HistorialAsistencia/HistorialAsistencia";
import { MyPerfil } from "../MyPerfil/MyPerfil";
import { ModalAgregarProtagonista } from "../ModalAgregaProtagonista/ModalAgregarProtagonista";

export function AdminSeccion() {
  const [currentView, setCurrentView] = useState("inicio");
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] =
    useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recargar, setRecargar] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Bandera para saber si el componente está montado
    let isMounted = true;

    const verificarRol = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // 3. Verificar si el componente sigue montado antes de actuar
        if (isMounted) {
          if (
            userSnap.exists() &&
            userSnap.data().rol.toLowerCase() !== "consejero"
          ) {
            Swal.fire({
              title: "Acceso restringido",
              text: "Solo los consejeros pueden acceder a esta sección",
              icon: "error",
            }).then(() => {
              if (isMounted) {
                // Doble chequeo por si acaso
                window.location.href = "/";
              }
            });
          }
        }
      }
    };

    verificarRol();

    // 2. Función de limpieza que se ejecuta al desmontar el componente
    return () => {
      isMounted = false;
    };
  }, [user]); // Las dependencias se mantienen igual
  const handleNavigation = (view) => {
    setCurrentView(view);
    setProtagonistaSeleccionado(null);
    setSidebarAbierto(false);
  };

  const handleSeleccionProtagonista = (protagonistaData) => {
    setProtagonistaSeleccionado(protagonistaData);
  };

  const handleProtagonistaAgregado = () => {
    setRecargar((prev) => !prev);
  };

  // ESTA FUNCIÓN CONTIENE LA LÓGICA PARA MOSTRAR LAS VISTAS Y EL BOTÓN
  const renderSection = () => {
    if (protagonistaSeleccionado) {
      return (
        <ExpedienteProtagonista
          protagonista={protagonistaSeleccionado}
          onVolver={() => setProtagonistaSeleccionado(null)} // Vuelve a la lista anterior
        />
      );
    }

    switch (currentView) {
      case "protagonistas":
        return (
          <>
            <button
              onClick={() => setMostrarModal(true)}
              className={`${styles.btnInvitar} text-white mb-4 px-4 py-2 rounded-lg font-semibold transition shadow-sm`}
            >
              Invitar Protagonista
            </button>
            <ProtagonistasGrid
              onSelectProtagonista={handleSeleccionProtagonista}
              recargar={recargar}
            />
          </>
        );
      case "comunidad":
        return <GestionComunidad />;
      case "asistencia":
        return <Asistencia />;
      case "historialAsistencia":
        return <HistorialAsistencia />;
      case "perfil":
        return <MyPerfil />;
      case "inicio":
      default:
        return <DashboardInicio onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-fondo-claro">
      <div
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out ${
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar onNavigate={handleNavigation} />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold text-morado-principal">Admin</h1>
          <button onClick={() => setSidebarAbierto(!sidebarAbierto)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {renderSection()}
      </main>

      {mostrarModal && (
        <ModalAgregarProtagonista
          onClose={() => setMostrarModal(false)}
          onProtagonistaAgregado={handleProtagonistaAgregado}
        />
      )}
    </div>
  );
}
