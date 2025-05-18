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
      if (loading) return; // Espera que se resuelva el estado de autenticación
      if (!user) {
        navigate("/login");
        return;
      }

      const perfilRef = doc(db, "users", user.uid);
      const perfilSnap = await getDoc(perfilRef);

      if (!perfilSnap.exists()) {
        navigate("/completar-perfil");
        return;
      }

      const data = perfilSnap.data();
      if (data.rol === "Protagonista") {
        navigate("/home");
      } else if (data.rol === "Consejero") {
        navigate("/admin");
      } else {
        navigate("/completar-perfil");
      }
    };

    redirigir();
  }, [user, loading, navigate]);

  return null; // No renderiza nada, solo redirige
}

