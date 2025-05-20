import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export function ProtagonistasGrid({ onSelectProtagonista, recargar }) {
  const { user } = useAuth();
  const [protagonistas, setProtagonistas] = useState([]);

  const fetchProtagonistas = async () => {
    if (!user) return;
    const colRef = collection(db, "consejeros", user.uid, "protagonistas");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProtagonistas(data);
  };

  useEffect(() => {
    fetchProtagonistas();
  }, [user, recargar]); // <- se recarga al cambiar `recargar`

  const handleClick = (prota) => {
    if (onSelectProtagonista) onSelectProtagonista(prota);
  };

  const handleEliminar = async (id) => {
    if (!user || !id) return;
    const ref = doc(db, "consejeros", user.uid, "protagonistas", id);
    await deleteDoc(ref);
    fetchProtagonistas(); // recarga local luego de eliminar
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-scout mb-4">Mis Protagonistas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {protagonistas.map((prota) => (
          <div
            key={prota.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition relative"
          >
            <button
              onClick={() => handleEliminar(prota.id)}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              title="Eliminar"
            >
              ✕
            </button>
            <div onClick={() => handleClick(prota)} className="cursor-pointer">
              <p className="text-gray-800 font-semibold">{prota.email}</p>
              <p className="text-sm text-gray-600">
                {prota.nombre || "Sin nombre aún"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
