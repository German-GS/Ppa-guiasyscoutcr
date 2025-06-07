import React, { useState } from "react";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  writeBatch,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import { Alert } from "./Alert";
import Swal from "sweetalert2";

async function crearNotificacionInvitacion(consejeroUid, protaUid, protaEmail, consejeroNombre) {
  const batch = writeBatch(db);

  try {
    console.log("⏳ 1. Obteniendo documentos de usuario...");
    const [protaDoc] = await Promise.all([
      getDoc(doc(db, "users", protaUid))
    ]);

    if (!protaDoc.exists()) {
      console.error("❌ El usuario protagonista no existe");
      throw new Error("El usuario no existe");
    }

    console.log("✅ Usuario protagonista encontrado");

    const notiPrincipalRef = doc(db, "notificaciones", protaUid);
    const invitacionesRef = collection(db, `notificaciones/${protaUid}/invitaciones`);
    const invitacionRef = doc(invitacionesRef);

    console.log("🔍 2. Verificando si ya hay invitación pendiente...");
    const q = query(
      invitacionesRef,
      where("de", "==", consejeroUid),
      where("estado", "==", "pendiente")
    );
    const snapshot = await getDocs(q);

    console.log("✅ No hay invitación previa");

    // 3. Preparar batch
    const invitacionData = {
      tipo: "invitacion",
      de: consejeroUid,
      deNombre: consejeroNombre,
      para: protaUid,
      paraEmail: protaEmail,
      estado: "pendiente",
      fecha: serverTimestamp(),
      mensaje: `El consejero ${consejeroNombre} te invita a su comunidad.`,
      leido: false,
      desdeConsejero: true // 🔐 Identificador para distinguir el origen
    };

    const notificacionData = {
      notificaciones: [],
      creadoEn: serverTimestamp(),
      userId: protaUid,
      email: protaEmail
    };

    const existeNoti = await getDoc(notiPrincipalRef);
      console.log("🔎 existeNoti.exists():", existeNoti.exists());
      console.log("🔎 existeNoti.data():", existeNoti.data());

      if (!existeNoti.exists()) {
        console.log("📄 Añadiendo creación de notificaciones/{userId} al batch");
        batch.set(notiPrincipalRef, notificacionData);
      } else {
        console.log("📄 Documento notificaciones/{userId} ya existe");
      }


    console.log("📩 Añadiendo invitación al batch");
    console.log("🧾 invitacionData:", invitacionData);
    batch.set(invitacionRef, invitacionData);

    console.log("🚀 Ejecutando batch...");
    await batch.commit();

    console.log("✅ Batch commit exitoso");
    return { success: true, nombreProtagonista: protaDoc.data().nombre };

  } catch (error) {
    console.error("❌ Error en crearNotificacionInvitacion:", {
      error: error.message,
      stack: error.stack,
      consejeroUid,
      protaUid,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}



export function ModalAgregarProtagonista({ onClose, onProtagonistaAgregado }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleAgregar = async () => {
    setMensaje("");
    setError("");
    setIsLoading(true);

    try {
      // 1. Validación de entrada
      const emailClean = email.toLowerCase().trim();
      if (!emailClean.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error("Ingresa un email válido");
      }

      // 2. Verificar rol consejero (case-insensitive)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const userRol = userData?.rol?.toString().toLowerCase();
      
      if (userRol !== "consejero") {
        throw new Error("Solo los consejeros pueden agregar protagonistas");
      }

      // 3. Buscar usuario por email
      const q = query(
        collection(db, "users"),
        where("email", "==", emailClean),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No existe usuario con ese email");
      }

      // 4. Obtener datos del protagonista
      const protaDoc = querySnapshot.docs[0];
      const protaData = protaDoc.data();

      // 5. Validar rol protagonista (case-insensitive)
      const protaRol = protaData?.rol?.toString().toLowerCase();
      if (protaRol !== "protagonista") {
        throw new Error("Solo puedes invitar usuarios con rol 'Protagonista'");
      }

      // 6. Crear notificación de invitación
      const resultado = await crearNotificacionInvitacion(
        user.uid, 
        protaDoc.id, 
        protaData.email,
        userData.nombre || "Un consejero"
      );

      // 7. Éxito
      setMensaje(`Invitación enviada a ${resultado.nombreProtagonista}`);
      onProtagonistaAgregado?.();
      
      Swal.fire({
        title: "¡Invitación enviada!",
        text: `${resultado.nombreProtagonista} recibió una notificación para unirse a tu comunidad`,
        icon: "success",
        timer: 3000
      });
      
      setTimeout(onClose, 2000);

    } catch (error) {
      console.error("Error en handleAgregar:", error);
      setError(
        error.code === 'permission-denied' 
          ? "No tienes permisos para realizar esta acción. Contacta al administrador."
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-scout mb-4">
          Agregar Guía Mayor / Rover
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-1 text-gray-800"
            placeholder="ejemplo@siemprelistos.com"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">Ingresa el email registrado del protagonista</p>
        </div>

        {mensaje && <Alert message={mensaje} type="success" />}
        {error && <Alert message={error} type="error" />}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="px-4 py-2 text-sm bg-scout text-white rounded hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center min-w-24"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}