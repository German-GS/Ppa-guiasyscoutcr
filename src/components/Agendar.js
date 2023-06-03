import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

export function Agendar({ onSave }) {
  const [inputs, setInputs] = useState([{ id: 1, texto: "", fecha: "" }]);
  const [guardado, setGuardado] = useState(false);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedInputs = [...inputs];
    updatedInputs[index][name] = value;
    setInputs(updatedInputs);
  };

  const handleAddInput = () => {
    const newId = inputs.length + 1;
    setInputs([...inputs, { id: newId, texto: "", fecha: "" }]);
  };

  const handleRemoveInput = (index) => {
    const updatedInputs = [...inputs];
    updatedInputs.splice(index, 1);
    setInputs(updatedInputs);
  };

  const handleSave = () => {
    onSave(inputs);
    setInputs([{ id: 1, texto: "", fecha: "" }]);
    setGuardado(true);
  };

  return (
    <div>
      <div className="flex mb-4">
        <label className="text-xl block mb-2 text-sm font-medium text-gray-400">
          Actividad
        </label>
        <label className="text-xl block mb-2 text-sm font-medium text-gray-400">
          Fecha
        </label>
        <div className="w-12" /> {/* Espacio para los botones */}
      </div>
      {inputs.map((input, index) => (
        <div key={input.id} className="flex mb-4">
          <div className="flex-grow mr-4">
            <input
              type="text"
              name="texto"
              value={input.texto}
              onChange={(event) => handleInputChange(index, event)}
              className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 mb-4"
              placeholder="Ingrese actividad"
            />
          </div>
          <div className="flex-grow-0 w-48">
            <input
              type="date"
              name="fecha"
              value={input.fecha}
              onChange={(event) => handleInputChange(index, event)}
              className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 mb-4"
              placeholder="Seleccione la fecha"
            />
          </div>
          {index === inputs.length - 1 && (
            <button
              type="button"
              onClick={handleAddInput}
              className="bg-scout text-white rounded-md px-3 py-2.5 hover:bg-scout-100 focus:outline-none"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
          {inputs.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveInput(index)}
              className="bg-rover1 text-white rounded-md mx-1 px-4 py-2 hover:bg-rover-100 focus:outline-none focus:ring-2 focus:ring-rover-100"
            >
              X
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleSave}
        className={`bg-rover1 text-white rounded-md px-3 py-2.5 hover:bg-rover-100 focus:outline-none mx-1${
          guardado ? " bg-rover1" : ""
        }`}
      >
        {guardado ? <FontAwesomeIcon icon={faCheck} /> : "Guardar"}
      </button>
    </div>
  );
}