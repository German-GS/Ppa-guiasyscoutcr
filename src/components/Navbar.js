import { useState } from "react";
import { useAuth } from "../context/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../App.css";
import { NotificacionesProtagonista } from "./NotificacionesProtagonista";


export function Navbar({ fixed }) {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleToggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
  };

  const handleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error.message);
    }
  };

  const scrollToPPAList = (e) => {
    e.preventDefault();
    const ppaListSection = document.getElementById("ppa-list");
    if (ppaListSection) {
      ppaListSection.scrollIntoView({ behavior: "smooth" });
    }
    setNavbarOpen(false); // Cerrar el menú en móvil después de hacer clic
  };

  return (
    <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-scout mb-3">
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
          className={`lg:flex flex-grow items-center ${navbarOpen ? "flex" : "hidden"}`}
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
            <li className="nav-item">
              <a
                href="#ppa-list"
                onClick={scrollToPPAList}
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
              >
                Mis PPA's
              </a>
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
                {/* Aquí insertamos la campanita */}
                <NotificacionesProtagonista />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}