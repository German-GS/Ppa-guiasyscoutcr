// src/components/DashboardInicio.js

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Users, AlertTriangle, Calendar, ClipboardCheck } from "lucide-react";

// Componente para una tarjeta individual del dashboard
const DashboardCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-lg font-bold text-morado-principal ml-3">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

export function DashboardInicio({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    decision: 0,
    compromiso: 0,
  });
  const [ppasPorVencer, setPpasPorVencer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        // 1. Obtener todos los protagonistas del consejero
        const protagonistasRef = collection(
          db,
          `consejeros/${user.uid}/protagonistas`
        );
        const protagonistasSnap = await getDocs(protagonistasRef);
        const protagonistasList = protagonistasSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2. Calcular estadísticas de etapas
        let enDecision = 0;
        let enCompromiso = 0;

        // Necesitamos leer el documento de cada protagonista para saber su etapa
        const protagonistasDataPromises = protagonistasList.map((p) =>
          getDocs(query(collection(db, "users"), where("email", "==", p.email)))
        );
        const protagonistasDataSnapshots = await Promise.all(
          protagonistasDataPromises
        );

        protagonistasDataSnapshots.forEach((snap) => {
          if (!snap.empty) {
            const userData = snap.docs[0].data();
            if (userData.etapas?.compromiso) {
              enCompromiso++;
            } else {
              enDecision++;
            }
          }
        });

        setStats({
          total: protagonistasList.length,
          decision: enDecision,
          compromiso: enCompromiso,
        });

        // 3. (Futuro) Aquí iría la lógica para buscar PPAs por vencer y solicitudes pendientes
        // Por ahora, lo dejamos como placeholder
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="text-gray-600">Cargando visión general...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-scout-secondary mb-4">
          Visión General
        </h2>
      </div>

      {/* Grid principal del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Acciones Prioritarias */}
        <DashboardCard
          title="Acciones Prioritarias"
          icon={<AlertTriangle className="text-yellow-500" />}
        >
          <div className="space-y-3 text-sm">
            {/* Aquí iría la lista dinámica de PPAs por vencer */}
            <p className="text-gray-600">No hay PPAs próximos a vencer.</p>
            <p className="text-gray-600">
              No hay solicitudes de reconocimiento pendientes.
            </p>
            <p className="text-gray-600">
              {stats.decision} protagonista(s) en Etapa de Decisión.
            </p>
          </div>
        </DashboardCard>

        {/* Card: Resumen de la Comunidad */}
        <DashboardCard
          title="Resumen de la Comunidad"
          icon={<Users className="text-blue-500" />}
        >
          <div className="space-y-3">
            <p className="font-bold text-3xl text-gray-800">
              {stats.total}{" "}
              <span className="text-base font-normal">
                Protagonistas Activos
              </span>
            </p>
            <div className="text-sm">
              <p>{stats.compromiso} en Etapa de Compromiso</p>
              <p>{stats.decision} en Etapa de Decisión</p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => onNavigate("protagonistas")}
                className="btn-morado px-3 py-1 text-xs rounded-md"
              >
                Ver Protagonistas
              </button>
              <button
                onClick={() => onNavigate("asistencia")}
                className="btn-morado px-3 py-1 text-xs rounded-md"
              >
                Tomar Asistencia
              </button>
            </div>
          </div>
        </DashboardCard>

        {/* Card: Próximos Eventos */}
        <DashboardCard
          title="Próximos Eventos"
          icon={<Calendar className="text-green-500" />}
        >
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">
              <strong>Próxima Asamblea:</strong> (Fecha por definir)
            </p>
            <p className="text-gray-600">No hay otros eventos programados.</p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
