// src/components/EvaluacionPpa/EvaluacionPpa.js

import React, { useState, useRef } from "react";
import { InputForm } from "../InputForm/InputForm";
import Swal from "sweetalert2";
// ▼▼▼ 1. IMPORTA LA FUNCIÓN DE GUARDADO ▼▼▼
import { savePpaEvaluation } from "../../firebase";

export function EvaluacionPpa({ ppaToEvaluate, onClose }) {
  const [isSaving, setIsSaving] = useState(false);

  const refs = {
    logrosImportantes: useRef(),
    otrosLogros: useRef(),
  };

  const [actividades, setActividades] = useState(
    ppaToEvaluate.actividad.map((act) => ({ ...act, statusFinal: "pendiente" }))
  );

  const handleStatusChange = (activityId, newStatus) => {
    setActividades((prev) =>
      prev.map((act) =>
        act.id === activityId ? { ...act, statusFinal: newStatus } : act
      )
    );
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const evaluationData = {
      logrosImportantes: refs.logrosImportantes.current.getValues(),
      otrosLogros: refs.otrosLogros.current.getValues(),
      actividadesFinales: actividades,
      // Añadimos las actividades pendientes para que la regla de Firestore funcione
      actividadesPendientes: actividades.filter(
        (act) => act.statusFinal === "pendiente"
      ),
    };

    try {
      // ▼▼▼ 2. DESCOMENTA Y ACTIVA LA LÍNEA DE GUARDADO ▼▼▼
      await savePpaEvaluation(ppaToEvaluate.id, evaluationData);

      Swal.fire(
        "¡Evaluación Guardada!",
        "Tu PPA ha sido evaluado y cerrado.",
        "success"
      );
      onClose();
    } catch (error) {
      console.error("Error al guardar la evaluación:", error);
      Swal.fire("Error", "No se pudo guardar la evaluación.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-scout mb-6 text-center">
        Evaluación de PPA
      </h2>

      <section className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-morado-principal">
          Los 5 logros más importantes de mi PPA
        </h3>
        <InputForm
          ref={refs.logrosImportantes}
          placeholder="Ej: Aprendí a tocar guitarra"
        />
      </section>

      <section className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-morado-principal">
          Otros logros importantes que no había planeado
        </h3>
        <InputForm
          ref={refs.otrosLogros}
          placeholder="Ej: Ayudé a un vecino en apuros"
        />
      </section>

      <section className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-morado-principal">
          Me queda pendiente
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Marca el estado final de las actividades de tu Plan de Acción.
        </p>
        <div className="flex flex-col gap-4">
          {actividades.map((act) => (
            <div
              key={act.id}
              className="bg-white border p-3 rounded-md flex flex-col sm:flex-row justify-between items-center gap-3"
            >
              <p className="font-semibold text-gray-700 text-left flex-grow">
                {act.descripcion}
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleStatusChange(act.id, "cumplido")}
                  className={`py-1 px-4 text-sm rounded-full font-semibold ${
                    act.statusFinal === "cumplido"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  Cumplido
                </button>
                <button
                  onClick={() => handleStatusChange(act.id, "pendiente")}
                  className={`py-1 px-4 text-sm rounded-full font-semibold ${
                    act.statusFinal === "pendiente"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Pendiente
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-4 mt-8">
        <button onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="btn-primary"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          {isSaving ? "Guardando..." : "Finalizar Evaluación"}
        </button>
      </div>
    </div>
  );
}
