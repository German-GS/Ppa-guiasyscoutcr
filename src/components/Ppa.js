import React, { useState, useEffect } from "react";
import { onPpaUpdate } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPrint, faTimes } from "@fortawesome/free-solid-svg-icons";

export function Ppa({ selectedPpa, closeModal, onEdit }) {
  const [currentPpa, setCurrentPpa] = useState(() => normalizePpaData(selectedPpa));
  const [loading, setLoading] = useState(false);

  // Función para normalizar los datos del PPA
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

  // Función para asegurar que siempre trabajamos con arrays válidos
  function ensureArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item != null && item !== '');
    return [String(data)].filter(item => item !== '');
  }

  // Efecto para escuchar cambios en tiempo real
  useEffect(() => {
    console.log('Datos iniciales recibidos:', selectedPpa);
    setCurrentPpa(normalizePpaData(selectedPpa));

    const unsubscribe = onPpaUpdate(selectedPpa.id, (updatedPpa) => {
      console.log("Datos actualizados:", updatedPpa);
      setCurrentPpa(normalizePpaData(updatedPpa));
    });

    return () => unsubscribe();
  }, [selectedPpa.id]);

  // Función para formatear fechas
  const formatDateTime = (date) => {
    if (!date) return "No especificada";
    if (date instanceof Date) return date.toLocaleDateString();
    if (date?.toDate instanceof Function) return date.toDate().toLocaleDateString();
    return date;
  };

  // Función mejorada para renderizar items
  const renderItems = (items, fieldName) => {
    if (!items || items.length === 0 || (items.length === 1 && items[0] === "")) {
      return <p className="text-gray-500">No hay {fieldName} registrados</p>;
    }

    return (
      <ul className="space-y-1">
        {items.filter(item => item !== "").map((item, i) => (
          <li key={i} className="flex items-start">
            <span className="text-sm font-semibold mr-2">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-scout"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Encabezado */}
      <div className="bg-scout text-white p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Detalles del PPA</h2>
          <button 
            onClick={closeModal}
            className="text-white hover:text-gray-200"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
      </div>

      {/* Contenido principal con datos actualizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Columna 1 */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Sueños</h3>
            {renderItems(currentPpa.suenos, "sueños")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Retos</h3>
            {renderItems(currentPpa.retos, "retos")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Fortalezas</h3>
            {renderItems(currentPpa.fortalezas, "fortalezas")}
          </div>
        </div>
        
        {/* Columna 2 */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Carácter</h3>
            {renderItems(currentPpa.caracter, "carácter")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Afectividad</h3>
            {renderItems(currentPpa.afectividad, "afectividad")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Creatividad</h3>
            {renderItems(currentPpa.creatividad, "creatividad")}
          </div>
        </div>
        
        {/* Columna 3 */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Sociabilidad</h3>
            {renderItems(currentPpa.sociabilidad, "sociabilidad")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Corporabilidad</h3>
            {renderItems(currentPpa.corporabilidad, "corporabilidad")}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Espiritualidad</h3>
            {renderItems(currentPpa.espiritualidad, "espiritualidad")}
          </div>
        </div>
      </div>
      
      {/* Sección de Actividades */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Plan de Acción</h3>
        {currentPpa.actividad?.length > 0 ? (
          <div className="space-y-3">
            {currentPpa.actividad.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
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
          <p className="text-gray-500">No hay actividades registradas</p>
        )}
      </div>
      
      {/* Pie de página con botones */}
      <div className="flex justify-between p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faPrint} className="mr-2" />
          Imprimir
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(currentPpa)}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Modificar
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}