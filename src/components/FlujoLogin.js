import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export function FlujoLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserData = async () => {
      if (!user?.uid) return;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Usuario sin datos adicionales
        navigate("/completar-datos");
        return;
      }

      const userData = userSnap.data();

      // Redirigir según rol
      if (userData.rol === "consejero") {
        navigate("/admin");
      } else if (userData.rol === "protagonista") {
        navigate("/");
      } else {
        // Si no tiene rol definido, pedir completar datos
        navigate("/completar-datos");
      }
    };

    checkUserData();
  }, [user, navigate]);

  return null;
}
