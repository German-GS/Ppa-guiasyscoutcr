import React, { useState, useEffect } from "react";
import { getPpa } from "../firebase";

export function Ppa({ selectedPpa, closeModal }) {
  const [ppaData, setPpaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPpa();
        console.log("Ppa data:", data);
        setPpaData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  if (!ppaData) {
    return <div>Cargando...</div>;
  }

  const filteredValues = Object.entries(selectedPpa).filter(
    ([key]) =>
      ![
        "id",
        "createdAt",
        "createdBy",
        "suenos",
        "retos",
        "fortalezas",
        "afectividad",
        "sociabilidad",
        "corporabilidad",
        "caracter",
        "creatividad",
        "espiritualidad"
      ].includes(key)
  );

  const orderedValues = [
    ["Sueños", selectedPpa.suenos],
    ["Mis fortalezas", selectedPpa.fortalezas],
    ["Retos", selectedPpa.retos],
    ["Afectividad", selectedPpa.afectividad],
    ["Espiritualidad", selectedPpa.espiritualidad],
    ["Corporabilidad", selectedPpa.corporabilidad],
    ["Caracter", selectedPpa.caracter],
    ["Sociabilidad", selectedPpa.sociabilidad],
    ["Creatividad", selectedPpa.creatividad],
    ...filteredValues,
  ];

  return (
    <div>
    <div className="bg-gray-100 rounded-lg max-w-lg w-full mx-4 md:mx-auto text-gray-500">
      <div className="bg-primary mx-auto w-full py-5 px-4 rounded-t-lg">
        <h2 className="text-3xl text-white">PPA</h2>
      </div>
      <hr className="mb-4" />
      <div className="grid grid-cols-3 gap-4 p-2">
        {orderedValues.map(([key, value], index) => (
          <div key={key}>
            <h2 className="text-lg font-bold">{key}</h2>
            {Array.isArray(value) ? (
              <ul>
                {value.map((item, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold mr-2">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <span className="text-sm font-semibold mr-2">{index + 1}</span>
                {value}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="text-white bg-rover1-100 hover:bg-rover-100 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 m-2 ml-2"
          onClick={closeModal}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);
}






