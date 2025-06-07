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
    const data = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      uid: d.userId ?? doc.id,  // usa el campo userId o el id del documento
      ...d
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
      <h2 className="text-xl font-bold text-scout-secondary mb-4">Mis Protagonistas</h2>
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
              <div className="cursor-pointer" onClick={() => handleClick(prota)}>
                <h3 className="text-lg font-bold text-gray-800">
                  {prota.nombre || "Sin nombre"}
                </h3>
                <p className="text-sm text-gray-600">{prota.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
