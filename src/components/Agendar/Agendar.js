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
} from "@fortawesome/free-solid-svg-icons";

// NUEVO: Definimos las categorías para los menús desplegables.
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

export const Agendar = forwardRef(({ initialData = [] }, ref) => {
  // NUEVO: La estructura del estado ahora es mucho más rica.
  const createNewActivity = () => ({
    id: Date.now(),
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    tipo: "Interna", // Valor por defecto
    subtipo: categorias.Interna[0], // Valor por defecto
    estado: "En Progreso", // 'En Progreso', 'Logrado', 'No Logrado'
  });

  const [activities, setActivities] = useState([createNewActivity()]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Lógica para cargar datos existentes (ej. al editar un PPA)
  useEffect(() => {
    if (initialLoad && initialData && initialData.length > 0) {
      setActivities(
        initialData.map((item, index) => ({
          id: Date.now() + index,
          descripcion: item.descripcion || "",
          fechaInicio: item.fechaInicio || "",
          fechaFin: item.fechaFin || "",
          tipo: item.tipo || "Interna",
          subtipo: item.subtipo || categorias.Interna[0],
          estado: item.estado || "En Progreso",
        }))
      );
      setInitialLoad(false);
    }
  }, [initialData, initialLoad]);

  // NUEVO: `useImperativeHandle` ahora trabaja con la nueva estructura de datos.
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
          // Si el tipo cambia, reseteamos el subtipo al primer valor de la nueva categoría
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
    setActivities([...activities, { ...createNewActivity(), id: Date.now() }]);
  };

  const handleRemoveActivity = (id) => {
    if (activities.length > 1) {
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    }
  };

  // NUEVO: La función del calendario ahora usa fecha de inicio y fin.
  const addToGoogleCalendar = (activity) => {
    if (!activity.descripcion || !activity.fechaInicio) return;

    // Google Calendar necesita fechas en formato YYYYMMDDTHHMMSSZ / YYYYMMDD
    // Usaremos el formato de día completo.
    const formatDate = (date) => date.replace(/-/g, "");
    const startDate = formatDate(activity.fechaInicio);
    // Para un evento de día completo, la fecha de fin es el día siguiente.
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

  return (
    <div className="space-y-6">
      {/* NUEVO: Encabezados para la nueva tabla de actividades */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-2">
        <div className="lg:col-span-4">
          <label className="text-sm font-medium text-gray-600">
            Descripción de la Actividad
          </label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">
            Fechas (Inicio/Fin)
          </label>
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-gray-600">Tipo</label>
        </div>
        <div className="lg:col-span-3">
          <label className="text-sm font-medium text-gray-600">Categoría</label>
        </div>
        <div className="lg:col-span-1"></div>
      </div>

      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-gray-50 shadow-sm"
        >
          {/* Descripción */}
          <div className="lg:col-span-4">
            <label className="text-sm font-semibold text-gray-700 lg:hidden mb-1 block">
              Descripción
            </label>
            <input
              type="text"
              name="descripcion"
              value={activity.descripcion}
              onChange={(e) => handleInputChange(activity.id, e)}
              className="border-input"
              placeholder="Ej: Campaña de reforestación"
            />
          </div>

          {/* Fechas */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 lg:hidden mb-1 block">
                Inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={activity.fechaInicio}
                onChange={(e) => handleInputChange(activity.id, e)}
                className="border-input"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 lg:hidden mb-1 block">
                Fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={activity.fechaFin}
                onChange={(e) => handleInputChange(activity.id, e)}
                className="border-input"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="lg:col-span-2">
            <label className="text-sm font-semibold text-gray-700 lg:hidden mb-1 block">
              Tipo
            </label>
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

          {/* Categoría (Subtipo) */}
          <div className="lg:col-span-3">
            <label className="text-sm font-semibold text-gray-700 lg:hidden mb-1 block">
              Categoría
            </label>
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

          {/* Acciones */}
          <div className="lg:col-span-1 flex items-center justify-end space-x-2 pt-4 lg:pt-0">
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
