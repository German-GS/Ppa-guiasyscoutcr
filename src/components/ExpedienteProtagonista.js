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
  const [rolEditado, setRolEditado] = useState("");

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
          setRolEditado(data.rol || "protagonista");
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

  const handleRolChange = (e) => {
    setRolEditado(e.target.value);
  };

  const guardarCambios = async () => {
    if (!protagonista?.uid) return;
    try {
      const ref = doc(db, "users", protagonista.uid);
      await setDoc(ref, { etapas: formData, rol: rolEditado }, { merge: true });
      alert("Datos guardados exitosamente.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los datos.");
    }
  };

  const calcularEdad = (fechaNacimientoStr) => {
    if (!fechaNacimientoStr) return null;
    const nacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const tiempoMovimiento = (fechaIngresoStr) => {
    if (!fechaIngresoStr) return null;
    const ingreso = new Date(fechaIngresoStr);
    const hoy = new Date();
    const diff = hoy.getFullYear() - ingreso.getFullYear();
    return diff;
  };

  const mensajeCercania21 = (fechaNacimientoStr) => {
    if (!fechaNacimientoStr) return null;
    const fecha21 = new Date(fechaNacimientoStr);
    fecha21.setFullYear(fecha21.getFullYear() + 21);
    const hoy = new Date();
    const diferencia = fecha21.getTime() - hoy.getTime();
    const mesesRestantes = diferencia / (1000 * 60 * 60 * 24 * 30);
    if (mesesRestantes <= 7 && mesesRestantes > 0) {
      return "Está cercano a remar su propia canoa";
    }
    return "OK!!";
  };

  if (!protagonista || !datosPerfil) {
    return <div className="text-gray-800">Cargando datos del protagonista...</div>;
  }

  const edadCalculada = calcularEdad(datosPerfil.fechaNacimiento);
  const añosMovimiento = tiempoMovimiento(datosPerfil.fechaIngreso);
  const estadoRemar = mensajeCercania21(datosPerfil.fechaNacimiento);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-scout">
          Expediente de {datosPerfil.nombre} {datosPerfil.apellido}
        </h2>
        <button
          onClick={onVolver}
          className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600"
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
        <div><strong>Edad:</strong> {edadCalculada} años</div>
        <div><strong>Estado:</strong> <span className="text-blue-500">{estadoRemar}</span></div>
        <div><strong>Tiempo en el movimiento:</strong> {añosMovimiento} años</div>
        <div><strong>Fecha de nacimiento:</strong> {datosPerfil.fechaNacimiento}</div>
        <div><strong>Fecha de ingreso:</strong> {datosPerfil.fechaIngreso}</div>
        <div><strong>Rol:</strong> 
          <select
            value={rolEditado}
            onChange={handleRolChange}
            className="ml-2 p-1 border rounded text-gray-800"
          >
            <option value="protagonista">Protagonista</option>
            <option value="consejero">Consejero</option>
          </select>
        </div>
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
