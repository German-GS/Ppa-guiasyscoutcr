import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export function InputForm({ 
  initialValues = [], 
  onSave, 
  placeholder = "Ingrese un valor",
  addButtonClass = "text-scout hover:text-scoutDark"
}) {
  // Función para normalizar valores iniciales
  const normalizeInitialValues = (values) => {
    if (!Array.isArray(values)) return [{ id: Date.now(), value: "" }];
    if (values.length === 0) return [{ id: Date.now(), value: "" }];
    return values.map((item, index) => ({
      id: index,
      value: String(item || "")
    }));
  };

  // Estado para los inputs
  const [inputs, setInputs] = useState(() => normalizeInitialValues(initialValues));

  // Efecto para actualizar cuando cambian los initialValues
  useEffect(() => {
    setInputs(normalizeInitialValues(initialValues));
  }, [initialValues]);

  // Manejar cambio en input
  const handleInputChange = (id, value) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, value } : input
    ));
  };

  // Agregar nuevo input
  const handleAddInput = () => {
    setInputs(prev => [...prev, { id: Date.now(), value: "" }]);
  };

  // Eliminar input
  const handleRemoveInput = (id) => {
    if (inputs.length > 1) {
      setInputs(prev => prev.filter(input => input.id !== id));
    }
  };

  // Guardar datos (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const valuesToSave = inputs
        .map(input => input.value.trim())
        .filter(value => value !== "");
      onSave(valuesToSave);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputs, onSave]);

  return (
    <div className="space-y-3">
      {inputs.map((input) => (
        <div key={input.id} className="flex items-center gap-2">
          <input
            type="text"
            value={input.value}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            className="flex-1 text-gray-800 text-sm rounded-lg bg-gray-100 border border-gray-300 focus:ring-scout focus:border-scout block w-full p-2.5"
            placeholder={placeholder}
            aria-label={placeholder}
          />
          
          {inputs.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveInput(input.id)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              aria-label="Eliminar campo"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddInput}
        className={`mt-2 flex items-center text-sm focus:outline-none px-3 py-1 rounded ${addButtonClass}`}
        aria-label="Agregar otro campo"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-1" />
        Agregar otro
      </button>
    </div>
  );
}