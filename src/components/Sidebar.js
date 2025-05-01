import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faFileAlt, faUsers, faFolderOpen, faClipboardList, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="bg-scout text-white h-full w-64 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-6">
        <img src="/path/to/avatar.jpg" alt="Consejero" className="w-12 h-12 rounded-full border border-white" />
        <span className="font-semibold text-lg">Consejero</span>
      </div>
      <nav className="flex flex-col gap-4">
        <button className="text-left hover:text-gray-200" onClick={() => onNavigate('agregar')}>
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Agregar Guía Mayor / Rover
        </button>
        <button className="text-left hover:text-gray-200" onClick={() => onNavigate('documentacion')}>
          <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> Documentación
        </button>
        <button className="text-left hover:text-gray-200" onClick={() => onNavigate('asistencia')}>
          <FontAwesomeIcon icon={faUsers} className="mr-2" /> Asistencia
        </button>
        <button className="text-left hover:text-gray-200" onClick={() => onNavigate('expedientes')}>
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" /> Expedientes
        </button>
        <button className="text-left hover:text-gray-200" onClick={() => onNavigate('ppas')}>
          <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> PPAs
        </button>
        <button className="text-left mt-auto hover:text-red-300" onClick={() => onNavigate('salir')}>
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Salir
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;