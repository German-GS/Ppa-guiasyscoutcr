import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function ProtagonistasGrid({ onSelectProtagonista, recargar }) {
  const { user } = useAuth();
  const [protagonistas, setProtagonistas] = useState([]);

  const fetchProtagonistas = async () => {
    if (!user) return;
    const colRef = collection(db, "consejeros", user.uid, "protagonistas");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        uid: d.userId ?? doc.id, // usa el campo userId o el id del documento
        ...d,
      };
    });

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

    try {
      // Eliminar la relación en la subcolección
      const ref = doc(db, "consejeros", user.uid, "protagonistas", id);
      await deleteDoc(ref);

      // También puedes limpiar metadatos si hubieras almacenado esta relación en otro lado,
      // por ejemplo, en el documento del usuario en /users/{id} con un campo `consejeroId`:

      // const userRef = doc(db, "users", id);
      // await updateDoc(userRef, { consejeroId: deleteField() });

      fetchProtagonistas();
    } catch (error) {
      console.error("Error al eliminar protagonista:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e69500] mt-4 mb-4">
        Protagonistas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {protagonistas.map((prota) => (
          <div
            key={prota.id}
            onClick={() => handleClick(prota)}
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer relative"
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // evitar que dispare el click general
                handleEliminar(prota.id);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 transition"
              title="Eliminar protagonista"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-gray-800">
              {prota.nombre || "Sin nombre"}
            </h3>
            <p className="text-sm text-gray-600">{prota.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
