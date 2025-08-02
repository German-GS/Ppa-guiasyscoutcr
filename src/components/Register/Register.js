import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "../Alert.js";
import { ImagGuiasyScout } from "../ImgGuiasyScout.js";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./register.module.css";

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
    telefono: "",
    emergenciaNombre: "",
    emergenciaTelefono: "",
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
        emergencia: {
          nombre: user.emergenciaNombre,
          telefono: user.emergenciaTelefono,
        },
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
    // Contenedor principal con el fondo morado
    <div className={styles.registerContainer}>
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-morado-principal">
            Crear una Cuenta
          </h2>
          <img
            src={comunidadIcon}
            alt="Icono Comunidad"
            className="w-12 h-12"
          />
        </div>

        {error && <Alert message={error} />}
        {success && <Alert message={success} type="success" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- Sección de Información Personal --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Teléfono / Celular
              </label>
              <input
                type="tel"
                name="telefono"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                name="fechaIngreso"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Grupo Scout
              </label>
              <input
                type="text"
                name="grupo"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* --- Sección de Cuenta --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="******"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="text-lg font-semibold text-gray-600 mb-2 pt-2">
            Ubicación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Provincia
              </label>
              <select
                name="provincia"
                className="border-input"
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {provinciasCR.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Cantón
              </label>
              <input
                type="text"
                name="canton"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Distrito
              </label>
              <input
                type="text"
                name="distrito"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* --- Sección de Contacto de Emergencia --- */}

          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Contacto de Emergencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Nombre del Contacto
              </label>
              <input
                type="text"
                name="emergenciaNombre"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                Teléfono del Contacto
              </label>
              <input
                type="tel"
                name="emergenciaTelefono"
                className="border-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* --- Campo de Rol --- */}
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Rol dentro de la organización
          </h3>
          <div className="pt-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Rol en la aplicación
            </label>
            <select name="rol" className="border-input" onChange={handleChange}>
              <option value="Protagonista">Protagonista</option>
              <option value="Consejero">Consejero</option>
            </select>
          </div>

          {/* --- Botones de Acción --- */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "auto" }}
              disabled={loading}
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>
            <Link
              to="/login"
              className="text-sm font-bold text-morado-principal hover:underline"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
