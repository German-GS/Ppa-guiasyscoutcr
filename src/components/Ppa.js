import React, { useState, useEffect } from "react";
import { onPpaUpdate } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPrint, faTimes } from "@fortawesome/free-solid-svg-icons";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";

export function Ppa({ selectedPpa, closeModal, onEdit, mostrarBotonEditar = true }) {
  const [currentPpa, setCurrentPpa] = useState(null);

  function normalizePpaData(ppa) {
    if (!ppa) return {};
    return {
      ...ppa,
      suenos: ensureArray(ppa.suenos),
      retos: ensureArray(ppa.retos),
      fortalezas: ensureArray(ppa.fortalezas),
      corporabilidad: ensureArray(ppa.corporabilidad),
      creatividad: ensureArray(ppa.creatividad),
      afectividad: ensureArray(ppa.afectividad),
      espiritualidad: ensureArray(ppa.espiritualidad),
      caracter: ensureArray(ppa.caracter),
      sociabilidad: ensureArray(ppa.sociabilidad),
      actividad: Array.isArray(ppa.actividad) ? ppa.actividad : []
    };
  }

  function ensureArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item !== "");
    return [String(data)].filter(item => item !== "");
  }

  const formatDateTime = (date) => {
    if (!date) return "No especificada";
    if (date instanceof Date) return date.toLocaleString();
    if (date?.toDate instanceof Function) return date.toDate().toLocaleString();
    return date;
  };

  const renderItems = (items, label) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-bold mb-2 text-morado-principal">{label}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 italic">No hay {label.toLowerCase()} registrados</p>
      ) : (
        <ul className="space-y-1 text-gray-800 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="font-semibold mr-2">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  useEffect(() => {
    if (!selectedPpa) return;

    const initial = normalizePpaData(selectedPpa);
    setCurrentPpa(initial);

    const unsubscribe = onPpaUpdate(selectedPpa.id, updatedPpa => {
      setCurrentPpa(normalizePpaData(updatedPpa));
    });

    return () => unsubscribe();
  }, [selectedPpa]);

  if (!currentPpa) return null;

  const areaKeys = [
    "caracter",
    "afectividad",
    "creatividad",
    "sociabilidad",
    "corporabilidad",
    "espiritualidad"
  ];

  const getEnfasisDelCiclo = (ppa) => {
    const conteos = areaKeys.map((key) => ({
      area: key,
      count: Array.isArray(ppa[key]) ? ppa[key].length : 0
    }));

    const max = Math.max(...conteos.map(c => c.count));
    const secundarios = conteos.filter(c => c.count < max && c.count > 1);
    const principal = conteos.find(c => c.count === max);

    return {
      enfasisPrincipal: principal?.area || "N/A",
      enfasisSecundarios: secundarios.map(c => c.area)
    };
  };

  const { enfasisPrincipal, enfasisSecundarios } = getEnfasisDelCiclo(currentPpa);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="bg-scout text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Detalles del PPA</h2>
          <img src={comunidadIcon} alt="Comunidad" className="w-10 h-10" />
        </div>
        <button onClick={closeModal} className="text-white hover:text-gray-200 transition" aria-label="Cerrar modal">
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      </div>

      <div className="text-sm text-gray-700 px-6 pt-4">
        <p>Creado: {formatDateTime(currentPpa.createdAt)}</p>
        <p>Modificado: {formatDateTime(currentPpa.modifiedAt)}</p>
        <p className="mt-2">
          <span className="font-semibold text-scout">Énfasis del ciclo:</span>{" "}
          {enfasisPrincipal.charAt(0).toUpperCase() + enfasisPrincipal.slice(1)}
        </p>
        {enfasisSecundarios.length > 0 && (
          <p>
            <span className="font-medium text-morado-principal">Énfasis secundarios:</span>{" "}
            {enfasisSecundarios
              .map(e => e.charAt(0).toUpperCase() + e.slice(1))
              .join(", ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {renderItems(currentPpa.suenos, "Sueños")}
        {renderItems(currentPpa.retos, "Retos")}
        {renderItems(currentPpa.fortalezas, "Fortalezas")}
      </div>

      <hr className="border-t border-gray-200 my-4 mx-6" />
      <h3 className="text-xl font-bold text-scout px-6 mb-4">Áreas de Crecimiento</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6">
        {renderItems(currentPpa.caracter, "Carácter")}
        {renderItems(currentPpa.afectividad, "Afectividad")}
        {renderItems(currentPpa.creatividad, "Creatividad")}
        {renderItems(currentPpa.sociabilidad, "Sociabilidad")}
        {renderItems(currentPpa.corporabilidad, "Corporabilidad")}
        {renderItems(currentPpa.espiritualidad, "Espiritualidad")}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold text-scout mb-4">Plan de Acción</h3>
        {currentPpa.actividad.length > 0 ? (
          <div className="space-y-4">
            {currentPpa.actividad.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Actividad</h4>
                    <p>{item.actividad || "No especificada"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Fecha</h4>
                    <p>{formatDateTime(item.fecha)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay actividades registradas</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between p-6 border-t border-gray-200 bg-white sticky bottom-0 space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faPrint} className="mr-2" />
          Imprimir
        </button>
        <div className="flex flex-col sm:flex-row sm:space-x-2 w-full sm:w-auto">
          {mostrarBotonEditar && (
            <button
              onClick={() => onEdit(currentPpa)}
              className="w-full sm:w-auto mb-2 sm:mb-0 px-4 py-2 bg-morado-principal text-white hover:bg-[#220f4c] rounded-xl transition-all flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Modificar
            </button>
          )}

          <button
            onClick={closeModal}
            className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
