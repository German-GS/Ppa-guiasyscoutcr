import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function MyPerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user?.uid) return;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
        } else {
          console.log("No se encontró el perfil");
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };

    fetchPerfil();
  }, [user]);

  if (!perfil) {
    return <p className="text-gray-700">Cargando perfil...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={user?.photoURL || "/img/avatar-default.png"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full border object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {perfil.nombre} {perfil.apellido}
          </h2>
          <p className="text-gray-500">{perfil.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
        <div>
          <strong>Edad:</strong> {perfil.edad}
        </div>
        <div>
          <strong>Rol:</strong> {perfil.rol}
        </div>
        <div>
          <strong>Grupo Scout:</strong> {perfil.grupo}
        </div>
        <div>
          <strong>Provincia:</strong> {perfil.provincia}
        </div>
        <div>
          <strong>Cantón:</strong> {perfil.canton}
        </div>
        <div>
          <strong>Distrito:</strong> {perfil.distrito}
        </div>
      </div>
    </div>
  );
}
