/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "./Alert.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ImagGuiasyScout } from "./ImgGuiasyScout.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  const redirigirPorRol = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      navigate("/completar-perfil");
      return;
    }

    const userData = userSnap.data();

    if (!userData.rol) {
      navigate("/completar-perfil");
    } else if (userData.rol === "consejero") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await login(user.email, user.password);
      await redirigirPorRol(cred.user.uid);
    } catch (error) {
      console.log(error.code);
      console.error("Error completo al iniciar sesión:", error);

      if (error.code === "auth/user-not-found") {
        setError("No existe un usuario con ese correo");
      } else if (error.code === "auth/wrong-password") {
        setError("La contraseña es incorrecta");
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const cred = await loginWithGoogle();
      const { displayName, email, uid } = cred.user;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const [nombre, ...apellidoParts] = displayName.split(" ");
        const apellido = apellidoParts.join(" ");
        localStorage.setItem("nombre", nombre);
        localStorage.setItem("apellido", apellido);
        localStorage.setItem("email", email);
        navigate("/completar-perfil");
      } else {
        const userData = userSnap.data();
        if (!userData.rol) {
          navigate("/completar-perfil");
        } else if (userData.rol === "consejero") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error.message);
      setError("Error al iniciar con Google");
    }
  };

  return (
    <div className="w-full max-w-xs m-auto">
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
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5"
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
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5"
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Ingresar"}
          </button>
          <Link
            to="/forgotpassword"
            className="text-xs font-bold text-blue-500 hover:text-blue-800"
          >
            ¿Olvidaste la contraseña?
          </Link>
        </div>
      </form>
      <p className="my-4 text-sm flex justify-between px-3">
        ¿No tienes una cuenta? <Link to="/register">Registrarse</Link>
      </p>
      <button
        className="bg-slate-50 hover:bg-slate-200 text-black shadow-md rounded py-2 px-4 w-full"
        onClick={handleGoogle}
      >
        <FontAwesomeIcon icon={faGoogle} /> Iniciar sesión con Google
      </button>
      {error && <Alert message={error} />}
    </div>
  );
}
