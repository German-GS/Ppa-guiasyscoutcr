import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faFileAlt,
  faUsers,
  faFolderOpen,
  faClipboardList,
  faSignOutAlt,
  faUser,
  faCalendarAlt // ✅ Corregido: ícono para Historial de Asistencia
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { faHome } from "@fortawesome/free-solid-svg-icons";



const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const baseButtonClasses = "text-left transition-colors hover:text-yellow-400";

  return (
    <aside className="bg-scout text-white h-full min-h-screen w-64 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-6">
        <img
          src={user?.photoURL || "/img/avatar-default.png"}
          alt="Consejero"
          className="w-12 h-12 rounded-full border border-white object-cover"
        />
        <span className="font-semibold text-lg">
          {user?.displayName || "Consejero"}
        </span>
      </div>

      <nav className="flex flex-col gap-4">
       <button className={baseButtonClasses} onClick={() => onNavigate("inicio")}>
        <FontAwesomeIcon icon={faHome} className="mr-2" /> Inicio
      </button>
        <button className={baseButtonClasses} onClick={() => onNavigate("agregar")}>
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Agregar Guía Mayor / Rover
        </button>
       {/*  <button className={baseButtonClasses} onClick={() => onNavigate("documentacion")}>
          <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Documentación
        </button> */}
        <button className={baseButtonClasses} onClick={() => onNavigate("asistencia")}>
          <FontAwesomeIcon icon={faUsers} className="mr-2" /> Asistencia
        </button>
        <button className={baseButtonClasses} onClick={() => onNavigate("historialAsistencia")}>
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Historial de Asistencia
        </button>
       {/*  <button className={baseButtonClasses} onClick={() => onNavigate("expedientes")}>
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" /> Expedientes
        </button> */}
       {/*  <button className={baseButtonClasses} onClick={() => onNavigate("ppas")}>
          <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> PPAs
        </button> */}
        <button className={baseButtonClasses} onClick={() => onNavigate("perfil")}>
          <FontAwesomeIcon icon={faUser} className="mr-2" /> Mi Perfil
        </button>
        <button
          className="text-left mt-auto transition-colors hover:text-red-400"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Salir
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
