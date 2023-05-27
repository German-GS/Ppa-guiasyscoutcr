import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

export function InputForm({ onSavePpa }) {
  const [inputs, setInputs] = useState([{ id: 1, value: "" }]);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (index, event) => {
    const value = event.target.value;
    const updatedInputs = [...inputs];
    updatedInputs[index].value = value;
    setInputs(updatedInputs);
  };

  const handleAddInput = () => {
    const newId = inputs.length + 1;
    setInputs([...inputs, { id: newId, value: "" }]);
  };

  const handleRemoveInput = (index) => {
    const updatedInputs = [...inputs];
    updatedInputs.splice(index, 1);
    setInputs(updatedInputs);
  };

  const handleSavePpa = async () => {
    try {
      const ppaData = inputs.map((input) => input.value);
      await onSavePpa(ppaData);
      console.log("Datos del PPA guardados exitosamente en la base de datos");
      setSaved(true); // Cambia el estado a true si los datos se guardan correctamente
    } catch (error) {
      console.error(
        "Error al guardar los datos del PPA en la base de datos",
        error
      );
      // Manejar el error de manera adecuada, o mostrarlo en la interfaz de usuario si es posible
    }
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <div key={input.id} className="flex mb-4">
          <input
            type="text"
            value={input.value}
            onChange={(event) => handleInputChange(index, event)}
            className="text-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 mb-4"
            placeholder={`${index + 1}`}
          />
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
        onClick={handleAddInput}
        className="bg-scout text-white rounded-md px-3 py-2.5 hover:bg-scout-100 focus:outline-none"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button
        type="button"
        onClick={handleSavePpa}
        className={`bg-rover1 text-white rounded-md px-3 py-2.5 hover:bg-rover-100 focus:outline-none mx-1${
          saved ? " bg-rover1" : ""
        }`}
      >
        {saved ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : (
          "Guardar"
        )}
      </button>
    </div>
  );
}





//className="rtext-white border-none text-sm rounded-lg bg-gris block w-full p-2.5 dark:bg-gris dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 mb-4"

/* 
export function Home() {
  const { loading } = useAuth();
  const [suenos, setSuenos] = useState([{ id: 1, value: "" }]);
  const [retos, setRetos] = useState([{ id: 1, value: "" }]);
  const [fortalezas, setFortalezas] = useState([{ id: 1, value: "" }]);
  const [corporabilidad, setCorporabilidad] = useState([{ id: 1, value: "" }]);
  const [creatividad, setCreatividad] = useState([{ id: 1, value: "" }]);
  const [afectividad, setAfectividad] = useState([{ id: 1, value: "" }]);
  const [espiritualidad, setEspiritualidad] = useState([{ id: 1, value: "" }]);
  const [caracter, setCaracter] = useState([{ id: 1, value: "" }]);
  const [sociabilidad, setSociabilidad] = useState([{ id: 1, value: "" }]);
  // Agrega los demás estados para los campos adicionales

  const handleInputChange = (field, newInputs) => {
    switch (field) {
      case "suenos":
        setSuenos(newInputs);
        break;
      case "retos":
        setRetos(newInputs);
        break;
      case "fortalezas":
        setFortalezas(newInputs);
        break;
      case "corporabilidad":
        setCorporabilidad(newInputs);
        break;
      case "creatividad":
        setCreatividad(newInputs);
        break;
      case "afectividad":
        setAfectividad(newInputs);
        break;
      case "espiritualidad":
        setEspiritualidad(newInputs);
        break;
      case "caracter":
        setCaracter(newInputs);
        break;
      case "sociabilidad":
        setSociabilidad(newInputs);
        break;
      // Agrega casos para los demás campos
      default:
        break;
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const data = {
      suenos: suenos.map((input) => input.value),
      retos: retos.map((input) => input.value),
      fortalezas: fortalezas.map((input) => input.value),
      corporabilidad: corporabilidad.map((input) => input.value),
      creatividad: creatividad.map((input) => input.value),
      afectividad: afectividad.map((input) => input.value),
      espiritualidad: espiritualidad.map((input) => input.value),
      caracter: caracter.map((input) => input.value),
      sociabilidad: sociabilidad.map((input) => input.value),

      // Agrega los demás campos con sus respectivos map
    };

    console.log("Inputs:", data);

    // Verifica que los valores no sean una cadena vacía antes de llamar a savePpa()
    const isFormValid = Object.values(data).every((field) => field.length > 0);

    if (isFormValid) {
      savePpa(
        data.suenos,
        data.retos,
        data.fortalezas,
        data.corporabilidad,
        data.creatividad,
        data.afectividad,
        data.espiritualidad,
        data.caracter,
        data.sociabilidad

        // Pasa los demás campos a la función savePpa
      );
      console.log("Datos enviados:", data);
    } else {
      console.log("Uno o más campos están vacíos");
    }
  };
    const data = {
      suenos: suenos.map((input) => input.value),
      retos: retos.map((input) => input.value),
      fortalezas: fortalezas.map((input) => input.value),
      corporabilidad: corporabilidad.map((input) => input.value),
      creatividad: creatividad.map((input) => input.value),
      afectividad: afectividad.map((input) => input.value),
      espiritualidad: espiritualidad.map((input) => input.value),
      caracter: caracter.map((input) => input.value),
      sociabilidad: sociabilidad.map((input) => input.value),
  
      // Agrega los demás campos con sus respectivos map
    };
  };
 */