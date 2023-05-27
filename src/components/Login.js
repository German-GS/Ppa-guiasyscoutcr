/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useAuth } from "../context/authContext.js";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "./Alert.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";

export function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(); // Agregado para manejar el mensaje de error
  const [loading, setLoading] = useState(false); // Agregado para manejar el estado de carga

  // Registra los eventos en los input del form
  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  // Con el email y el password envia a la funcion signup para registrar el email y el password a firebase y maneja los errores
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); //cambio de estas
    try {
      await login(user.email, user.password);
      navigate("/");
    } catch (error) {
      console.log(error.code);
      if (error.code === "auth/user-not-found") {
        setError("No existe un usuario con ese correo");
      } else if (error.code === "auth/wrong-password") {
        setError("La contraseña es incorrecta");
      } else {
        setError("Error al iniciar con ese usuario");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className=" w-full max-w-xs m-auto">
      <ImagGuiasyScout alt="logo Guias y Scout Costa Rica" />
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block text-gray-500 text-sm font-bold mb-2">
            Correo Electronico
          </label>
          <input
            type="email"
            placeholder="guiayscout@email.com"
            name="email"
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-500 text-sm font-bold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="******"
            name="password"
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between ">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Loading..." : "Ingresar"}
          </button>{" "}
          <a
            className="inline-block align-baseline font-bold text-xs text-blue-500 hover:text-blue-800"
            href=""
          >
            {" "}
            <Link to="/forgotpassword">Olvidaste la contraseña?</Link>{" "}
          </a>
        </div>
      </form>
      <p className="my-4 text-sm flex justify-between px-3">
        No tienes unas cuenta?<Link to="/register">Registrarse</Link>
      </p>
      <button
        className="bg-slate-50 hoer:bg-slate-200 text-black shadow-md rounded py-2 px-4 w-full"
        onClick={handleGoogle}
      >
        <FontAwesomeIcon icon={faGoogle} /> Iniciar sesion con Google
      </button>
      {error && <Alert message={error} />}{" "}
      {/* Agregado para mostrar el mensaje de error */}
    </div>
  );
}
