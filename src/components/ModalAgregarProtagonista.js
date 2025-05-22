import React, { useState } from "react";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";
import { Alert } from "./Alert";

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

    const emailClean = email.toLowerCase().trim();
    if (!emailClean) {
      setError("Debes ingresar un correo electrónico.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Buscar usuario por email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailClean));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No se encontró un usuario con ese correo.");
        setIsLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 2. Validar rol de protagonista
      if ((userData.rol || "").toLowerCase() !== "protagonista") {
        setError("El usuario no tiene rol de protagonista.");
        setIsLoading(false);
        return;
      }

      // 3. Prevenir auto-asignación
      if (userDoc.id === user.uid) {
        setError("No puedes agregarte a ti mismo como protagonista.");
        setIsLoading(false);
        return;
      }

      // 4. Crear/actualizar documento del consejero
      const consejeroRef = doc(db, "consejeros", user.uid);
      await setDoc(consejeroRef, {
        uid: user.uid,
        email: user.email,
        rol: "consejero",
        actualizado: serverTimestamp()
      }, { merge: true });

      // 5. Verificar si la relación ya existe
      const protaRef = doc(db, "consejeros", user.uid, "protagonistas", userDoc.id);
      const protaSnap = await getDoc(protaRef);
      
      if (protaSnap.exists()) {
        setError("Este protagonista ya está asociado a tu cuenta.");
        setIsLoading(false);
        return;
      }

      // 6. Crear la relación consejero-protagonista
      await setDoc(protaRef, {
        ...userData,
        id: userDoc.id,
        agregadoEn: serverTimestamp(),
        consejeroId: user.uid,
        consejeroEmail: user.email
      });

      // 7. Éxito - cerrar modal después de 1.5 segundos
      setMensaje(`${userData.nombre || "El protagonista"} fue agregado correctamente.`);
      if (onProtagonistaAgregado) onProtagonistaAgregado();
      setTimeout(() => onClose(), 1500);

    } catch (err) {
      console.error("Error al agregar protagonista:", err);
      setError(`Error: ${err.message || "Por favor verifica e intenta nuevamente."}`);
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