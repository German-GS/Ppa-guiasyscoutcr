// src/components/FlujoLogin.js
import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function FlujoLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirigir = async () => {
      if (loading) return;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const perfilRef = doc(db, "users", user.uid);
        const perfilSnap = await getDoc(perfilRef);

        if (!perfilSnap.exists()) {
          console.log("No se encontró perfil para UID:", user.uid);
          navigate("/completar-perfil");
          return;
        }

        const data = perfilSnap.data();
        const rol = data.rol?.toLowerCase();

        if (rol === "protagonista") {
          navigate("/home");
        } else if (rol === "consejero") {
          navigate("/admin");
        } else {
          navigate("/completar-perfil");
        }

      } catch (error) {
        console.error("Error al obtener perfil:", error);
        navigate("/completar-perfil");
      }
    };

    redirigir();
  }, [user, loading, navigate]);

  return null;
}

