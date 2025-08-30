/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "../Alert.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import ImgComunidad from "../../img/Raiders.sinFondo.png";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./Login.module.css";

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
    <div className={styles.loginContainer}>
      <div className="w-full max-w-sm bg-white py-8 px-6 rounded-2xl shadow-xl flex flex-col items-center">
        {/* --- Logo --- */}
        <img
          src={ImgComunidad}
          alt="Logo de la Comunidad"
          className="w-24 h-24 mb-8"
        />

        {/* --- Formulario --- */}
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              className="border-input" // Clase de index.css
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="******"
              className="border-input" // Clase de index.css
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <button
              type="submit"
              className={styles.btnLogin} // Clase de Login.module.css
              disabled={loading}
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
            <Link
              to="/forgotpassword"
              className="text-center text-sm font-bold text-morado-principal hover:underline"
            >
              ¿Olvidaste la contraseña?
            </Link>
          </div>
        </form>

        {/* --- Divisor --- */}
        <div className="my-6 flex items-center w-full">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-xs font-semibold text-gray-400">O</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* --- Botón de Google --- */}
        <button
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          onClick={handleGoogle}
        >
          <FontAwesomeIcon icon={faGoogle} />
          Iniciar sesión con Google
        </button>

        {/* --- Enlace de Registro --- */}
        <p className="mt-8 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="font-bold text-morado-principal hover:underline"
          >
            Regístrate
          </Link>
        </p>

        {/* --- Alerta de Error --- */}
        {error && (
          <div className="mt-4 w-full">
            <Alert message={error} />
          </div>
        )}
      </div>
    </div>
  );
}
