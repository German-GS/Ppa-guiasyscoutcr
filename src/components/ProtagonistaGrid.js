import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export function ProtagonistasGrid() {
  const { user } = useAuth();
  const [protagonistas, setProtagonistas] = useState([]);

  useEffect(() => {
    const fetchProtagonistas = async () => {
      if (!user) return;
      const colRef = collection(db, "consejeros", user.uid, "protagonistas");
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProtagonistas(data);
    };

    fetchProtagonistas();
  }, [user]);

  const handleClick = (protagonista) => {
    console.log("Ir a datos de:", protagonista.email);
    // Aquí podrías usar navigate(`/ppa/${protagonista.id}`) si usas React Router
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-scout mb-4">Mis Protagonistas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {protagonistas.map((prota) => (
          <div
            key={prota.id}
            onClick={() => handleClick(prota)}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
          >
            <p className="text-gray-800 font-semibold">{prota.email}</p>
            <p className="text-sm text-gray-600">{prota.nombre || "Sin nombre aún"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
