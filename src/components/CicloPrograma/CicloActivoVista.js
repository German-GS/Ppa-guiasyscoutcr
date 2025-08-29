// src/components/CicloPrograma/CicloActivoVista.js
import React from "react";

export function CicloActivoVista({ ciclo, onEvaluar }) {
  if (!ciclo) return null;

  const cronograma = ciclo.cronograma || [];
  const enfasisPrincipal = ciclo.enfasis?.principal || "No definido";
  const enfasisSecundario = ciclo.enfasis?.secundario;
  const objetivoGeneral = ciclo.objetivoGeneral || "No definido";
  const objetivosEspecificos = ciclo.objetivosEspecificos || [];

  const mostrarBotonEvaluar = () => {
    if (!ciclo.fechaFin || ciclo.estado !== "activo") return false;

    const fechaFin = new Date(ciclo.fechaFin);
    const ahora = new Date();
    fechaFin.setDate(fechaFin.getDate() + 1);

    const unMesEnMilisegundos = 30 * 24 * 60 * 60 * 1000;

    return (
      fechaFin.getTime() - ahora.getTime() <= unMesEnMilisegundos &&
      ahora < fechaFin
    );
  };

  return (
    <div className="p-6 md-p-8">
      <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-6">
        <h2 className="text-2xl font-bold">
          ¡Ciclo de Programa Aprobado y en Marcha!
        </h2>
        <p>Este es el plan de actividades para el ciclo actual.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Detalles del Ciclo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Fecha de Inicio:</strong> {ciclo.fechaInicio || "N/A"}
            </p>
            <p>
              <strong>Fecha de Fin:</strong> {ciclo.fechaFin || "N/A"}
            </p>
            <p>
              <strong>Énfasis Principal:</strong> {enfasisPrincipal}
            </p>
            {enfasisSecundario && (
              <p>
                <strong>Énfasis Secundario:</strong> {enfasisSecundario}
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Objetivos del Ciclo
          </h3>
          <div>
            <p className="font-bold">Objetivo General:</p>
            <p className="pl-4 italic">{objetivoGeneral}</p>
          </div>
          <div className="mt-2">
            <p className="font-bold">Objetivos Específicos:</p>
            <ul className="list-disc list-inside pl-4">
              {objetivosEspecificos.map((obj, index) => (
                <li key={index}>{obj.texto}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Cronograma de Actividades
          </h3>
          {cronograma.length > 0 ? (
            <ul className="space-y-4">
              {/* ▼▼▼ CÓDIGO RESTAURADO AQUÍ ▼▼▼ */}
              {cronograma.map((actividad, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-bold text-morado-principal">
                    {actividad.descripcion}
                  </p>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>
                      <strong>Fecha:</strong> {actividad.fechaInicio || "N/A"}
                    </span>
                    <span className="mx-2">|</span>
                    <span>
                      <strong>Área:</strong>{" "}
                      {actividad.areaDeCrecimientoAsociada || "N/A"}
                    </span>
                    <span className="mx-2">|</span>
                    <span>
                      <strong>Encargado:</strong> {actividad.encargado || "N/A"}
                    </span>
                  </div>
                </li>
              ))}
              {/* ▲▲▲ FIN DEL CÓDIGO RESTAURADO ▲▲▲ */}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No hay actividades programadas.
            </p>
          )}
        </section>

        {ciclo.solicitudesJunta && (
          <section>
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
              Solicitudes a Junta
            </h3>
            <p className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap">
              {ciclo.solicitudesJunta}
            </p>
          </section>
        )}
      </div>

      {mostrarBotonEvaluar() && (
        <div className="text-center p-4 mt-6 border-t">
          <p className="text-sm text-gray-600 mb-2">
            La evaluación del ciclo ya está disponible.
          </p>
          <button
            className="btn-primary bg-blue-600 hover:bg-blue-700"
            onClick={() => onEvaluar(ciclo)}
          >
            Evaluar Ciclo
          </button>
        </div>
      )}
    </div>
  );
}
