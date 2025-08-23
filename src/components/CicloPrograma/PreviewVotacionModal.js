// src/components/CicloPrograma/PreviewVotacionModal.js
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
  const doConfirm = (val) => (onConfirm || onVotar)?.(val);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h3 className="text-2xl font-bold mb-4">
          {modo === "votar"
            ? "Votación de Ciclo"
            : "Confirmar Envío a Votación"}
        </h3>

        <p className="mb-2">
          <span className="font-semibold">Comunidad:</span>{" "}
          {comunidadInfo?.nombre}
        </p>

        {resumen && (
          <>
            <div className="mb-3">
              <span className="font-semibold">Énfasis:</span>{" "}
              {resumen.enfasis?.principal || "—"}
              {resumen.enfasis?.secundario
                ? ` / ${resumen.enfasis.secundario}`
                : ""}
            </div>

            <div className="max-h-56 overflow-auto border rounded p-3 mb-4">
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
                        {a.subtipo || "Categoría"}
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
          </>
        )}

        <div className="mb-3">
          <span className="font-semibold">Miembros convocados:</span>
          <div className="border rounded p-3 mt-1 text-sm">
            <ul className="list-disc list-inside">
              {(comunidadInfo?.miembros || []).map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
                onClick={() => doConfirm(true)} // votar a favor
                disabled={isSubmitting}
              >
                A favor
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() => doConfirm(false)} // votar en contra
                disabled={isSubmitting}
              >
                En contra
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={() => onConfirm?.()} // confirmar envío
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
