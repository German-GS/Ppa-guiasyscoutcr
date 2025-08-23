// src/components/GestionComunidad/GestionComunidad.js (Actualizado con edición inline del nombre)

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { ProtagonistaCard } from "../ProtagonistaCard/ProtagonistaCard";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react"; // ▼▼▼ 1. IMPORTAMOS EL ÍCONO DE LÁPIZ ▼▼▼

const rolesDelConsejo = {
  coordinador: { id: "coordinador", nombre: "Coordinador(a)" },
  secretario: { id: "secretario", nombre: "Secretario(a)" },
  cronista: { id: "cronista", nombre: "Cronista" },
  tesorero: { id: "tesorero", nombre: "Tesorero(a)" },
  intendente: { id: "intendente", nombre: "Intendente" },
};

export function GestionComunidad() {
  const { user } = useAuth();
  const [protagonistas, setProtagonistas] = useState([]);
  const [nombreComunidad, setNombreComunidad] = useState("");
  // ▼▼▼ 2. AÑADIMOS ESTADO PARA CONTROLAR EL "MODO EDICIÓN" ▼▼▼
  const [isEditingName, setIsEditingName] = useState(false);
  const [consejo, setConsejo] = useState({
    coordinador: null,
    secretario: null,
    cronista: null,
    tesorero: null,
    intendente: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchProtagonistas = async () => {
      const colRef = collection(db, "consejeros", user.uid, "protagonistas");
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProtagonistas(data);
    };

    const fetchConsejoYNombre = async () => {
      const comunidadRef = doc(db, "comunidades", user.uid);
      const docSnap = await getDoc(comunidadRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.consejo) setConsejo(data.consejo);
        if (data.nombreSeccion) {
          setNombreComunidad(data.nombreSeccion);
          setIsEditingName(false); // Si ya hay un nombre, no empezamos en modo edición
        } else {
          setIsEditingName(true); // Si no hay nombre, forzamos el modo edición
        }
      } else {
        setIsEditingName(true); // Si el documento no existe, forzamos modo edición
      }
    };
    Promise.all([fetchProtagonistas(), fetchConsejoYNombre()]).finally(() =>
      setLoading(false)
    );
  }, [user]);

  const onDragEnd = (result) => {
    // ... (Esta función se mantiene sin cambios)
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const newConsejoState = { ...consejo };
    let sourceRolId = null;
    if (source.droppableId.startsWith("rol-")) {
      sourceRolId = source.droppableId.replace("rol-", "");
      newConsejoState[sourceRolId] = null;
    }
    if (destination.droppableId.startsWith("rol-")) {
      const destRolId = destination.droppableId.replace("rol-", "");
      const protagonistaMovido = protagonistas.find(
        (p) => p.id === draggableId
      );
      const protagonistaQueEstaba = consejo[destRolId];
      newConsejoState[destRolId] = protagonistaMovido;
      if (protagonistaQueEstaba && sourceRolId) {
        newConsejoState[sourceRolId] = protagonistaQueEstaba;
      }
    }
    setConsejo(newConsejoState);
  };

  const guardarConsejo = async () => {
    if (!user) return;
    const batch = writeBatch(db); // Inicializamos el lote de escritura

    try {
      // 1. Preparamos los datos para el documento de la comunidad (como antes)
      const consejoParaGuardar = {};
      const protagonistasAsignados = new Map();
      for (const rol in consejo) {
        if (consejo[rol]) {
          const prota = consejo[rol];
          consejoParaGuardar[rol] = {
            uid: prota.uid || prota.id,
            nombre: prota.nombre,
            email: prota.email,
          };
          protagonistasAsignados.set(prota.uid || prota.id, rol); // Guardamos el rol de cada prota
        } else {
          consejoParaGuardar[rol] = null;
        }
      }
      const comunidadRef = doc(db, "comunidades", user.uid);
      batch.set(
        comunidadRef,
        { nombreSeccion: nombreComunidad, consejo: consejoParaGuardar },
        { merge: true }
      );

      // 2. Preparamos la actualización para el perfil de CADA protagonista
      for (const prota of protagonistas) {
        const protaId = prota.uid || prota.id;
        const protaRef = doc(db, "users", protaId);
        const puesto = protagonistasAsignados.get(protaId) || "miembro"; // Si no está en el consejo, es 'miembro'
        batch.update(protaRef, { puesto: puesto });
      }

      // 3. Ejecutamos todas las escrituras a la vez
      await batch.commit();

      setIsEditingName(false);
      Swal.fire({
        title: "¡Éxito!",
        text: "La configuración y los perfiles han sido actualizados.",
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("Ocurrió un error al guardar:", error);
      Swal.fire("Error", "No se pudo guardar la configuración.", "error");
    }
  };

  if (loading) return <div>Cargando...</div>;

  const protagonistasAsignadosIds = Object.values(consejo)
    .filter((p) => p)
    .map((p) => p.uid || p.id);
  const protagonistasDisponibles = protagonistas.filter(
    (p) => !protagonistasAsignadosIds.includes(p.id)
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-scout-secondary mb-4">
        Gestión del Consejo de la Comunidad
      </h2>

      {/* ▼▼▼ 4. LÓGICA PARA MOSTRAR TÍTULO O INPUT ▼▼▼ */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        {isEditingName ? (
          <div>
            <label
              htmlFor="nombreComunidad"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Define el nombre de la Comunidad
            </label>
            <input
              type="text"
              id="nombreComunidad"
              name="nombreComunidad"
              value={nombreComunidad}
              onChange={(e) => setNombreComunidad(e.target.value)}
              className="border-input"
              placeholder="Ej: Comunidad Galahad"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold text-morado-principal">
              {nombreComunidad}
            </h3>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-gray-500 hover:text-morado-principal transition-colors"
            >
              <Pencil size={20} />
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(rolesDelConsejo).map((rol) => (
              <Droppable key={rol.id} droppableId={`rol-${rol.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg border-2 border-dashed min-h-[120px] ${
                      snapshot.isDraggingOver
                        ? "border-morado-principal bg-purple-50"
                        : "border-gray-300"
                    }`}
                  >
                    <h3 className="font-bold text-morado-principal mb-2">
                      {rol.nombre}
                    </h3>
                    {consejo[rol.id] ? (
                      <Draggable
                        draggableId={consejo[rol.id].uid || consejo[rol.id].id}
                        index={0}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {" "}
                            <ProtagonistaCard
                              protagonista={consejo[rol.id]}
                            />{" "}
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <div className="text-gray-400 text-center py-6">
                        {" "}
                        Arrastra un protagonista aquí{" "}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-scout-secondary mb-4">
              Protagonistas Disponibles
            </h3>
            <Droppable droppableId="protagonistasDisponibles">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[100px]"
                >
                  {protagonistasDisponibles.map((prota, index) => (
                    <Draggable
                      key={prota.id}
                      draggableId={prota.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {" "}
                          <ProtagonistaCard protagonista={prota} />{" "}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
      <div className="mt-8 flex justify-end">
        <button
          onClick={guardarConsejo}
          className="btn-morado px-6 py-2 rounded-lg font-semibold hover:scale-105 transition shadow-sm"
        >
          Guardar Cambios en el Consejo
        </button>
      </div>
    </div>
  );
}
