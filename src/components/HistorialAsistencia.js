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
    <div>
      <h2 className="text-xl font-bold mb-4 text-scout-secondary">Historial de Asistencia</h2>

      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm text-gray-700">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className="border border-gray-300 bg-white text-gray-800 rounded px-3 py-2 focus:ring-scout focus:border-scout"
            />

        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-700">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            className="border border-gray-300 bg-white text-gray-800 rounded px-3 py-2 focus:ring-scout focus:border-scout"
            />

        </div>
      </div>

      {loading ? (
        <p className="text-gray-800">Cargando historial...</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-gray-600">
            Total de fechas en el rango: <strong>{totalFechas}</strong>
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-gray-700">Nombre Protagonista</th>
                <th className="border p-2 text-center text-gray-700">Asistencias</th>
                <th className="border p-2 text-center text-gray-700">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resumen).map(([protaId, resumenData]) => {
                const prota = protagonistas.find(p => p.id === protaId);
                return (
                  <tr key={protaId} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="border p-2 text-gray-800">
                      {prota ? `${prota.nombre} ${prota.apellido}` : "Nombre no disponible"}
                    </td>
                    <td className="border p-2 text-center text-gray-800">{resumenData.asistencias}</td>
                    <td className="border p-2 text-center text-gray-800">{resumenData.porcentaje}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
