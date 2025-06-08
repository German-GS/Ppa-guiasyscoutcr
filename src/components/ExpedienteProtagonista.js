import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../firebase";
import { Ppa } from "./Ppa";
import { ArrowLeft } from "lucide-react";



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
  const [ppaList, setPpaList] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);

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

  const cargarPpasDelProtagonista = async () => {
    console.log("📦 Protagonista recibido:", protagonista);

    const userId = protagonista?.uid || protagonista?.id;
    console.log("🔍 userId usado para búsqueda de PPA:", typeof userId, userId);

    if (!userId) {
      console.warn("⚠️ userId es undefined o nulo");
      return;
    }

    try {
      const q = query(collection(db, "PPA"), where("userId", "==", userId));
      const snapshot = await getDocs(q);

      console.log("📄 Documentos encontrados en query:", snapshot.docs.length);

      const ppas = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("📄 Documento PPA:", doc.id, data);
        return { id: doc.id, ...data };
      });

      setPpaList(ppas);
      console.log("✅ PPAs encontrados:", ppas);
    } catch (error) {
      console.error("❌ Error al cargar PPAs:", error);
    }
  };





    cargarDatosExtra();
    cargarPpasDelProtagonista();
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
    if (!protagonista?.uid) {
      throw new Error("ID de protagonista no definido");
    }

    const datosCompletos = {
      uid: protagonista.uid,
      nombre: formData.nombre || datosPerfil.nombre || '',
      apellido: formData.apellido || datosPerfil.apellido || '',
      email: datosPerfil.email, // El email no debería cambiar
      grupo: datosPerfil.grupo || '307',
      provincia: datosPerfil.provincia || 'San José',
      canton: datosPerfil.canton || 'Merced',
      distrito: datosPerfil.distrito || '',
      fechaNacimiento: datosPerfil.fechaNacimiento,
      fechaIngreso: datosPerfil.fechaIngreso,
      rol: rolEditado,
      etapas: {
        ...formData,
        decisionFecha: formData.decision ? formData.decisionFecha : null,
        compromisoFecha: formData.compromiso ? formData.compromisoFecha : null
      },
      updatedAt: new Date().toISOString()
    };

      await setDoc(doc(db, "users", protagonista.uid), {
        etapas: {
          ...formData,
          decisionFecha: formData.decision ? formData.decisionFecha : null,
          compromisoFecha: formData.compromiso ? formData.compromisoFecha : null
        },
        campamento1: formData.campamento1 || "",
        campamento2: formData.campamento2 || "",
        campamento3: formData.campamento3 || "",
        rol: rolEditado,
        updatedAt: new Date().toISOString()
      }, { merge: true });


    Swal.fire({
      title: "¡Éxito!",
      text: "Expediente actualizado correctamente",
      icon: "success"
    });

    setDatosPerfil(prev => ({
      ...prev,
      etapas: {
        ...formData,
        decisionFecha: formData.decision ? formData.decisionFecha : null,
        compromisoFecha: formData.compromiso ? formData.compromisoFecha : null
      },
      campamento1: formData.campamento1 || "",
      campamento2: formData.campamento2 || "",
      campamento3: formData.campamento3 || "",
      rol: rolEditado,
      updatedAt: new Date().toISOString()
    }));


  } catch (error) {
    console.error("Error al guardar:", error);

    Swal.fire({
      title: "Error",
      text: error.message || "Error desconocido al guardar",
      icon: "error"
    });
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
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-morado-principal">
              Expediente de {datosPerfil.nombre} {datosPerfil.apellido}
            </h2>
            <p className="text-sm text-gray-500 italic">Ficha editable de progresión personal</p>
          </div>
          <button onClick={onVolver} className="btn-warning">
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
         <div className="flex items-center">
          <strong className="mr-2">Rol:</strong>
          <select
            value={rolEditado}
            onChange={handleRolChange}
            className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-morado-principal transition"
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
                value={formData[dateField] || ""}
                onChange={handleChange}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-morado-principal transition"
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
                value={formData[`campamento${n}`] || ""}
                onChange={handleChange}
                  className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-morado-principal transition"
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-gray-800 font-semibold mb-1">Observaciones</label>
          <textarea
            name="observaciones"
            rows="4"
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-morado-principal transition"
            value={formData.observaciones || ""}
            onChange={handleChange}
          />

        </div>

        <div className="flex justify-end">
          <button
            onClick={guardarCambios}
            className="btn-morado px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition shadow"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {ppaList.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <h3 className="text-xl font-bold text-morado-principal mb-4">
            PPAs registrados por el protagonista
          </h3>

          <div className="space-y-4">
            {ppaList.map((ppa, index) => (
              <div key={ppa.id} className="p-4 bg-white border rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>PPA #{index + 1}</strong> — Creado:{" "}
                    {ppa.createdAt?.toDate ? ppa.createdAt.toDate().toLocaleDateString() : "Sin fecha"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPpa(ppa)}
                  className="btn-morado px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition shadow"
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPpa && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-800 max-w-5xl w-full rounded-lg shadow-lg relative">
            <Ppa
              selectedPpa={selectedPpa}
              closeModal={() => setSelectedPpa(null)}
              onEdit={() => {}}
              mostrarBotonEditar={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
