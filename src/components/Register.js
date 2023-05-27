import { useState } from "react";
import { useAuth } from "../context/authContext.js";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "./Alert.js";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";
export function Register() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(); // Agregado para manejar el mensaje de error
  const [loading, setLoading] = useState(false); // Agregado para manejar el estado de carga
  const { signup } = useAuth();
  const navigate = useNavigate();

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
      await signup(user.email, user.password);
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
    <div className="w-full max-w-xs m-auto">
      <ImagGuiasyScout alt="Logo Guias y Scout de Costa Rica"/>
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
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 "
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
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 mb-4"
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-between">
        <button
          className="bg-secundaryColor hover:bg-secundaryColor-100 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? "Loading..." : "Register"}
        </button>{" "}
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline "><Link to="/login">Login</Link></button>

        </div>
        
      </form>
      {error && <Alert message={error} />}{" "}
      {/* Agregado para mostrar el mensaje de error */}
    </div>
  );
}
