// src/components/NotificacionesProtagonista.js

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
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import { BellIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // <-- 1. IMPORTAR useNavigate

export function NotificacionesProtagonista() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate(); // <-- 2. INICIALIZAR useNavigate

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

  // ▼▼▼ 3. FUNCIÓN MODIFICADA PARA MANEJAR DIFERENTES TIPOS DE NOTIFICACIÓN ▼▼▼
  const manejarRespuesta = async (id, aceptado) => {
    try {
      const noti = notificaciones.find(n => n.id === id);
      if (!noti) throw new Error("Notificación no encontrada");

      const notifRef = doc(db, "notificaciones", user.uid, "invitaciones", id);
      
      // Si se acepta una votación, simplemente redirigimos y cerramos la notificación.
      if (aceptado && noti.tipo === 'votacion_ciclo') {
        await updateDoc(notifRef, { estado: "visto" }); // Marcamos como vista
        setNotificaciones(prev => prev.filter(n => n.id !== id));
        setAbierto(false); // Cerramos el menú de notificaciones
        navigate('/consejo-comunidad'); // Redirigimos a la página de votación
        return; // Terminamos la ejecución aquí
      }

      // Si se rechaza una votación, solo se actualiza el estado.
      if(!aceptado && noti.tipo === 'votacion_ciclo'){
        await updateDoc(notifRef, { estado: "rechazado" });
        setNotificaciones(prev => prev.filter(n => n.id !== id));
        return;
      }

      // Lógica original para otro tipo de invitaciones (ej. unirse a la comunidad)
      await updateDoc(notifRef, {
        estado: aceptado ? "aceptado" : "rechazado"
      });

      if (aceptado) {
        const perfilRef = doc(db, "users", user.uid);
        const perfilSnap = await getDoc(perfilRef);
        const userData = perfilSnap.exists() ? perfilSnap.data() : {};

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

      setNotificaciones(prev => prev.filter(n => n.id !== id));

    } catch (error) {
      console.error("Error al manejar respuesta:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar la respuesta.",
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