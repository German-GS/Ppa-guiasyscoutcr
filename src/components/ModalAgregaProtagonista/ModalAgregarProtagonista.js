// src/components/ModalAgregarProtagonista.js
import React, { useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { Alert } from "../Alert";
import Swal from "sweetalert2";

export function ModalAgregarProtagonista({ onClose, onProtagonistaAgregado }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const normalizarEmail = (e) => e.trim().toLowerCase();

  // Crea una invitación en el buzón del protagonista
  const crearNotificacionInvitacion = async ({ protaUid, protaNombre }) => {
    const consejero = auth.currentUser;
    if (!consejero) throw new Error("No autenticado.");

    // Lee tu propio perfil por UID (reglas lo permiten)
    const consejeroSnap = await getDoc(doc(db, "users", consejero.uid));
    const consejeroData = consejeroSnap.exists() ? consejeroSnap.data() : {};

    // Crea un doc con ID auto en /notificaciones/{protaUid}/invitaciones
    const invitacionesCol = collection(
      db,
      `notificaciones/${protaUid}/invitaciones`
    );
    await setDoc(doc(invitacionesCol), {
      tipo: "invitacion",
      de: consejero.uid,
      deNombre: consejeroData.nombre || consejero.displayName || "Consejero",
      para: protaUid,
      estado: "pendiente",
      fecha: serverTimestamp(),
      mensaje: `El consejero ${
        consejeroData.nombre || consejero.displayName || ""
      } te invita a su comunidad.`,
    });
  };

  const handleAgregar = async () => {
    setError("");
    setIsLoading(true);

    try {
      const emailClean = normalizarEmail(email);
      if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
        setError("Ingresa un correo válido.");
        return;
      }

      const me = auth.currentUser;
      if (!me) {
        setError("No has iniciado sesión.");
        return;
      }
      if (emailClean === (me.email || "").toLowerCase()) {
        setError("No puedes invitarte a ti mismo.");
        return;
      }

      // 1) Buscar al protagonista por email Y ROL (alineado con tus reglas)
      //    Intento 1: "Protagonista"
      let q = query(
        collection(db, "users"),
        where("email", "==", emailClean),
        where("rol", "==", "Protagonista"),
        limit(1)
      );
      let snap = await getDocs(q);

      //    Intento 2: "protagonista" (por si el rol quedó en minúsculas)
      if (snap.empty) {
        q = query(
          collection(db, "users"),
          where("email", "==", emailClean),
          where("rol", "==", "protagonista"),
          limit(1)
        );
        snap = await getDocs(q);
      }

      if (snap.empty) {
        setError(
          "No existe un usuario registrado como Protagonista con ese correo."
        );
        return;
      }

      const protaDoc = snap.docs[0];
      const protaData = protaDoc.data();
      const protaUid = protaDoc.id;

      // 2) Crear y enviar la invitación al buzón del protagonista
      await crearNotificacionInvitacion({
        protaUid,
        protaNombre: protaData.nombre || "",
      });

      // 3) Feedback
      Swal.fire({
        title: "¡Invitación enviada!",
        text: `Se ha enviado una invitación a ${
          protaData.nombre || emailClean
        }.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      onProtagonistaAgregado?.();
      onClose?.();
    } catch (err) {
      console.error("Error al agregar protagonista:", err);
      if (err?.code === "permission-denied") {
        setError(
          "No tienes permisos para realizar esta operación. Asegúrate de que el correo pertenece a un usuario con rol 'Protagonista'."
        );
      } else {
        setError(err?.message || "Ocurrió un error al enviar la invitación.");
      }
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
          <label className="block text-gray-700 text-sm mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-1 text-gray-800"
            placeholder="ejemplo@siemprelistos.com"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Ingresa el email registrado del protagonista
          </p>
        </div>

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
            {isLoading ? "Procesando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
