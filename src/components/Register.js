import React, { useState } from "react";
import { useAuth } from "../context/authContext.js";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "./Alert.js";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";

export function Register() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    edad: "",
    grupo: "",
    provincia: "",
    canton: "",
    distrito: "",
    rol: "Protagonista"
  });
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(user.email, user.password, user);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/missing-password") {
        setError("Falta ingresar la contraseña");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña debe de contener al menos 6 caracteres");
      } else if (error.code === "auth/email-already-in-use") {
        setError("El correo electrónico ya está registrado en el sistema");
      } else if (error.code === "auth/internal-error") {
        setError("Correo inválido");
      } else {
        setError("Error al registrar el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl m-auto">
      <ImagGuiasyScout alt="Logo Guias y Scout de Costa Rica" />
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-600">Registro</h2>
          <img src={comunidadIcon} alt="Icono Comunidad" className="w-10 h-10" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Edad</label>
              <input
                type="number"
                name="edad"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Grupo Scout</label>
              <input
                type="text"
                name="grupo"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Provincia</label>
              <input
                type="text"
                name="provincia"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Cantón</label>
              <input
                type="text"
                name="canton"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Distrito</label>
              <input
                type="text"
                name="distrito"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-500 text-sm font-bold mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="guiayscout@email.com"
              className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500 text-sm font-bold mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="******"
              className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-bold mb-1">Rol</label>
            <select
              name="rol"
              className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
              onChange={handleChange}
            >
              <option value="Protagonista">Protagonista</option>
              <option value="Consejero">Consejero</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button
              className="bg-secundaryColor hover:bg-secundaryColor-100 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Loading..." : "Registrar"}
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              <Link to="/login">Login</Link>
            </button>
          </div>
        </form>
        {error && <Alert message={error} />}
      </div>
    </div>
  );
}
