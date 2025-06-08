import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/authContext";

export function HistorialAsistencia() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState({});
  const [totalFechas, setTotalFechas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [protagonistas, setProtagonistas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const cargarProtagonistas = async () => {
      if (!user) return;

      try {
        const ref = collection(db, `consejeros/${user.uid}/protagonistas`);
        const snapshot = await getDocs(ref);
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProtagonistas(lista);
      } catch (error) {
        console.error("Error al cargar protagonistas:", error);
      }
    };

    cargarProtagonistas();
  }, [user]);

  useEffect(() => {
    const cargarAsistencias = async () => {
      if (!user || !fechaInicio || !fechaFin) return;

      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, `consejeros/${user.uid}/asistencias`));
        const fechasEnRango = [];
        const conteo = {};

        snapshot.forEach(doc => {
          const fecha = doc.id;
          const fechaObj = new Date(fecha);
          const inicio = new Date(fechaInicio);
          const fin = new Date(fechaFin);

          if (fechaObj >= inicio && fechaObj <= fin) {
            fechasEnRango.push(fecha);
            const { registros } = doc.data();
            Object.entries(registros).forEach(([uid, presente]) => {
              if (!conteo[uid]) conteo[uid] = 0;
              if (presente) conteo[uid]++;
            });
          }
        });

        const resumen = {};
        Object.entries(conteo).forEach(([uid, count]) => {
          resumen[uid] = {
            asistencias: count,
            porcentaje: Math.round((count / fechasEnRango.length) * 100)
          };
        });

        setResumen(resumen);
        setTotalFechas(fechasEnRango.length);
        setLoading(false);
      } catch (error) {
        console.error("No se pudo cargar asistencias:", error);
        setLoading(false);
      }
    };

    cargarAsistencias();
  }, [user, fechaInicio, fechaFin]);

  return (
  <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow text-gray-800">
    <h2 className="text-2xl font-bold text-scout-secondary mb-2">Historial de Asistencia</h2>
    <p className="text-sm text-gray-500 mb-6 italic">
      Consulta el porcentaje de asistencia en el rango de fechas seleccionado
    </p>

    <div className="flex flex-col md:flex-row gap-6 mb-6">
      <div className="flex-1">
        <label className="block text-sm text-gray-700 mb-1">Desde</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={e => setFechaInicio(e.target.value)}
          className="border-input"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm text-gray-700 mb-1">Hasta</label>
        <input
          type="date"
          value={fechaFin}
          onChange={e => setFechaFin(e.target.value)}
          className="border-input"
        />
      </div>
    </div>

    {loading ? (
      <p className="text-gray-600 italic">⏳ Cargando historial de asistencia...</p>
    ) : (
      <>
        <p className="mb-4 text-sm text-gray-600">
          Total de fechas analizadas: <strong>{totalFechas}</strong>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-3 text-gray-700">Nombre</th>
                <th className="border p-3 text-center text-gray-700">Asistencias</th>
                <th className="border p-3 text-center text-gray-700">% Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resumen).map(([protaId, resumenData]) => {
                const prota = protagonistas.find(p => p.id === protaId);
                return (
                  <tr key={protaId} className="hover:bg-gray-50 transition">
                    <td className="border p-3 text-gray-800">
                      {prota ? `${prota.nombre} ${prota.apellido}` : "Nombre no disponible"}
                    </td>
                    <td className="border p-3 text-center">{resumenData.asistencias}</td>
                    <td className="border p-3 text-center">{resumenData.porcentaje}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
);
}
