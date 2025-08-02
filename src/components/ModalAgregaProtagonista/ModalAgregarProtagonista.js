// src/components/ModalAgregarProtagonista.js
import React, { useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from "firebase/firestore";
import { Alert } from "../Alert";
import Swal from "sweetalert2";

export function ModalAgregarProtagonista({ onClose, onProtagonistaAgregado }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const consejero = auth.currentUser;

  const crearNotificacionInvitacion = async (protaUid, protaData) => {
    const batch = writeBatch(db);
    const invitacionRef = doc(
      collection(db, `notificaciones/${protaUid}/invitaciones`)
    );

    const consejeroDoc = await getDocs(
      query(collection(db, "users"), where("email", "==", consejero.email))
    );
    const consejeroData = consejeroDoc.docs[0].data();

    batch.set(invitacionRef, {
      tipo: "invitacion",
      de: consejero.uid,
      deNombre: consejeroData.nombre || "Un consejero",
      para: protaUid,
      estado: "pendiente",
      fecha: new Date(),
      mensaje: `El consejero ${
        consejeroData.nombre || ""
      } te invita a su comunidad.`,
    });

    await batch.commit();
  };

  const handleAgregar = async () => {
    setError("");
    setIsLoading(true);
    const emailClean = email.toLowerCase().trim();

    try {
      // 1. Buscar al protagonista por email
      const q = query(
        collection(db, "users"),
        where("email", "==", emailClean),
        where("rol", "==", "Protagonista")
      );
      const userQuerySnapshot = await getDocs(q);

      if (userQuerySnapshot.empty) {
        throw new Error(
          "No se encontró un protagonista con ese correo electrónico."
        );
      }

      const protaDoc = userQuerySnapshot.docs[0];
      const protaData = protaDoc.data();
      const protaUid = protaDoc.id;

      // 2. Crear y enviar la notificación
      await crearNotificacionInvitacion(protaUid, protaData);

      Swal.fire({
        title: "¡Invitación enviada!",
        text: `Se ha enviado una invitación a ${protaData.nombre}.`,
        icon: "success",
        timer: 3000,
      });

      onProtagonistaAgregado?.();
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Error al agregar protagonista:", error);
      setError(error.message || "Ocurrió un error al enviar la invitación.");
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
