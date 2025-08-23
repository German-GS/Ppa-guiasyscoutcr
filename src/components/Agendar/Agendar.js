// src/components/Agendar/Agendar.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faCalendarAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { WandSparkles } from "lucide-react";
import Swal from "sweetalert2";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";

// ---- Constantes (sin cambios) ----
const categoriasCompletas = {
  Interna: [
    "Reunión Ordinaria",
    "Reunión de Consejo",
    "Actividad de Servicio",
    "Proyecto de Comunidad",
    "Otro",
  ],
  Externa: [
    "Campamento/Caminata/Excursión",
    "Actividad de Servicio",
    "Proyecto de Comunidad",
    "Otro",
  ],
};

const categoriasSimples = [
  "Actividad de Servicio",
  "Campamento/Caminata/Excursión",
  "Reunión Ordinaria",
  "Reunión de Consejo",
  "Proyecto de Comunidad",
  "Otro",
];

const areasDeCrecimiento = [
  "corporalidad",
  "creatividad",
  "caracter",
  "afectividad",
  "sociabilidad",
  "espiritualidad",
];

export const Agendar = ({
  initialData = [],
  simple = false,
  miembros = [],
  readOnly = false,
  onUpdate = () => {},
}) => {
  const safeMiembros = Array.isArray(miembros) ? miembros : [];
  const firstMiembro =
    (typeof safeMiembros[0] === "string"
      ? safeMiembros[0]
      : safeMiembros[0]?.nombre) || "";

  const firstDe = (arr) =>
    Array.isArray(arr) && arr.length > 0 ? arr[0] : categoriasSimples[0];

  const createNewActivity = (desc = "") => {
    const defaultSubtipo = simple
      ? firstDe(categoriasSimples)
      : firstDe(categoriasCompletas?.Interna);

    const newActivity = {
      id: Date.now() + Math.random(),
      descripcion: desc,
      fechaInicio: "",
      fechaFin: "",
      estado: "En Progreso",
      areaDeCrecimientoAsociada: "corporalidad",
      encargado: firstMiembro,
      subtipo: defaultSubtipo,
    };
    if (!simple) {
      newActivity.tipo = "Interna";
    }
    return newActivity;
  };

  const [activities, setActivities] = useState([]); // CORRECCIÓN: Iniciar como un array vacío
  const [generatingId, setGeneratingId] = useState(null);

  // Cargar datos iniciales del padre (CicloForm)
  useEffect(() => {
    // Si hay datos iniciales, los usamos
    if (Array.isArray(initialData) && initialData.length > 0) {
      setActivities(
        initialData.map((item, index) => ({
          ...createNewActivity(),
          ...item,
          id: item.id || Date.now() + index, // Asegura un ID único para React
        }))
      );
    } else {
      // Si no hay datos, creamos la primera fila por defecto
      setActivities([createNewActivity()]);
    }
  }, [initialData]);

  const updateActivities = (newActivities) => {
    // const cleanActivities = newActivities.map(({ id, ...rest }) => rest);
    setActivities(newActivities);
    onUpdate(newActivities);
  };

  const handleInputChange = (id, event) => {
    const { name, value } = event.target;
    const newActivities = activities.map((activity) => {
      if (activity.id !== id) return activity;
      const updated = { ...activity, [name]: value };

      // Si no es el modo simple y se cambia el TIPO, actualizamos la CATEGORÍA
      if (!simple && name === "tipo") {
        const listado =
          categoriasCompletas?.[value] || categoriasCompletas?.Interna;
        updated.subtipo = firstDe(listado);
      }
      return updated;
    });
    updateActivities(newActivities);
  };

  const handleAddActivity = () => {
    const newActivities = [...activities, createNewActivity()];
    updateActivities(newActivities);
  };

  const handleRemoveActivity = (id) => {
    if (activities.length <= 1) return; // No permitir borrar la última fila
    const newActivities = activities.filter((a) => a.id !== id);
    updateActivities(newActivities);
  };

  const addToGoogleCalendar = (activity) => {
    if (!activity.descripcion || !activity.fechaInicio) return;
    const formatDate = (date) => date.replace(/-/g, "");
    const startDate = formatDate(activity.fechaInicio);
    const endDate = (() => {
      if (!activity.fechaFin) return startDate;
      const nextDay = new Date(activity.fechaFin);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split("T")[0].replace(/-/g, "");
    })();

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `PPA: ${activity.descripcion}`,
      dates: `${startDate}/${endDate}`,
      details: `Actividad del Plan de Acción Scout.\nCategoría: ${activity.subtipo}`,
      sf: true,
      output: "xml",
    });
    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank"
    );
  };

  const handleGenerateSubtasks = async (activityId, description) => {
    const cleanObjective = (description || "").trim();
    if (generatingId) return;
    if (!cleanObjective) {
      Swal.fire(
        "Atención",
        "Escribe una descripción antes de pedir sugerencias.",
        "info"
      );
      return;
    }

    setGeneratingId(activityId);
    try {
      const callable = httpsCallable(functions, "suggestSubtasks", {
        timeout: 30000,
      });
      const result = await callable({ objective: cleanObjective });
      const subtasks = result?.data?.subtasks;

      if (!Array.isArray(subtasks)) {
        throw new Error("La respuesta de la IA no tuvo un formato válido.");
      }

      const newSubtasks = subtasks.map((subtaskDesc) =>
        createNewActivity(subtaskDesc)
      );
      const originalIndex = activities.findIndex(
        (act) => act.id === activityId
      );
      if (originalIndex !== -1) {
        const newActivities = [...activities];
        newActivities.splice(originalIndex + 1, 0, ...newSubtasks);
        // CORRECCIÓN: Usar la función central para notificar al padre
        updateActivities(newActivities);
      }
    } catch (error) {
      console.error("Error al generar subtareas:", error);
      Swal.fire(
        "Error",
        `Hubo un problema al contactar a la IA. Inténtalo de nuevo. (${
          error?.code || "desconocido"
        })`,
        "error"
      );
    } finally {
      setGeneratingId(null);
    }
  };

  // Render
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-2">
        <div className="lg:col-span-4">
          <label className="text-sm font-medium text-gray-600">
            Descripción
          </label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Fechas</label>
        </div>
        {!simple && (
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-gray-600">Tipo</label>
          </div>
        )}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Categoría</label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Encargado</label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">
            Área Asociada
          </label>
        </div>
      </div>

      {activities.map((activity) => (
        <div
          key={activity.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-gray-50 shadow-sm"
        >
          <div className="lg:col-span-4">
            <input
              type="text"
              name="descripcion"
              value={activity.descripcion}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              placeholder="Ej: Campaña de reforestación"
              disabled={readOnly}
            />
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="date"
              name="fechaInicio"
              value={activity.fechaInicio}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              disabled={readOnly}
            />
            <input
              type="date"
              name="fechaFin"
              value={activity.fechaFin}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              disabled={readOnly}
            />
          </div>

          {!simple && (
            <div className="lg:col-span-2">
              <select
                name="tipo"
                value={activity.tipo}
                onChange={(e) => handleInputChange(activity.id, e)}
                className="border-input"
                disabled={readOnly}
              >
                <option value="Interna">Interna</option>
                <option value="Externa">Externa</option>
              </select>
            </div>
          )}

          <div className="lg:col-span-2">
            <select
              name="subtipo"
              value={activity.subtipo}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              disabled={readOnly}
            >
              {(simple
                ? categoriasSimples
                : categoriasCompletas[activity.tipo] ||
                  categoriasCompletas.Interna
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <input
              type="text"
              name="encargado"
              value={activity.encargado}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              placeholder="Nombre del encargado"
              disabled={readOnly}
            />
          </div>

          <div className="lg:col-span-2">
            <select
              name="areaDeCrecimientoAsociada"
              value={activity.areaDeCrecimientoAsociada}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input capitalize"
              disabled={readOnly}
            >
              {areasDeCrecimiento.map((area) => (
                <option key={area} value={area} className="capitalize">
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 lg:pt-0 lg:col-span-12 border-t lg:border-t-0 mt-4 lg:mt-0">
            <button
              type="button"
              onClick={() =>
                handleGenerateSubtasks(activity.id, activity.descripcion)
              }
              className="p-2 text-purple-600 hover:text-purple-800 focus:outline-none bg-purple-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sugerir subtareas con IA"
              disabled={!!generatingId || readOnly}
            >
              {generatingId === activity.id ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <WandSparkles size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={() => addToGoogleCalendar(activity)}
              className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none bg-blue-100 rounded-full"
              title="Añadir a Google Calendar"
              disabled={readOnly}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
            </button>
            <button
              type="button"
              onClick={() => handleRemoveActivity(activity.id)}
              className="p-2 text-red-600 hover:text-red-800 focus:outline-none bg-red-100 rounded-full"
              title="Eliminar Actividad"
              disabled={readOnly}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleAddActivity}
            className="btn-primary"
            aria-label="Agregar otra actividad"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Agregar Actividad
          </button>
        </div>
      )}
    </div>
  );
};
