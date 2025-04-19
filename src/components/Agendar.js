import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export const Agendar = forwardRef(({ initialData = [] }, ref) => {
  const [activities, setActivities] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      if (initialData && initialData.length > 0) {
        setActivities(initialData.map((item, index) => ({
          id: Date.now() + index,
          actividad: item.actividad || "",
          fecha: item.fecha || "",
          addedToCalendar: false
        })));
      } else {
        setActivities([{ id: Date.now(), actividad: "", fecha: "", addedToCalendar: false }]);
      }
      setInitialLoad(false);
    }
  }, [initialData, initialLoad]);

  useImperativeHandle(ref, () => ({
    getValues: () =>
      activities
        .filter(a => a.actividad.trim() || a.fecha.trim())
        .map(a => ({ actividad: a.actividad, fecha: a.fecha })),
    setValues: (newData) => {
      setActivities(
        Array.isArray(newData) ? newData.map((item, i) => ({
          id: Date.now() + i,
          actividad: item.actividad || "",
          fecha: item.fecha || "",
          addedToCalendar: false
        })) : []
      );
    }
  }));

  const handleInputChange = (id, event) => {
    const { name, value } = event.target;
    setActivities(prev => prev.map(activity =>
      activity.id === id ? { ...activity, [name]: value, addedToCalendar: false } : activity
    ));
  };

  const handleAddActivity = () => {
    setActivities([...activities, {
      id: Date.now(),
      actividad: "",
      fecha: "",
      addedToCalendar: false
    }]);
  };

  const handleRemoveActivity = (id) => {
    if (activities.length > 1) {
      setActivities(prev => prev.filter(activity => activity.id !== id));
    }
  };

  const addToGoogleCalendar = (actividad, fecha) => {
    if (!actividad || !fecha) return;

    const startDate = new Date(fecha);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const format = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `PPA: ${actividad}`,
      dates: `${format(startDate)}/${format(endDate)}`,
      details: "Actividad creada desde la app PPA de Scouts",
      sf: true,
      output: "xml"
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');

    setActivities(prev =>
      prev.map(a =>
        a.actividad === actividad && a.fecha === fecha
          ? { ...a, addedToCalendar: true }
          : a
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-center mb-2">
        <div className="col-span-7">
          <label className="text-sm font-medium text-gray-700">Actividad</label>
        </div>
        <div className="col-span-3">
          <label className="text-sm font-medium text-gray-700">Fecha</label>
        </div>
        <div className="col-span-2 flex justify-center">
          <span className="text-xs text-gray-500">Acciones</span>
        </div>
      </div>

      {activities.map((activity) => (
        <div key={activity.id} className="grid grid-cols-12 gap-4 items-center mb-3">
          <div className="col-span-7">
            <input
              type="text"
              name="actividad"
              value={activity.actividad}
              onChange={(event) => handleInputChange(activity.id, event)}
              className="w-full p-2.5 text-sm text-gray-800 bg-gray-100 rounded-lg border border-gray-300 focus:ring-scout focus:border-scout"
              placeholder="Descripción de la actividad"
              aria-label="Descripción de la actividad"
            />
          </div>
          <div className="col-span-3">
            <input
              type="date"
              name="fecha"
              value={activity.fecha}
              onChange={(event) => handleInputChange(activity.id, event)}
              className="w-full p-2.5 text-sm text-gray-800 bg-gray-100 rounded-lg border border-gray-300 focus:ring-scout focus:border-scout"
              aria-label="Fecha de la actividad"
            />
          </div>
          <div className="col-span-2 flex justify-center space-x-2">
            {activity.actividad && activity.fecha && (
              <button
                type="button"
                onClick={() => addToGoogleCalendar(activity.actividad, activity.fecha)}
                className={`p-2 rounded-full focus:outline-none ${
                  activity.addedToCalendar
                    ? "text-green-500 hover:text-green-700 bg-green-50"
                    : "text-blue-500 hover:text-blue-700 bg-blue-50"
                }`}
                title="Añadir a Google Calendar"
                aria-label="Añadir a calendario"
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
              </button>
            )}
            {activities.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveActivity(activity.id)}
                className="p-2 text-red-500 hover:text-red-700 focus:outline-none bg-red-50 rounded-full"
                aria-label="Eliminar actividad"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddActivity}
        className="btn-scout-red text-white flex items-center text-sm focus:outline-none px-3 py-2 rounded mt-2"
        aria-label="Agregar otra actividad"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-1" />
        Agregar otra actividad
      </button>
    </div>
  );
});
