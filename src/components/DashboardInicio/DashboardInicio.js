// src/components/DashboardInicio/DashboardInicio.js

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Users,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Award,
  Anchor,
} from "lucide-react";

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
    totalProtagonistas: 0,
    enDecision: 0,
    enCompromiso: 0,
    conInsignia: 0,
    conConfirmacion: 0,
    proximosARemar: 0,
  });
  const [alertasPpa, setAlertasPpa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        const protagonistasRef = collection(
          db,
          `consejeros/${user.uid}/protagonistas`
        );
        const protagonistasSnap = await getDocs(protagonistasRef);
        const protagonistasEmails = protagonistasSnap.docs.map(
          (doc) => doc.data().email
        );

        if (protagonistasEmails.length === 0) {
          setLoading(false);
          return;
        }

        const usersQuery = query(
          collection(db, "users"),
          where("email", "in", protagonistasEmails)
        );
        const usersSnap = await getDocs(usersQuery);
        const protagonistasData = usersSnap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        let enDecision = 0,
          enCompromiso = 0,
          conInsignia = 0,
          conConfirmacion = 0,
          proximosARemar = 0;

        // ▼▼▼ LÓGICA DE CONTEO CORREGIDA ▼▼▼
        protagonistasData.forEach((prota) => {
          // Si está en Compromiso, se cuenta ahí y no en Decisión.
          if (prota.etapas?.compromiso) {
            enCompromiso++;
          }
          // Si no, se verifica si está en Decisión.
          else if (prota.etapas?.decision) {
            enDecision++;
          }

          // Estos son hitos separados y se pueden contar independientemente.
          if (prota.etapas?.insigniaServicio) conInsignia++;
          if (prota.etapas?.confirmacion) conConfirmacion++;

          if (prota.fechaNacimiento) {
            const fecha21 = new Date(prota.fechaNacimiento);
            fecha21.setFullYear(fecha21.getFullYear() + 21);
            const mesesRestantes =
              (fecha21.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24 * 30.44);
            if (mesesRestantes <= 7 && mesesRestantes > 0) {
              proximosARemar++;
            }
          }
        });

        setStats({
          totalProtagonistas: protagonistasData.length,
          enDecision,
          enCompromiso,
          conInsignia,
          conConfirmacion,
          proximosARemar,
        });

        // ▼▼▼ CONSULTA DE PPAs CORREGIDA ▼▼▼
        // Ahora buscamos explícitamente los PPAs con estado 'activo'.
        const protagonistasUids = protagonistasData.map((p) => p.uid);
        const ppaQuery = query(
          collection(db, "PPA"),
          where("userId", "in", protagonistasUids),
          where("estado", "==", "activo")
        );
        const ppaSnap = await getDocs(ppaQuery);

        const nuevasAlertas = [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        ppaSnap.forEach((doc) => {
          const ppa = doc.data();
          const prota = protagonistasData.find((p) => p.uid === ppa.userId);
          const fechaVigencia = ppa.fechaDeVigencia?.toDate();

          if (prota && fechaVigencia) {
            fechaVigencia.setHours(0, 0, 0, 0);
            const diffTime = fechaVigencia.getTime() - hoy.getTime();
            const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let mensaje = "",
              nivel = -1;

            if (dias < 0) {
              mensaje = `El PPA de ${
                prota.nombre || "un protagonista"
              } está vencido por ${Math.abs(dias)} días.`;
              nivel = 0;
            } else if (dias <= 14) {
              mensaje = `El PPA de ${
                prota.nombre || "un protagonista"
              } vence en ${dias} días.`;
              nivel = 1;
            } else if (dias <= 31) {
              mensaje = `El PPA de ${
                prota.nombre || "un protagonista"
              } vence en aprox. ${Math.round(dias / 7)} semanas.`;
              nivel = 2;
            } else if (dias <= 62) {
              mensaje = `El PPA de ${
                prota.nombre || "un protagonista"
              } vence en menos de 2 meses.`;
              nivel = 3;
            }

            if (mensaje) nuevasAlertas.push({ id: doc.id, mensaje, nivel });
          }
        });

        setAlertasPpa(nuevasAlertas.sort((a, b) => a.nivel - b.nivel));
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Acciones Prioritarias"
          icon={<AlertTriangle className="text-yellow-500" />}
        >
          <div className="space-y-3 text-sm">
            {alertasPpa.length > 0 ? (
              alertasPpa.map((alerta) => (
                <p
                  key={alerta.id}
                  className={`font-semibold ${
                    alerta.nivel === 0 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  - {alerta.mensaje}
                </p>
              ))
            ) : (
              <p className="text-gray-600">
                No hay PPAs que requieran atención.
              </p>
            )}
            {stats.proximosARemar > 0 && (
              <p className="font-semibold text-blue-600 mt-4 pt-2 border-t">
                - Tienes {stats.proximosARemar} protagonista(s) próximo(s) a
                Remar su Propia Canoa.
              </p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Resumen de la Comunidad"
          icon={<Users className="text-blue-500" />}
        >
          <div className="space-y-3">
            <p className="font-bold text-3xl text-gray-800">
              {stats.totalProtagonistas}{" "}
              <span className="text-base font-normal">
                Protagonistas Activos
              </span>
            </p>
            <div className="text-sm space-y-1 pt-2 border-t">
              <p>
                <CheckSquare className="inline-block w-4 h-4 mr-2 text-green-500" />
                {stats.enDecision} en Etapa de Decisión
              </p>
              <p>
                <Award className="inline-block w-4 h-4 mr-2 text-yellow-500" />
                {stats.enCompromiso} en Etapa de Compromiso
              </p>
              <p>
                <Award className="inline-block w-4 h-4 mr-2 text-blue-500" />
                {stats.conInsignia} con Insignia de Servicio
              </p>
              <p>
                <Award className="inline-block w-4 h-4 mr-2 text-purple-500" />
                {stats.conConfirmacion} con Confirmación
              </p>
              <p>
                <Anchor className="inline-block w-4 h-4 mr-2 text-red-500" />
                {stats.proximosARemar} próximo(s) a Remar
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => onNavigate("protagonistas")}
                className="btn-morado px-3 py-1 text-xs rounded-md"
              >
                Ver Expedientes
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
