import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../firebase";
import { Ppa } from "../PPA/Ppa";
import { ArrowLeft } from "lucide-react";
import Modal from "react-modal";
import { GraficosProtagonista } from "../GraficosProtagonista/GraficosProtagonista";

// --- Funciones de ayuda para fechas ---
const toJavaScriptDate = (dateValue) => {
  if (!dateValue) return null;
  if (typeof dateValue.toDate === "function") return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) return d;
  return null;
};

const getVencimientoInfo = (ppa) => {
  if (ppa.estado === "evaluado")
    return { text: "Evaluado", style: "bg-gray-200 text-gray-800" };
  const fechaVencimiento = toJavaScriptDate(ppa.fechaDeVigencia);
  if (!fechaVencimiento)
    return { text: "Sin Vigencia", style: "bg-gray-200 text-gray-800" };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaVencimiento.setHours(0, 0, 0, 0);
  const diffTime = fechaVencimiento.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return { text: `Vencido`, style: "bg-red-100 text-red-800" };
  if (diffDays === 0)
    return {
      text: "Vence hoy",
      style: "bg-yellow-100 text-yellow-800 font-bold",
    };
  return {
    text: `Vence en ${diffDays} días`,
    style: "bg-green-100 text-green-800",
  };
};

export function ExpedienteProtagonista({ protagonista, onVolver }) {
  // Los hooks como useState deben estar SIEMPRE dentro de la función del componente
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
  const [ppaList, setPpaList] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (protagonista?.uid) {
        // Cargar perfil del usuario
        const docRef = doc(db, "users", protagonista.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDatosPerfil(data);
          setFormData((prev) => ({ ...prev, ...(data.etapas || {}) }));
          setRolEditado(data.rol || "protagonista");
        }

        // Cargar PPAs del usuario
        const q = query(
          collection(db, "PPA"),
          where("userId", "==", protagonista.uid)
        );
        const snapshot = await getDocs(q);
        const ppas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPpaList(ppas);
      }
    };
    cargarDatos();
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
    try {
      if (!protagonista?.uid) throw new Error("ID de protagonista no definido");

      await setDoc(
        doc(db, "users", protagonista.uid),
        {
          etapas: formData,
          rol: rolEditado,
        },
        { merge: true }
      );

      Swal.fire("¡Éxito!", "Expediente actualizado correctamente", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Error desconocido al guardar",
        "error"
      );
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
    return hoy.getFullYear() - ingreso.getFullYear();
  };

  const mensajeCercania21 = (fechaNacimientoStr) => {
    if (!fechaNacimientoStr) return null;
    const fecha21 = new Date(fechaNacimientoStr);
    fecha21.setFullYear(fecha21.getFullYear() + 21);
    const hoy = new Date();
    const diferencia = fecha21.getTime() - hoy.getTime();
    const mesesRestantes = diferencia / (1000 * 60 * 60 * 24 * 30.44);
    if (mesesRestantes <= 7 && mesesRestantes > 0) {
      return "Está cercano a remar su propia canoa";
    }
    return "En edad Rover";
  };

  if (!protagonista || !datosPerfil) {
    return (
      <div className="text-gray-800 text-center p-10">
        Cargando datos del protagonista...
      </div>
    );
  }

  const edadCalculada = calcularEdad(datosPerfil.fechaNacimiento);
  const añosMovimiento = tiempoMovimiento(datosPerfil.fechaIngreso);
  const estadoRemar = mensajeCercania21(datosPerfil.fechaNacimiento);

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-morado-principal">
              Expediente de {datosPerfil.nombre} {datosPerfil.apellido}
            </h2>
            <p className="text-sm text-gray-500 italic">
              Ficha editable de progresión personal
            </p>
          </div>
          <button
            onClick={onVolver}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <img
            src={datosPerfil.photoURL || "/img/avatar-default.png"}
            alt="Foto del protagonista"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <p className="text-lg font-semibold">
              {datosPerfil.nombre} {datosPerfil.apellido}
            </p>
            <p className="text-gray-600">{datosPerfil.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <strong>Edad:</strong> {edadCalculada} años
          </div>
          <div>
            <strong>Estado:</strong>{" "}
            <span className="text-blue-500">{estadoRemar}</span>
          </div>
          <div>
            <strong>Tiempo en el movimiento:</strong> {añosMovimiento} años
          </div>
          <div>
            <strong>Fecha de nacimiento:</strong> {datosPerfil.fechaNacimiento}
          </div>
          <div>
            <strong>Fecha de ingreso:</strong> {datosPerfil.fechaIngreso}
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Rol:</strong>
            <select
              value={rolEditado}
              onChange={handleRolChange}
              className="border-input"
            >
              <option value="protagonista">Protagonista</option>
              <option value="consejero">Consejero</option>
            </select>
          </div>
          <div>
            <strong>Grupo Scout:</strong> {datosPerfil.grupo}
          </div>
          <div>
            <strong>Provincia:</strong> {datosPerfil.provincia}
          </div>
          <div>
            <strong>Cantón:</strong> {datosPerfil.canton}
          </div>
          <div>
            <strong>Distrito:</strong> {datosPerfil.distrito}
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="text-xl font-bold text-morado-principal mb-4">
          Hoja de Ruta de Progresión
        </h3>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h4 className="font-bold text-lg text-scout-secondary mb-3">
            Etapa de Decisión
          </h4>
          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-gray-800">
              <input
                type="checkbox"
                name="decision"
                checked={formData.decision || false}
                onChange={handleChange}
                className="mr-2"
              />
              Etapa Completada
            </label>
            <input
              type="date"
              name="decisionFecha"
              value={formData.decisionFecha || ""}
              onChange={handleChange}
              className="border-input"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-lg text-scout-secondary mb-3">
            Etapa de Compromiso
          </h4>
          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-gray-800">
              <input
                type="checkbox"
                name="compromiso"
                checked={formData.compromiso || false}
                onChange={handleChange}
                className="mr-2"
              />
              Etapa Iniciada (Ceremonia de Compromiso)
            </label>
            <input
              type="date"
              name="compromisoFecha"
              value={formData.compromisoFecha || ""}
              onChange={handleChange}
              className="border-input"
            />
          </div>
          <hr className="my-4" />
          <p className="text-sm text-gray-600 mb-3 italic">
            Hitos dentro del Compromiso:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                label: "Confirmación",
                field: "confirmacion",
                dateField: "confirmacionFecha",
              },
              {
                label: "Insignia de Servicio",
                field: "insigniaServicio",
                dateField: "insigniaFecha",
              },
            ].map(({ label, field, dateField }) => (
              <div key={field} className="grid grid-cols-2 gap-2 items-center">
                <label className="text-gray-800">
                  <input
                    type="checkbox"
                    name={field}
                    checked={formData[field] || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {label}
                </label>
                <input
                  type="date"
                  name={dateField}
                  value={formData[dateField] || ""}
                  onChange={handleChange}
                  className="border-input"
                />
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-6 mb-3 italic">
            Campamentos en Soledad:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-2 gap-2 items-center">
                <label className="text-gray-800">Campamento Soledad {n}</label>
                <input
                  type="date"
                  name={`campamento${n}`}
                  value={formData[`campamento${n}`] || ""}
                  onChange={handleChange}
                  className="border-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-gray-800 font-semibold mb-1">
            Observaciones (Notas Privadas)
          </label>
          <textarea
            name="observaciones"
            rows="4"
            className="w-full border-input"
            value={formData.observaciones || ""}
            onChange={handleChange}
            placeholder="Anotaciones sobre el progreso, conversaciones importantes, etc."
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={guardarCambios}
            className="btn-primary"
            style={{ width: "auto", padding: "0.5rem 1rem" }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      <div>
        <GraficosProtagonista
          ppaList={ppaList}
          evaluacionData={datosPerfil?.brujulaState}
        />
      </div>

      {/* --- 3. LISTA DE PPAs MEJORADA --- */}
      <div className="max-w-4xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-morado-principal mb-4">
          PPAs registrados por el protagonista
        </h3>
        {ppaList.length > 0 ? (
          <div className="space-y-4">
            {ppaList.map((ppa, index) => {
              const vencimiento = getVencimientoInfo(ppa);
              const fechaCreacion = toJavaScriptDate(ppa.createdAt);
              const fechaVencimiento = toJavaScriptDate(ppa.fechaDeVigencia);
              return (
                <div
                  key={ppa.id}
                  className="p-4 bg-white border rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      PPA #{index + 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Creado:{" "}
                      {fechaCreacion
                        ? fechaCreacion.toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Vence:{" "}
                      {fechaVencimiento
                        ? fechaVencimiento.toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${vencimiento.style}`}
                    >
                      {vencimiento.text}
                    </span>
                    <button
                      onClick={() => setSelectedPpa(ppa)}
                      className="btn-secondary"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">
            Este protagonista aún no ha registrado ningún PPA.
          </p>
        )}
      </div>

      {/* Modal para ver PPA (sin cambios) */}
      <Modal
        isOpen={!!selectedPpa}
        onRequestClose={() => setSelectedPpa(null)}
        contentLabel="Detalles del PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70"
      >
        {selectedPpa && (
          <Ppa
            selectedPpa={selectedPpa}
            closeModal={() => setSelectedPpa(null)}
            mostrarBotonEditar={false}
          />
        )}
      </Modal>
    </>
  );
}
