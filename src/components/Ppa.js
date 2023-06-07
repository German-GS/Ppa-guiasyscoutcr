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

  const filteredValues = Object.entries(ppaData).filter(
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
        "espiritualidad",
        "actividad",
        "fecha",
      ].includes(key)
  );

  const orderedValues = [
    ["Sueños", selectedPpa.suenos],
    ["Retos", selectedPpa.retos],
    ["Mis fortalezas", selectedPpa.fortalezas],
    ["Afectividad", selectedPpa.afectividad],
    ["Espiritualidad", selectedPpa.espiritualidad],
    ["Corporabilidad", selectedPpa.corporabilidad],
    ["Caracter", selectedPpa.caracter],
    ["Sociabilidad", selectedPpa.sociabilidad],
    ["Creatividad", selectedPpa.creatividad],
    ...filteredValues,
    selectedPpa.actividad
      ? ["Actividad", selectedPpa.actividad.actividad]
      : null,
    selectedPpa.actividad ? ["Fecha", selectedPpa.actividad.fecha] : null,
  ]
    .filter(Boolean)
    .sort((a, b) => {
      if (a[0] === "Actividad") return 1;
      if (b[0] === "Actividad") return -1;
      return 0;
    });

  return (
    <div>
      <div className="bg-gray-100 rounded-lg max-w-lg w-full mx-4 md:mx-auto text-gray-500">
        <div className="bg-primary mx-auto w-full py-5 px-4 rounded-t-lg">
          <h2 className="text-3xl text-white">PPA</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 p-2">
          <div className="p-2">
            <h2 className="text-lg font-bold">Sueños</h2>
            {Array.isArray(selectedPpa.suenos) ? (
              <ul>
                {selectedPpa.suenos.map((item, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold mr-2">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <span className="text-sm font-semibold mr-2">1</span>
                {selectedPpa.suenos}
              </p>
            )}
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Retos</h2>
            {Array.isArray(selectedPpa.retos) ? (
              <ul>
                {selectedPpa.retos.map((item, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold mr-2">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <span className="text-sm font-semibold mr-2">1</span>
                {selectedPpa.retos}
              </p>
            )}
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Mis fortalezas</h2>
            {Array.isArray(selectedPpa.fortalezas) ? (
              <ul>
                {selectedPpa.fortalezas.map((item, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold mr-2">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <span className="text-sm font-semibold mr-2">1</span>
                {selectedPpa.fortalezas}
              </p>
            )}
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Caracter</h2>
            <p>{selectedPpa.caracter}</p>
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Afectividad</h2>
            <p>{selectedPpa.afectividad}</p>
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Espiritualidad</h2>
            {Array.isArray(selectedPpa.espiritualidad) ? (
              <ul>
                {selectedPpa.espiritualidad.map((item, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold mr-2">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <span className="text-sm font-semibold mr-2">1</span>
                {selectedPpa.espiritualidad}
              </p>
            )}
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Creatividad</h2>
            <p>{selectedPpa.creatividad}</p>
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Sociabilidad</h2>
            <p>{selectedPpa.sociabilidad}</p>
          </div>
          <div className="p-2">
            <h2 className="text-lg font-bold">Corporabilidad</h2>
            <p>{selectedPpa.corporabilidad}</p>
          </div>
        </div>
        <div className="mt-6">
          <hr className="my-4" />
          <h2 className="text-lg font-bold ml-2">Actividades</h2>
          {Array.isArray(selectedPpa.actividad) &&
          selectedPpa.actividad.length > 0 ? (
            <div className="p-2">
              {selectedPpa.actividad.map((item, index) => (
                <div key={index} className="flex">
                  <div className="mr-4">
                    <h2 className="text-lg font-bold mr-40">Actividad</h2>
                    <p>{item.actividad}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Fecha</h2>
                    <p>{item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay actividad registrada</p>
          )}
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
