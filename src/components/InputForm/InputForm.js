import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./InputForm.module.css"; // <-- 1. IMPORTA EL MÓDULO

export const InputForm = forwardRef(
  (
    {
      initialValues = [],
      placeholder = "Ingrese un valor",
      // Ya no usaremos esta prop, el estilo viene del módulo
    },
    ref
  ) => {
    // ... (toda la lógica del componente se mantiene igual) ...

    const normalizeInitialValues = (values) => {
      if (!Array.isArray(values) || values.length === 0) {
        return [{ id: Date.now(), value: "" }];
      }
      return values.map((item, index) => ({
        id: index,
        value: String(item || ""),
      }));
    };

    const [inputs, setInputs] = useState(() =>
      normalizeInitialValues(initialValues)
    );
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
          .map((input) => input.value.trim())
          .filter((value) => value !== ""),
      setInputs: (newValues) => {
        setInputs(
          Array.isArray(newValues)
            ? normalizeInitialValues(newValues.map((v) => v.value || v))
            : [{ id: Date.now(), value: "" }]
        );
      },
    }));

    const handleInputChange = (id, value) => {
      setInputs((prev) =>
        prev.map((input) => (input.id === id ? { ...input, value } : input))
      );
    };

    const handleAddInput = () => {
      setInputs((prev) => [...prev, { id: Date.now(), value: "" }]);
    };

    const handleRemoveInput = (id) => {
      if (inputs.length > 1) {
        setInputs((prev) => prev.filter((input) => input.id !== id));
      }
    };

    return (
      // El 'return' se mantiene casi igual, solo cambia el botón
      <div className="space-y-4">
        {inputs.map((input) => (
          <div key={input.id} className="flex items-center gap-2">
            <input
              type="text"
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="border-input" // Usa la clase global que ya funciona para los inputs
              placeholder={placeholder}
              aria-label={placeholder}
            />
            {inputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(input.id)}
                className="flex-shrink-0 p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
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
          className="btn-primary"
          aria-label="Agregar otro campo"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Agregar otro
        </button>
      </div>
    );
  }
);
