// src/components/Navbar.js (Actualizado con navegación mejorada)

import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Importa useNavigate
import "../../index.css";
import { NotificacionesProtagonista } from "../NotificacionesProtagonista";

export function Navbar({ fixed }) {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Hook para navegar
  const location = useLocation(); // Hook para saber en qué página estamos

  const handleToggleNavbar = () => setNavbarOpen(!navbarOpen);

  const handleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error.message);
    }
  };

  // ▼▼▼ LÓGICA MEJORADA PARA EL SCROLL ▼▼▼
  const handleMisPpasClick = () => {
    setNavbarOpen(false); // Cierra el menú en móvil
    // Si ya estamos en la página de inicio, solo hacemos scroll
    if (location.pathname === "/home") {
      const ppaListSection = document.getElementById("ppa-list");
      if (ppaListSection) {
        ppaListSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Si estamos en otra página, navegamos al home
      // La lógica para el scroll al cargar la página Home se agregará en Home.js
      navigate("/home", { state: { scrollTo: "ppa-list" } });
    }
  };

  return (
    <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-inst-claro mb-3">
      <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <div className="flex items-center space-x-2">
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Foto de perfil"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUser}
                className="w-8 h-8 text-gray-500"
              />
            )}
            <h1 className="text-white dark:text-white text-sm font-medium">
              Bienvenido {user ? user.displayName || user.email : ""}
            </h1>
          </div>
          <button
            className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
            type="button"
            onClick={handleToggleNavbar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div
          className={`lg:flex flex-grow items-center ${
            navbarOpen ? "flex" : "hidden"
          }`}
          id="example-navbar-danger"
        >
          <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
            <li className="nav-item">
              <Link
                to="/material"
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
              >
                Material de Apoyo
              </Link>
            </li>

            {/* ▼▼▼ ENLACE "MIS PPA'S" CON NUEVA LÓGICA ▼▼▼ */}
            <li className="nav-item">
              <button
                onClick={handleMisPpasClick}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
              >
                Mis PPA's
              </button>
            </li>

            <li className="nav-item">
              <Link
                to="/mi-perfil"
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
                onClick={() => setNavbarOpen(false)}
              >
                Mi Perfil
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/consejo-comunidad"
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
                onClick={() => setNavbarOpen(false)}
              >
                Consejo de Comunidad
              </Link>
            </li>

            <li className="nav-item">
              <button
                onClick={handleLogOut}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
              >
                Cerrar Sesión
              </button>
            </li>

            <li>
              <div className="flex items-center space-x-2">
                <NotificacionesProtagonista />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
