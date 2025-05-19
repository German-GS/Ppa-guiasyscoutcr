// src/components/ExpedienteProtagonista.js
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export function ExpedienteProtagonista({ protagonista, onVolver }) {
  const [formData, setFormData] = useState({
    decision: false,
    decisionFecha: "",
    compromiso: false,
    compromisoFecha: "",
    confirmacion: false,
    confirmacionFecha: "",
    insigniaServicio: false,
    insigniaFecha: "",
    campamento1: "",
    campamento2: "",
    campamento3: "",
    observaciones: "",
  });

  const [datosPerfil, setDatosPerfil] = useState(null);

  useEffect(() => {
    const cargarDatosExtra = async () => {
      if (protagonista?.uid) {
        const docRef = doc(db, "users", protagonista.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            ...data.etapas || {},
          }));
          setDatosPerfil(data);
        }
      }
    };

    cargarDatosExtra();
  }, [protagonista]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const guardarCambios = async () => {
    if (!protagonista?.uid) return;
    try {
      const ref = doc(db, "users", protagonista.uid);
      if (!protagonista.uid) {
        console.error("UID del protagonista no está definido");
        return alert("UID del protagonista no está definido");
      }
      
      console.log("Guardando para UID:", protagonista.uid);
      console.log("Datos a guardar:", formData);
      await setDoc(ref, { etapas: formData }, { merge: true });
      alert("Datos guardados exitosamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los datos.");
    }
  };

  if (!protagonista || !datosPerfil) {
    return <div className="text-gray-800">Cargando datos del protagonista...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-scout">
          Expediente de {datosPerfil.nombre} {datosPerfil.apellido}
        </h2>
        <button
          onClick={onVolver}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        <img
          src={datosPerfil.photoURL || "/img/avatar-default.png"}
          alt="Foto del protagonista"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <p className="text-lg font-semibold">{datosPerfil.nombre} {datosPerfil.apellido}</p>
          <p className="text-gray-600">{datosPerfil.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div><strong>Edad:</strong> {datosPerfil.edad}</div>
        <div><strong>Rol:</strong> {datosPerfil.rol}</div>
        <div><strong>Grupo Scout:</strong> {datosPerfil.grupo}</div>
        <div><strong>Provincia:</strong> {datosPerfil.provincia}</div>
        <div><strong>Cantón:</strong> {datosPerfil.canton}</div>
        <div><strong>Distrito:</strong> {datosPerfil.distrito}</div>
      </div>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Etapas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {[{
          label: "Decisión",
          field: "decision",
          dateField: "decisionFecha"
        }, {
          label: "Compromiso",
          field: "compromiso",
          dateField: "compromisoFecha"
        }, {
          label: "Confirmación",
          field: "confirmacion",
          dateField: "confirmacionFecha"
        }, {
          label: "Insignia de Servicio",
          field: "insigniaServicio",
          dateField: "insigniaFecha"
        }].map(({ label, field, dateField }) => (
          <div key={field} className="grid grid-cols-2 gap-2 items-center">
            <label className="text-gray-800">
              <input
                type="checkbox"
                name={field}
                checked={formData[field]}
                onChange={handleChange}
                className="mr-2"
              />
              {label}
            </label>
            <input
              type="date"
              name={dateField}
              value={formData[dateField]}
              onChange={handleChange}
              className="border p-1 rounded text-gray-800"
            />
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Campamento Soledad</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-2 gap-2 items-center">
            <label className="text-gray-800">Campamento Soledad {n}</label>
            <input
              type="date"
              name={`campamento${n}`}
              value={formData[`campamento${n}`]}
              onChange={handleChange}
              className="border p-1 rounded text-gray-800"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-gray-800 font-semibold mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          rows="4"
          className="w-full border rounded p-2 text-gray-800"
          value={formData.observaciones}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={guardarCambios}
          className="bg-scout text-white px-4 py-2 rounded hover:bg-yellow-500"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
