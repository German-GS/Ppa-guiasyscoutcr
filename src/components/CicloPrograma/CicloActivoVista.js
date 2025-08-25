// src/components/CicloPrograma/CicloActivoVista.js
import React from 'react';

// Un componente simple para mostrar los detalles de un ciclo ya aprobado.
export function CicloActivoVista({ ciclo }) {
  if (!ciclo) return null;

  const cronograma = ciclo.cronograma || [];
  const enfasisPrincipal = ciclo.enfasis?.principal || "No definido";
  const enfasisSecundario = ciclo.enfasis?.secundario;

  return (
    <div className="p-6 md:p-8">
      <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-6">
        <h2 className="text-2xl font-bold">¡Ciclo de Programa Aprobado y en Marcha!</h2>
        <p>Este es el plan de actividades para el ciclo actual.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Énfasis del Ciclo</h3>
          <p>
            <strong>Principal:</strong> {enfasisPrincipal}
          </p>
          {enfasisSecundario && <p><strong>Secundario:</strong> {enfasisSecundario}</p>}
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Cronograma de Actividades</h3>
          {cronograma.length > 0 ? (
            <ul className="space-y-4">
              {cronograma.map((actividad, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-bold text-morado-principal">{actividad.descripcion}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <span><strong>Fecha:</strong> {actividad.fechaInicio || 'N/A'}</span>
                    <span className="mx-2">|</span>
                    <span><strong>Área:</strong> {actividad.areaDeCrecimientoAsociada || 'N/A'}</span>
                    <span className="mx-2">|</span>
                    <span><strong>Encargado:</strong> {actividad.encargado || 'N/A'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay actividades programadas.</p>
          )}
        </section>

        {ciclo.solicitudesJunta && (
            <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Solicitudes a Junta</h3>
                <p className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap">{ciclo.solicitudesJunta}</p>
            </section>
        )}
      </div>
    </div>
  );
}