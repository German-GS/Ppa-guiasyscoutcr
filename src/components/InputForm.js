import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export const InputForm = forwardRef(({ 
  initialValues = [], 
  placeholder = "Ingrese un valor",
  addButtonClass = "btn-scout-red text-white"
}, ref) => {
  const normalizeInitialValues = (values) => {
    if (!Array.isArray(values) || values.length === 0) {
      return [{ id: Date.now(), value: "" }];
    }
    return values.map((item, index) => ({
      id: index,
      value: String(item || "")
    }));
  };

  const [inputs, setInputs] = useState(() => normalizeInitialValues(initialValues));
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      setInputs(normalizeInitialValues(initialValues));
      setInitialLoad(false);
    }
  }, [initialValues, initialLoad]);

  useImperativeHandle(ref, () => ({
    getValues: () =>
      inputs
        .map(input => input.value.trim())
        .filter(value => value !== ""),
    setInputs: (newValues) => {
      setInputs(Array.isArray(newValues) ? normalizeInitialValues(newValues.map(v => v.value || v)) : [{ id: Date.now(), value: "" }]);
    }
  }));

  const handleInputChange = (id, value) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, value } : input
    ));
  };

  const handleAddInput = () => {
    setInputs(prev => [...prev, { id: Date.now(), value: "" }]);
  };

  const handleRemoveInput = (id) => {
    if (inputs.length > 1) {
      setInputs(prev => prev.filter(input => input.id !== id));
    }
  };

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
        className={`mt-2 flex items-center text-sm focus:outline-none px-3 py-2 rounded ${addButtonClass}`}
        aria-label="Agregar otro campo"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-1" />
        Agregar otro
      </button>
    </div>
  );
});
