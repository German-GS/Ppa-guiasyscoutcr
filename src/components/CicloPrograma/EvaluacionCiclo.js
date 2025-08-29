// src/components/CicloPrograma/EvaluacionCiclo.js (Corregido)
import React, { useState, useEffect } from "react";

const getStatusStyle = (status) => {
  switch (status) {
    case "logrado":
      return {
        container: "bg-green-50 border-green-200",
        button: "btn-primary bg-green-600 hover:bg-green-700",
      };
    case "parcial":
      return {
        container: "bg-yellow-50 border-yellow-200",
        button: "btn-primary bg-yellow-500 hover:bg-yellow-600",
      };
    case "no_logrado":
      return {
        container: "bg-red-50 border-red-200",
        button: "btn-primary bg-red-600 hover:bg-red-700",
      };
    default:
      return {
        container: "bg-gray-50 border-gray-200",
        button: "btn-secondary",
      };
  }
};

export function EvaluacionCiclo({ ciclo, onClose, onSave }) {
  const [formData, setFormData] = useState({
    evaluacionObjetivoGeneral: { status: "", observacion: "" },
    evaluacionObjetivosEspecificos: [],
    evaluacionActividades: [],
    observacionesFinales: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const newFormData = {};
    if (ciclo?.objetivosEspecificos) {
      newFormData.evaluacionObjetivosEspecificos =
        ciclo.objetivosEspecificos.map((obj) => ({
          textoOriginal: obj.texto,
          status: "",
          observacion: "",
        }));
    }
    if (ciclo?.cronograma) {
      newFormData.evaluacionActividades = ciclo.cronograma.map((act) => ({
        descripcionOriginal: act.descripcion,
        logroDelObjetivo: "",
        logrosEnActividad: "",
        aspectosPorMejorar: "",
        observaciones: "",
      }));
    }
    setFormData((prev) => ({ ...prev, ...newFormData }));
  }, [ciclo]);

  // ▼▼▼ FUNCIONES HANDLER AÑADIDAS ▼▼▼
  const handleStatusChange = (type, index, status) => {
    if (type === "general") {
      setFormData((prev) => ({
        ...prev,
        evaluacionObjetivoGeneral: {
          ...prev.evaluacionObjetivoGeneral,
          status,
        },
      }));
    } else {
      const nuevasEvaluaciones = [...formData.evaluacionObjetivosEspecificos];
      nuevasEvaluaciones[index].status = status;
      setFormData((prev) => ({
        ...prev,
        evaluacionObjetivosEspecificos: nuevasEvaluaciones,
      }));
    }
  };

  const handleObservacionChange = (type, index, value) => {
    if (type === "general") {
      setFormData((prev) => ({
        ...prev,
        evaluacionObjetivoGeneral: {
          ...prev.evaluacionObjetivoGeneral,
          observacion: value,
        },
      }));
    } else {
      const nuevasEvaluaciones = [...formData.evaluacionObjetivosEspecificos];
      nuevasEvaluaciones[index].observacion = value;
      setFormData((prev) => ({
        ...prev,
        evaluacionObjetivosEspecificos: nuevasEvaluaciones,
      }));
    }
  };

  const handleObservacionesFinalesChange = (e) => {
    setFormData((prev) => ({ ...prev, observacionesFinales: e.target.value }));
  };

  const handleActividadChange = (index, fieldName, value) => {
    const nuevasActividades = [...formData.evaluacionActividades];
    nuevasActividades[index][fieldName] = value;
    setFormData((prev) => ({
      ...prev,
      evaluacionActividades: nuevasActividades,
    }));
  };
  // ▲▲▲ FIN DE LAS FUNCIONES HANDLER ▲▲▲

  const handleSubmit = async () => {
    setIsSaving(true);
    await onSave(ciclo.id, formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          Evaluación General del Ciclo
        </h2>

        {/* --- SECCIÓN 1: EVALUACIÓN DE OBJETIVOS --- */}
        <section className="space-y-6 mb-8 border-b pb-6">
          {/* 1. Evaluación del Objetivo General */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Logro del Objetivo General del Ciclo
            </h3>
            <div
              className={`p-4 rounded-lg border ${
                getStatusStyle(formData.evaluacionObjetivoGeneral.status)
                  .container
              }`}
            >
              <p className="font-bold text-gray-800 italic">
                "{ciclo.objetivoGeneral}"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleStatusChange("general", null, "logrado")}
                  className={
                    formData.evaluacionObjetivoGeneral.status === "logrado"
                      ? getStatusStyle("logrado").button
                      : "btn-secondary"
                  }
                >
                  Logrado
                </button>
                <button
                  onClick={() => handleStatusChange("general", null, "parcial")}
                  className={
                    formData.evaluacionObjetivoGeneral.status === "parcial"
                      ? getStatusStyle("parcial").button
                      : "btn-secondary"
                  }
                >
                  Parcial
                </button>
                <button
                  onClick={() =>
                    handleStatusChange("general", null, "no_logrado")
                  }
                  className={
                    formData.evaluacionObjetivoGeneral.status === "no_logrado"
                      ? getStatusStyle("no_logrado").button
                      : "btn-secondary"
                  }
                >
                  No Logrado
                </button>
              </div>
              {formData.evaluacionObjetivoGeneral.status && (
                <div className="mt-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Observaciones sobre el Objetivo General
                  </label>
                  <textarea
                    value={formData.evaluacionObjetivoGeneral.observacion}
                    onChange={(e) =>
                      handleObservacionChange("general", null, e.target.value)
                    }
                    rows="2"
                    className="border-input w-full mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Evaluación de Objetivos Específicos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Logro de los Objetivos Específicos
            </h3>
            <div className="space-y-4">
              {formData.evaluacionObjetivosEspecificos.map(
                (evaluacion, index) => {
                  const style = getStatusStyle(evaluacion.status);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${style.container}`}
                    >
                      <p className="font-bold text-gray-800">
                        {evaluacion.textoOriginal}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() =>
                            handleStatusChange("especifico", index, "logrado")
                          }
                          className={
                            evaluacion.status === "logrado"
                              ? style.button
                              : "btn-secondary"
                          }
                        >
                          Logrado
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange("especifico", index, "parcial")
                          }
                          className={
                            evaluacion.status === "parcial"
                              ? style.button
                              : "btn-secondary"
                          }
                        >
                          Parcialmente Logrado
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              "especifico",
                              index,
                              "no_logrado"
                            )
                          }
                          className={
                            evaluacion.status === "no_logrado"
                              ? style.button
                              : "btn-secondary"
                          }
                        >
                          No Logrado
                        </button>
                      </div>
                      {evaluacion.status && (
                        <div className="mt-3">
                          <label className="text-sm font-semibold text-gray-700">
                            Observaciones del Objetivo
                          </label>
                          <textarea
                            value={evaluacion.observacion}
                            onChange={(e) =>
                              handleObservacionChange(
                                "especifico",
                                index,
                                e.target.value
                              )
                            }
                            rows="2"
                            className="border-input w-full mt-1"
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: EVALUACIÓN DE ACTIVIDADES --- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Evaluación de Actividades Ejecutadas
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left font-semibold text-gray-700">
                    Actividad
                  </th>
                  <th className="border p-2 text-left font-semibold text-gray-700">
                    Logro del objetivo*
                  </th>
                  <th className="border p-2 text-left font-semibold text-gray-700">
                    Logros en la actividad**
                  </th>
                  <th className="border p-2 text-left font-semibold text-gray-700">
                    Aspectos por mejorar***
                  </th>
                  <th className="border p-2 text-left font-semibold text-gray-700">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.evaluacionActividades.map((act, index) => (
                  <tr key={index} className="bg-white hover:bg-gray-50">
                    <td className="border p-2 font-semibold">
                      {act.descripcionOriginal}
                    </td>
                    <td className="border p-2">
                      <textarea
                        rows="3"
                        className="border-input w-full"
                        value={act.logroDelObjetivo}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "logroDelObjetivo",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        rows="3"
                        className="border-input w-full"
                        value={act.logrosEnActividad}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "logrosEnActividad",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        rows="3"
                        className="border-input w-full"
                        value={act.aspectosPorMejorar}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "aspectosPorMejorar",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        rows="3"
                        className="border-input w-full"
                        value={act.observaciones}
                        onChange={(e) =>
                          handleActividadChange(
                            index,
                            "observaciones",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- Observaciones Finales y Botones de acción --- */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Observaciones Finales del Ciclo
          </h3>
          <textarea
            value={formData.observacionesFinales}
            onChange={handleObservacionesFinalesChange}
            rows="4"
            className="border-input w-full"
            placeholder="Añade aquí cualquier comentario, conclusión o reflexión final sobre el ciclo en general."
          />
        </section>

        <div className="flex justify-end gap-4 mt-8 border-t pt-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? "Guardando..." : "Guardar Evaluación"}
          </button>
        </div>
      </div>
    </div>
  );
}
