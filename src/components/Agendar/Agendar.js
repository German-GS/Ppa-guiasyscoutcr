// src/components/Agendar/Agendar.js
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { getAuth } from "firebase/auth";

// Depuración desactivada para producción
const DEBUG = false;
const dbg = (...args) =>
  DEBUG &&
  console.log("%c[Agendar]", "color:#7c3aed;font-weight:bold", ...args);

const categorias = {
  Interna: [
    "Actividad de Servicio",
    "Campamento/Caminata/Excursión",
    "Programa Especial (Guía)",
    "Proyecto Interno",
    "Otro",
  ],
  Externa: [
    "Proyecto de Universidad/Estudio",
    "Trabajo",
    "Servicio Comunitario (ONGs, etc.)",
    "Proyecto Personal",
    "Otro",
  ],
};

const areasDeCrecimiento = [
  "corporalidad",
  "creatividad",
  "caracter",
  "afectividad",
  "sociabilidad",
  "espiritualidad",
];

export const Agendar = forwardRef(({ initialData = [] }, ref) => {
  const createNewActivity = (desc = "") => ({
    id: Date.now() + Math.random(),
    descripcion: desc,
    fechaInicio: "",
    fechaFin: "",
    tipo: "Interna",
    subtipo: categorias.Interna[0],
    estado: "En Progreso",
    areaDeCrecimientoAsociada: "corporalidad",
  });

  const [activities, setActivities] = useState([createNewActivity()]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    if (initialLoad && initialData && initialData.length > 0) {
      setActivities(
        initialData.map((item, index) => ({
          ...createNewActivity(),
          ...item,
          id: Date.now() + index,
        }))
      );
      setInitialLoad(false);
    }
  }, [initialData, initialLoad]);

  useImperativeHandle(ref, () => ({
    getValues: () =>
      activities.filter((a) => a.descripcion.trim() || a.fechaInicio.trim()),
    setValues: (newData) => {
      if (Array.isArray(newData) && newData.length > 0) {
        setActivities(
          newData.map((item, i) => ({
            ...createNewActivity(),
            ...item,
            id: Date.now() + i,
          }))
        );
      } else {
        setActivities([createNewActivity()]);
      }
    },
  }));

  const handleInputChange = (id, event) => {
    const { name, value } = event.target;
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === id) {
          const updatedActivity = { ...activity, [name]: value };
          if (name === "tipo") {
            updatedActivity.subtipo = categorias[value][0];
          }
          return updatedActivity;
        }
        return activity;
      })
    );
  };

  const handleAddActivity = () => {
    setActivities([...activities, createNewActivity()]);
  };

  const handleRemoveActivity = (id) => {
    if (activities.length > 1) {
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    }
  };

  const addToGoogleCalendar = (activity) => {
    if (!activity.descripcion || !activity.fechaInicio) return;
    const formatDate = (date) => date.replace(/-/g, "");
    const startDate = formatDate(activity.fechaInicio);
    let endDate;
    if (activity.fechaFin) {
      const nextDay = new Date(activity.fechaFin);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = nextDay.toISOString().split("T")[0].replace(/-/g, "");
    } else {
      endDate = startDate;
    }
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `PPA: ${activity.descripcion}`,
      dates: `${startDate}/${endDate}`,
      details: `Actividad del Plan de Acción Scout.\nTipo: ${activity.tipo}\nCategoría: ${activity.subtipo}`,
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
        setActivities(newActivities);
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

  return (
    <div className="space-y-6">
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-2">
        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-600">
            Descripción
          </label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Fechas</label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Tipo</label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Categoría</label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">
            Área Asociada
          </label>
        </div>
        <div className="lg:col-span-1"></div>
      </div>

      {activities.map((activity) => (
        <div
          key={activity.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-gray-50 shadow-sm"
        >
          <div className="lg:col-span-3">
            <input
              type="text"
              name="descripcion"
              value={activity.descripcion}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              placeholder="Ej: Campaña de reforestación"
            />
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="date"
              name="fechaInicio"
              value={activity.fechaInicio}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
            />
            <input
              type="date"
              name="fechaFin"
              value={activity.fechaFin}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
            />
          </div>
          <div className="lg:col-span-2">
            <select
              name="tipo"
              value={activity.tipo}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
            >
              <option value="Interna">Interna</option>
              <option value="Externa">Externa</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              name="subtipo"
              value={activity.subtipo}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
            >
              {categorias[activity.tipo].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              name="areaDeCrecimientoAsociada"
              value={activity.areaDeCrecimientoAsociada}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input capitalize"
            >
              {areasDeCrecimiento.map((area) => (
                <option key={area} value={area} className="capitalize">
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1 flex items-center justify-end space-x-2 pt-4 lg:pt-0">
            <button
              type="button"
              onClick={() =>
                handleGenerateSubtasks(activity.id, activity.descripcion)
              }
              className="p-2 text-purple-600 hover:text-purple-800 focus:outline-none bg-purple-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sugerir subtareas con IA"
              disabled={!!generatingId}
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
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
            </button>
            <button
              type="button"
              onClick={() => handleRemoveActivity(activity.id)}
              className="p-2 text-red-600 hover:text-red-800 focus:outline-none bg-red-100 rounded-full"
              title="Eliminar Actividad"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}

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
    </div>
  );
});
