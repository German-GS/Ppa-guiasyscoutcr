import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "./Alert.js";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

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
    rol: "Protagonista",
    fechaNacimiento: "",
    fechaIngreso: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  const provinciasCR = [
    "San José",
    "Alajuela",
    "Cartago",
    "Heredia",
    "Guanacaste",
    "Puntarenas",
    "Limón",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const cred = await signup(user.email, user.password);

      if (!cred.user || !cred.user.uid) {
        throw new Error("No se pudo crear el usuario.");
      }

      const perfil = {
        nombre: user.nombre,
        apellido: user.apellido,
        edad: user.edad,
        grupo: user.grupo,
        provincia: user.provincia,
        canton: user.canton,
        distrito: user.distrito,
        rol: user.rol,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento,
        fechaIngreso: user.fechaIngreso,
      };

      await setDoc(doc(db, "users", cred.user.uid), perfil);
      console.log("Perfil guardado en Firestore:", cred.user.uid);

      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setError("El correo electrónico ya está registrado.");
      } else {
        setError("Error al registrar el usuario.");
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
          {/* Primera fila */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Grupo Scout</label>
              <input
                type="text"
                name="grupo"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Segunda fila: Edad y fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Edad</label>
              <input
                type="number"
                name="edad"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">F. de ingreso al movimiento</label>
              <input
                type="date"
                name="fechaIngreso"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Provincia</label>
              <select
                name="provincia"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una provincia</option>
                {provinciasCR.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Cantón</label>
              <input
                type="text"
                name="canton"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm font-bold mb-1">Distrito</label>
              <input
                type="text"
                name="distrito"
                className="text-gray-600 border-none text-sm rounded-lg bg-gray-300 block w-full p-2.5"
                onChange={handleChange}
                required
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
              required
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
              required
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
              type="submit"
              className="bg-secundaryColor hover:bg-secundaryColor-100 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
            <Link to="/login">
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Login
              </button>
            </Link>
          </div>
        </form>

        {success && <Alert message={success} type="success" />}
      </div>
    </div>
  );
}
