// src/components/CicloPrograma/PreviewVotacionModal.js (Actualizado)
import React from "react";

export function PreviewVotacionModal({
  isOpen,
  onClose,
  onConfirm,
  onVotar,
  isSubmitting,
  comunidadInfo,
  resumen,
  modo = "preview",
}) {
  if (!isOpen) return null;

  const cronograma = resumen?.cronograma || [];
  // Extraemos los nuevos datos del resumen
  const objetivoGeneral = resumen?.objetivoGeneral;
  const objetivosEspecificos = resumen?.objetivosEspecificos || [];

  const doConfirm = (val) => (onConfirm || onVotar)?.(val);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">
          {modo === "votar"
            ? "Votación de Ciclo"
            : "Confirmar Envío a Votación"}
        </h3>

        <div className="space-y-3 text-sm sm:text-base">
          <p>
            <span className="font-semibold">Comunidad:</span>{" "}
            {comunidadInfo?.nombre}
          </p>

          {/* ▼▼ SECCIÓN DE FECHAS AÑADIDA ▼▼ */}
          {(resumen.fechaInicio || resumen.fechaFin) && (
            <p>
              <span className="font-semibold">Duración del ciclo:</span>{" "}
              {resumen.fechaInicio || "N/A"} al {resumen.fechaFin || "N/A"}
            </p>
          )}

          <p>
            <span className="font-semibold">Énfasis:</span>{" "}
            {resumen.enfasis?.principal || "—"}
            {resumen.enfasis?.secundario
              ? ` / ${resumen.enfasis.secundario}`
              : ""}
          </p>
        </div>

        {resumen && (
          <div className="space-y-4 mt-4">
            {/* ▼▼ SECCIÓN DE OBJETIVOS AÑADIDA ▼▼ */}
            <div>
              <h4 className="font-semibold mb-1">Objetivos Propuestos:</h4>
              <div className="border rounded p-3 text-sm space-y-2 bg-gray-50">
                {objetivoGeneral && (
                  <div>
                    <p className="font-medium">General:</p>
                    <p className="pl-2 italic">"{objetivoGeneral}"</p>
                  </div>
                )}
                {objetivosEspecificos.length > 0 && (
                  <div>
                    <p className="font-medium">Específicos:</p>
                    <ul className="list-disc list-inside pl-2">
                      {objetivosEspecificos
                        .filter((o) => o.texto)
                        .map((o, i) => (
                          <li key={i}>{o.texto}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-1">
                Actividades Propuestas (Cronograma):
              </h4>
              <div className="max-h-48 overflow-auto border rounded p-3 bg-gray-50">
                {cronograma.length === 0 ? (
                  <p className="text-gray-500 italic">Sin actividades.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {cronograma.map((a, i) => (
                      <li key={i} className="border-b pb-2 last:border-0">
                        <div className="font-medium">
                          {a.descripcion || "(sin descripción)"}
                        </div>
                        <div className="text-gray-600">
                          {a.fechaInicio || "¿?"} —{" "}
                          {a.fechaFin || a.fechaInicio || "¿?"}
                          {" · "}
                          Área: {a.areaDeCrecimientoAsociada || "—"}
                          {" · "}
                          Encargado: {a.encargado || "—"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-1">Miembros convocados:</h4>
          <div className="border rounded p-3 text-sm bg-gray-50">
            <ul className="list-disc list-inside">
              {(comunidadInfo?.miembros || []).map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          {modo === "votar" ? (
            <>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                onClick={() => doConfirm(true)}
                disabled={isSubmitting}
              >
                A favor
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() => doConfirm(false)}
                disabled={isSubmitting}
              >
                En contra
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => onConfirm?.()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando…" : "Confirmar y Enviar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
