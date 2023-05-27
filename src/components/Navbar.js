/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "../App.css";

export function Navbar({ fixed }) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
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
            {user ? (
              <h1 className="text-white dark:text-white text-sm font-medium">
                Bienvenido {user.displayName || user.email}
              </h1>
            ) : (
              <h1 className="text-white dark:text-white text-sm font-medium">
                Bienvenido
              </h1>
            )}
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
              <a
                href="#"
                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:text-secundaryColor"
              >
                Material de Apoyo
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
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
          </ul>
        </div>
      </div>
    </nav>
  );
}

/* <div>
      <nav className="bg-scout border-gray-200 dark:bg-scout">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center space-x-2">
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="Foto de perfil" className="w-8 h-8 rounded-full"/>) : (<FontAwesomeIcon icon={faUser}className="w-8 h-8 text-gray-500"/>)}
            {user ? (
              <h1 className="text-white dark:text-white text-sm font-medium">
                Bienvenido {user.displayName || user.email}
              </h1>
            ) : (
              <h1 className="text-white dark:text-white text-sm font-medium">
                Bienvenido
              </h1>
            )}
          </div>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div className="hidden md:hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 md:border-0" >
              <li data-collapse-target="navbar-default">
                <a
                  href="#"
                  className="block py-2 pl-3 pr-4 text-rover1 bg-blue-700 rounded md:bg-transparent md:text-rover1 md:p-0 dark:text-white md:dark:text-rover hover:text-rover-100"
                  aria-current="page"
                >
                  Material de Apoyo
                </a>
              </li>
              <li data-collapse-target="navbar-default">
                <a
                  href="#"
                  className="block py-2 pl-3 pr-4 text-rover1 bg-blue-700 rounded md:bg-transparent md:text-rover1 md:p-0 dark:text-white md:dark:text-rover hover:text-rover-100"
                  aria-current="page"
                >
                  Mis PPA's
                </a>
              </li>
              <li data-collapse-target="navbar-default"> 
              <button
              onClick={handleLogOut}
              className="block py-2 pl-3 pr-4 text-white rounded hover:bg-secundaryColor md:hover:bg-transparent md:border-0 md:hover:text-secundaryColor md:p-0 dark:text-white md:dark:hover:hover:text-rover-100 dark:hover:hover:text-rover-100 dark:hover:text-rover-100 md:dark:hover:bg-transparent"
            >
              Cerrar Sesión
            </button>
            
              </li>
            </ul>
          </div>
        </div>
      </nav>

    </div> */
