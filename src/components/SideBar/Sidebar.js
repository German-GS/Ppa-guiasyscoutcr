// src/components/Sidebar.js

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faClipboardList,
  faCalendarCheck,
  faCalendarAlt,
  faBook,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import styles from "./sidebar.module.css";

const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const baseButtonClasses =
    "w-full text-left p-2 rounded-md transition-colors hover:bg-morado-oscuro hover:text-white";

  return (
    <aside
      className={`${styles.sidebar} text-white h-full min-h-screen w-64 p-4 flex flex-col gap-4`}
    >
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

      <nav className="flex flex-col gap-2">
        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("inicio")}
        >
          <FontAwesomeIcon icon={faHome} className="mr-3 w-5" /> Visión General
        </button>
        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("protagonistas")}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-3 w-5" /> Protagonistas
        </button>
        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("comunidad")}
        >
          <FontAwesomeIcon icon={faBook} className="mr-3 w-5" /> Mi Comunidad
        </button>

        <hr className="my-2 border-white/20" />

        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("asistencia")}
        >
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 w-5" /> Tomar
          Asistencia
        </button>
        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("historialAsistencia")}
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 w-5" />{" "}
          Historial Asistencia
        </button>

        <hr className="my-2 border-white/20" />

        <button
          className={baseButtonClasses}
          onClick={() => onNavigate("perfil")}
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 w-5" /> Mi Perfil
        </button>
        <button
          className={`${baseButtonClasses} mt-auto hover:text-red-400`}
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5" /> Salir
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
