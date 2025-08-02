// src/components/GestionComunidad.js

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { ProtagonistaCard } from "../ProtagonistaCard/ProtagonistaCard";
import Swal from "sweetalert2";

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
    const fetchConsejo = async () => {
      const comunidadRef = doc(db, "comunidades", user.uid);
      const docSnap = await getDoc(comunidadRef);
      if (docSnap.exists() && docSnap.data().consejo) {
        setConsejo(docSnap.data().consejo);
      }
    };
    Promise.all([fetchProtagonistas(), fetchConsejo()]).finally(() =>
      setLoading(false)
    );
  }, [user]);

  // ▼▼▼ FUNCIÓN onDragEnd COMPLETAMENTE REESCRITA ▼▼▼
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newConsejoState = { ...consejo };

    // Limpiar el rol de origen si el protagonista venía de un rol
    let sourceRolId = null;
    if (source.droppableId.startsWith("rol-")) {
      sourceRolId = source.droppableId.replace("rol-", "");
      newConsejoState[sourceRolId] = null;
    }

    // Colocar el protagonista en el rol de destino
    if (destination.droppableId.startsWith("rol-")) {
      const destRolId = destination.droppableId.replace("rol-", "");
      const protagonistaMovido = protagonistas.find(
        (p) => p.id === draggableId
      );
      const protagonistaQueEstaba = consejo[destRolId];

      // Poner al nuevo protagonista en el rol de destino
      newConsejoState[destRolId] = protagonistaMovido;

      // Si había alguien en ese rol, moverlo al rol de donde venía el otro
      // (esto maneja el intercambio o "swap")
      if (protagonistaQueEstaba && sourceRolId) {
        newConsejoState[sourceRolId] = protagonistaQueEstaba;
      }
    }

    setConsejo(newConsejoState);
  };

  const guardarConsejo = async () => {
    console.log("1. Botón 'Guardar' presionado. Iniciando guardado...");
    if (!user) {
      console.error("Error: No hay usuario autenticado para guardar.");
      return;
    }

    try {
      const consejoParaGuardar = {};
      for (const rol in consejo) {
        if (consejo[rol]) {
          consejoParaGuardar[rol] = {
            // Usamos uid o id para ser más robustos
            uid: consejo[rol].uid || consejo[rol].id,
            nombre: consejo[rol].nombre,
            email: consejo[rol].email,
          };
        } else {
          consejoParaGuardar[rol] = null;
        }
      }

      console.log("2. Datos preparados para guardar:", consejoParaGuardar);

      const comunidadRef = doc(db, "comunidades", user.uid);
      console.log("3. Apuntando al documento:", comunidadRef.path);

      await setDoc(
        comunidadRef,
        { consejo: consejoParaGuardar },
        { merge: true }
      );

      console.log("4. ¡Guardado en Firestore exitoso!");

      Swal.fire({
        title: "¡Éxito!",
        text: "La configuración del Consejo ha sido guardada.",
        icon: "success",
        timer: 2000,
      });
    } catch (error) {
      console.error("5. Ocurrió un error en el bloque catch:", error);
      Swal.fire(
        "Error",
        "No se pudo guardar la configuración del Consejo.",
        "error"
      );
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
                            <ProtagonistaCard protagonista={consejo[rol.id]} />
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <div className="text-gray-400 text-center py-6">
                        Arrastra un protagonista aquí
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
                          <ProtagonistaCard protagonista={prota} />
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
