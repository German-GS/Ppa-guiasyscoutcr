import React, { useEffect, useState } from "react";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  collection,
  query,
  where,
  getDocs 
} from "firebase/firestore"; // Todos los imports necesarios
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import { BellIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";


export function NotificacionesProtagonista() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);

 // En NotificacionesProtagonista.js
useEffect(() => {
  const cargarNotificaciones = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, `notificaciones/${user.uid}/invitaciones`),
        where("estado", "==", "pendiente")
      );
      const snapshot = await getDocs(q);
      setNotificaciones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error cargando invitaciones:", error);
    }
  };

  cargarNotificaciones();
}, [user]);

  const manejarRespuesta = async (id, aceptado) => {
  try {
    const noti = notificaciones.find(n => n.id === id);
    if (!noti) {
      console.error("⚠️ Notificación no encontrada");
      return;
    }

    const notifRef = doc(db, "notificaciones", user.uid, "invitaciones", id);
    await updateDoc(notifRef, {
      estado: aceptado ? "aceptado" : "rechazado"
    });

    if (aceptado) {
  // Obtener datos del usuario actual
  const perfilRef = doc(db, "users", user.uid);
  const perfilSnap = await getDoc(perfilRef);
  const userData = perfilSnap.exists() ? perfilSnap.data() : {};

  // Asociar protagonista con consejero
  await setDoc(doc(db, `consejeros/${noti.de}/protagonistas/${user.uid}`), {
    uid: user.uid,
    nombre: userData.nombre || "Sin nombre",
    apellido: userData.apellido || "",
    email: user.email,
    agregadoEn: new Date()
  });
}

    Swal.fire({
      title: aceptado ? "¡Invitación aceptada!" : "Invitación rechazada",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    // Cierra la notificación
    setNotificaciones(prev => prev.filter(n => n.id !== id));

  } catch (error) {
    console.error("Error al manejar respuesta:", error);

    Swal.fire({
      title: "Error",
      text: "No se pudo procesar la invitación",
      icon: "error"
    });
  }
};


  return (
    <div className="relative mr-4">
      <button 
        onClick={() => setAbierto(!abierto)} 
        className="relative"
        aria-label="Notificaciones"
      >
        <BellIcon className="w-6 h-6 text-white" />
        {notificaciones.length > 0 && (
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-lg z-50 text-sm">
          {notificaciones.length === 0 ? (
            <div className="p-4 text-gray-500">No hay notificaciones</div>
          ) : (
            notificaciones.map((notif) => (
              <div key={notif.id} className="p-3 border-b border-gray-200">
                <p className="mb-2 text-gray-800">{notif.mensaje}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => manejarRespuesta(notif.id, true)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => manejarRespuesta(notif.id, false)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}