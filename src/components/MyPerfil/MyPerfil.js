import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function MyPerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      console.log("🟡 User actual:", user); // <-- Acá siempre debe imprimirse

      if (!user?.uid) return;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
        } else {
          console.log("❌ No se encontró el perfil del usuario en Firestore");
        }
      } catch (error) {
        console.error("🚨 Error al obtener perfil:", error);
      }
    };

    fetchPerfil();
  }, [user]);

  if (!perfil) {
    if (!perfil) {
      return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={user?.photoURL || "/img/avatar-default.png"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full border object-cover transition-transform hover:scale-105"
        />

        <div>
          <h2 className="text-2xl font-bold text-morado-principal">
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
