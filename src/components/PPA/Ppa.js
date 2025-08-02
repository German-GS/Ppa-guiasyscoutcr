// src/components/PPA/Ppa.js

import React, { useState, useEffect } from "react";
import { onPpaUpdate } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPrint, faTimes } from "@fortawesome/free-solid-svg-icons";

export function Ppa({
  selectedPpa,
  closeModal,
  onEdit,
  mostrarBotonEditar = true,
}) {
  const [currentPpa, setCurrentPpa] = useState(null);

  function normalizePpaData(ppa) {
    if (!ppa) return null;
    return {
      ...ppa,
      suenos: ensureArray(ppa.suenos),
      retos: ensureArray(ppa.retos),
      fortalezas: ensureArray(ppa.fortalezas),
      corporalidad: ensureArray(ppa.corporalidad),
      creatividad: ensureArray(ppa.creatividad),
      afectividad: ensureArray(ppa.afectividad),
      espiritualidad: ensureArray(ppa.espiritualidad),
      caracter: ensureArray(ppa.caracter),
      sociabilidad: ensureArray(ppa.sociabilidad),
      actividad: Array.isArray(ppa.actividad) ? ppa.actividad : [],
    };
  }

  function ensureArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter((item) => item !== "");
    return [String(data)].filter((item) => item !== "");
  }

  const formatDateTime = (date) => {
    if (!date) return "No especificada";
    const jsDate =
      date.toDate instanceof Function ? date.toDate() : new Date(date);
    if (isNaN(jsDate)) return "Fecha inválida";
    // Usamos toLocaleDateString para un formato más limpio de solo fecha
    return jsDate.toLocaleDateString();
  };

  const areDatesDifferent = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = d1.toDate ? d1.toDate() : new Date(d1);
    const date2 = d2.toDate ? d2.toDate() : new Date(d2);
    return Math.abs(date1.getTime() - date2.getTime()) > 1000;
  };

  useEffect(() => {
    if (!selectedPpa) return;
    const initialData = normalizePpaData(selectedPpa);
    setCurrentPpa(initialData);
    const unsubscribe = onPpaUpdate(selectedPpa.id, (snapshot) => {
      if (snapshot.exists()) {
        const updatedData = { id: snapshot.id, ...snapshot.data() };
        setCurrentPpa(normalizePpaData(updatedData));
      }
    });
    return () => unsubscribe();
  }, [selectedPpa]);

  if (!currentPpa) {
    return null;
  }

  const estadoStyles = {
    "En Progreso": "bg-blue-100 text-blue-800",
    Logrado: "bg-green-100 text-green-800",
    cumplido: "bg-green-100 text-green-800",
    "No Logrado": "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    default: "bg-gray-100 text-gray-800",
  };

  const renderSimpleItems = (items, label) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold mb-2 text-morado-principal">{label}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 italic">No hay registros</p>
      ) : (
        <ul className="space-y-1 text-gray-800 text-sm list-disc list-inside">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const areaKeys = [
    { id: "corporalidad", title: "💪 Corporalidad" },
    { id: "creatividad", title: "🎨 Creatividad" },
    { id: "caracter", title: "🗿 Carácter" },
    { id: "afectividad", title: "❤️ Afectividad" },
    { id: "sociabilidad", title: "🤝 Sociabilidad" },
    { id: "espiritualidad", title: "🙏 Espiritualidad" },
  ];

  const getEnfasisDelCiclo = (ppa) => {
    const conteos = areaKeys.map((area) => ({
      id: area.id,
      count: ppa[area.id]?.length || 0,
    }));
    if (conteos.every((c) => c.count === 0)) {
      return { enfasisPrincipal: "General", enfasisSecundarios: [] };
    }
    const maxCount = Math.max(...conteos.map((c) => c.count));
    const principal = conteos.find((c) => c.count === maxCount);
    const secundarios = conteos.filter(
      (c) => c.count > 0 && c.count < maxCount
    );
    return {
      enfasisPrincipal: principal ? principal.id : "N/A",
      enfasisSecundarios: secundarios.map((c) => c.id),
    };
  };

  const growthObjectives = areaKeys
    .map((area) => ({ ...area, objectives: currentPpa[area.id] || [] }))
    .filter((area) => area.objectives.length > 0);

  const { enfasisPrincipal, enfasisSecundarios } =
    getEnfasisDelCiclo(currentPpa);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="bg-scout text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-2xl font-bold">Detalles del PPA</h2>
        <button onClick={closeModal} className="text-white hover:text-gray-200">
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      </div>

      <div className="text-sm text-gray-700 px-6 pt-4">
        <p>
          <strong>Creado:</strong> {formatDateTime(currentPpa.createdAt)}
        </p>
        {areDatesDifferent(currentPpa.createdAt, currentPpa.modifiedAt) && (
          <p>
            <strong>Modificado:</strong> {formatDateTime(currentPpa.modifiedAt)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {renderSimpleItems(currentPpa.suenos, "Sueños")}
        {renderSimpleItems(currentPpa.retos, "Retos")}
        {renderSimpleItems(currentPpa.fortalezas, "Fortalezas")}
      </div>

      <hr className="border-t border-gray-200 my-4 mx-6" />

      {/* ▼▼▼ SECCIÓN DE OBJETIVOS DE CRECIMIENTO CORREGIDA ▼▼▼ */}
      <div className="px-6 pb-6">
        <h3 className="text-xl font-bold text-scout mb-4">
          Objetivos de Crecimiento
        </h3>
        {growthObjectives.length > 0 ? (
          <div className="space-y-4">
            {growthObjectives.map((area) => (
              <div key={area.id} className="bg-gray-50 p-4 rounded-xl border">
                <h4 className="text-md font-bold text-morado-principal mb-2">
                  {area.title}
                </h4>
                <ul className="space-y-1 text-gray-800 text-sm list-disc list-inside">
                  {area.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No se definieron objetivos de crecimiento para este PPA.
          </p>
        )}
      </div>

      {/* ▼▼▼ SECCIÓN DE PLAN DE ACCIÓN CORREGIDA ▼▼▼ */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold text-scout mb-4">Plan de Acción</h3>
        {currentPpa.actividad.length > 0 ? (
          <div className="space-y-4">
            {currentPpa.actividad.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-bold text-gray-800 mb-2">
                    {item.descripcion || "Actividad sin descripción"}
                  </h4>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      estadoStyles[item.estado] || estadoStyles.default
                    }`}
                  >
                    {item.estado || "Sin estado"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-2">
                  <div>
                    <p className="font-semibold text-gray-600">Fechas</p>
                    <p className="text-gray-800">
                      {formatDateTime(item.fechaInicio)} -{" "}
                      {formatDateTime(item.fechaFin)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Tipo</p>
                    <p className="text-gray-800">
                      {item.tipo || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Categoría</p>
                    <p className="text-gray-800">
                      {item.subtipo || "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay actividades registradas</p>
        )}
      </div>

      {currentPpa.evaluacion && (
        <div className="p-6 border-t border-gray-200 bg-blue-50">
          <h3 className="text-xl font-bold text-scout mb-4">
            Resumen de la Evaluación
          </h3>
          <div className="space-y-6">
            {renderSimpleItems(
              currentPpa.evaluacion.logrosImportantes || [],
              "Logros más importantes"
            )}
            {renderSimpleItems(
              currentPpa.evaluacion.otrosLogros || [],
              "Otros logros no planeados"
            )}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-morado-principal">
                Actividades que quedaron pendientes
              </h3>
              {currentPpa.evaluacion.actividadesPendientes &&
              currentPpa.evaluacion.actividadesPendientes.length > 0 ? (
                <ul className="space-y-1 text-gray-800 text-sm list-disc list-inside">
                  {currentPpa.evaluacion.actividadesPendientes.map((act, i) => (
                    <li key={i}>{act.descripcion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  ¡Todas las actividades fueron cumplidas!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ▼▼▼ SECCIÓN DE BOTONES CORREGIDA ▼▼▼ */}
      <div className="flex justify-between items-center p-6 border-t bg-white sticky bottom-0">
        <button
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPrint} />
          Imprimir
        </button>
        <div className="flex items-center gap-2">
          {mostrarBotonEditar && currentPpa.estado !== "evaluado" && (
            <button
              onClick={() => onEdit(currentPpa)}
              className="btn-primary"
              style={{ width: "auto", padding: "0.5rem 1rem" }}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Modificar
            </button>
          )}
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
