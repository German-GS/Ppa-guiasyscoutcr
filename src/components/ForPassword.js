import { useState } from "react";
import { useAuth } from "../context/authContext.js";
import { useNavigate} from "react-router-dom";
import { Alert } from "./Alert.js";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";

export function ForgotPassword() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { login, resetPassword } = useAuth();
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
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return setError("Por favor ingrese su email");

    try {
      await resetPassword(user.email);
      setError(
        "Se te ha enviado un correo con un enlace para recuperar la contraseña"
      );
      navigate('/login')
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className=" w-full max-w-xs m-auto">
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
              className="shadow appearence-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
              onClick={handleResetPassword}
            >
              {loading ? "Loading..." : "Recuperar"}
            </button>{" "}
          </div>
        </form>
        {error && <Alert message={error} />}{" "}
        {/* Agregado para mostrar el mensaje de error */}
      </div>
    </div>
  );
}
