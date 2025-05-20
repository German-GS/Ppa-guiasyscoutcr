import React, { useState } from "react";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import { Alert } from "./Alert";

export function ModalAgregarProtagonista({ onClose, onProtagonistaAgregado }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleAgregar = async () => {
    setMensaje("");
    setError("");

    if (!email) {
      setError("Debes ingresar un correo electrónico.");
      return;
    }

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No se encontró un usuario con ese correo.");
        return;
      }

      const userSnap = querySnapshot.docs[0];
      const data = userSnap.data();

      if (data.rol !== "Protagonista") {
        setError("El usuario no tiene el rol de protagonista.");
        return;
      }

      await setDoc(doc(db, "consejeros", user.uid, "protagonistas", userSnap.id), {
        email,
        uid: userSnap.id,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        photoURL: data.photoURL || "",
        agregadoEn: new Date(),
      });

      setMensaje("Protagonista agregado correctamente.");

      // Notificar al padre para que recargue la lista
      if (onProtagonistaAgregado) onProtagonistaAgregado();

      // Cerrar el modal luego de una pequeña espera
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al agregar al protagonista.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-scout mb-4">
          Agregar Guía Mayor / Rover
        </h2>

        <label className="block text-gray-700 text-sm mb-1">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-800"
          placeholder="correo@ejemplo.com"
        />

        {mensaje && <Alert message={mensaje} type="success" />}
        {error && <Alert message={error} type="error" />}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="px-4 py-2 text-sm bg-scout text-white rounded hover:bg-yellow-500"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
