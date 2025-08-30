// src/components/GraficosProtagonista/GraficosProtagonista.js (Corregido)

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
// ▼▼▼ 1. IMPORTACIÓN CORREGIDA ▼▼▼
import { areasCaminantes } from "../BitacoraExplorador/data";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
export function GraficosProtagonista({ ppaList, evaluacionData }) {
  // --- GRÁFICO 1: Distribución de Actividades (Fuente: Agendar.js / ppaList) ---
  const todasLasActividades = ppaList.flatMap((ppa) => ppa.actividad || []);
  const conteoPorSubtipo = todasLasActividades.reduce((acc, act) => {
    const subtipo = act.subtipo || "Sin Categoría";
    acc[subtipo] = (acc[subtipo] || 0) + 1;
    return acc;
  }, {});

  const tipoActividadData = {
    labels: Object.keys(conteoPorSubtipo),
    datasets: [
      {
        label: "Cantidad",
        data: Object.values(conteoPorSubtipo),
        backgroundColor: [
          "rgba(44, 18, 97, 0.8)",
          "rgba(237, 26, 57, 0.8)",
          "rgba(4, 188, 153, 0.8)",
          "rgba(254, 194, 14, 0.8)",
          "rgba(155, 207, 255, 0.8)",
          "rgba(107, 24, 78, 0.8)",
        ],
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ],
  };

  // --- GRÁFICO 2: Avance por Área (Fuente: AreasCrecimiento.js / evaluacionData) ---
  const conteoPorArea = {
    labels: areasCaminantes.map((a) => a.titulo.split(" - ")[0]), // Tomamos solo el nombre del área
    datasets: [
      {
        label: "Siempre Listo",
        data: areasCaminantes.map((area) => {
          const areaEval = evaluacionData?.[area.id] || {};
          return Object.values(areaEval).filter((val) => val === "siempre")
            .length;
        }),
        backgroundColor: "rgba(46, 204, 113, 0.7)", // Verde
      },
      {
        label: "A Veces",
        data: areasCaminantes.map((area) => {
          const areaEval = evaluacionData?.[area.id] || {};
          return Object.values(areaEval).filter((val) => val === "aveces")
            .length;
        }),
        backgroundColor: "rgba(241, 196, 15, 0.7)", // Amarillo
      },
      {
        label: "Necesito Prepararme",
        data: areasCaminantes.map((area) => {
          const areaEval = evaluacionData?.[area.id] || {};
          return Object.values(areaEval).filter((val) => val === "necesito")
            .length;
        }),
        backgroundColor: "rgba(231, 76, 60, 0.7)", // Rojo
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gray-50 rounded-lg shadow border">
      <h3 className="text-xl font-bold text-principal mb-6 text-center">
        Análisis de Progresión
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Gráfico 1 (sin cambios) */}
        <div className="text-center">
          <h4 className="font-semibold text-gray-700 mb-2">
            Autoevaluación por Área
          </h4>
          {evaluacionData ? (
            <div className="relative" style={{ height: "280px" }}>
              <Bar
                data={conteoPorArea}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    x: { stacked: true },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Aún no hay autoevaluación guardada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
