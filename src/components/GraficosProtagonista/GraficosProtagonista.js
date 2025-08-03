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
// Importamos los datos de la brújula para saber el total de preguntas
import { areasDeCrecimiento } from "../AreasCrecimiento/data";

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
    labels: areasDeCrecimiento.map((a) => a.titulo),
    datasets: [
      {
        label: "Sí",
        data: areasDeCrecimiento.map((area) =>
          area.preguntas.reduce(
            (count, pregunta, index) =>
              evaluacionData?.[`${area.id}_${index}`]?.answer === "si"
                ? count + 1
                : count,
            0
          )
        ),
        backgroundColor: "rgba(4, 188, 153, 0.7)",
      },
      {
        label: "No",
        data: areasDeCrecimiento.map((area) =>
          area.preguntas.reduce(
            (count, pregunta, index) =>
              evaluacionData?.[`${area.id}_${index}`]?.answer === "no"
                ? count + 1
                : count,
            0
          )
        ),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
      {
        label: "Pendiente",
        data: areasDeCrecimiento.map((area) =>
          area.preguntas.reduce(
            (count, pregunta, index) =>
              !evaluacionData?.[`${area.id}_${index}`]?.answer
                ? count + 1
                : count,
            0
          )
        ),
        backgroundColor: "rgba(209, 213, 219, 0.7)",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-gray-50 rounded-lg shadow border">
      <h3 className="text-xl font-bold text-morado-principal mb-6 text-center">
        Análisis de Progresión
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center">
          <h4 className="font-semibold text-gray-700 mb-2">
            Distribución de Actividades
          </h4>
          {todasLasActividades.length > 0 ? (
            <div className="relative" style={{ height: "280px" }}>
              <Doughnut
                data={tipoActividadData}
                options={{ maintainAspectRatio: false, responsive: true }}
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">Sin actividades registradas.</p>
          )}
        </div>

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
