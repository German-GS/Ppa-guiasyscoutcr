// src/components/DashboardInicio/DashboardInicio.js

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
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

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;
      try {
        // 1) Lee protagonistas de este consejero (IDs = UIDs)
        const protagonistasRef = collection(
          db,
          `consejeros/${user.uid}/protagonistas`
        );
        const protagonistasSnap = await getDocs(protagonistasRef);
        const protagonistasUids = protagonistasSnap.docs.map((d) => d.id);

        if (protagonistasUids.length === 0) {
          setStats({
            totalProtagonistas: 0,
            enDecision: 0,
            enCompromiso: 0,
            conInsignia: 0,
            conConfirmacion: 0,
            proximosARemar: 0,
          });
          setAlertasPpa([]);
          setLoading(false);
          return;
        }

        // 2) Trae perfiles de /users por UID (permiso: ahora permitido)
        const userDocs = await Promise.all(
          protagonistasUids.map((uid) => getDoc(doc(db, "users", uid)))
        );
        const protagonistasData = userDocs
          .filter((s) => s.exists())
          .map((s) => ({ uid: s.id, ...s.data() }));

        // 3) Calcula estadísticas (igual que antes)
        let enDecision = 0,
          enCompromiso = 0,
          conInsignia = 0,
          conConfirmacion = 0,
          proximosARemar = 0;
        protagonistasData.forEach((prota) => {
          if (prota.etapas?.compromiso) enCompromiso++;
          else if (prota.etapas?.decision) enDecision++;
          if (prota.etapas?.insigniaServicio) conInsignia++;
          if (prota.etapas?.confirmacion) conConfirmacion++;

          if (prota.fechaNacimiento) {
            const fecha21 = new Date(prota.fechaNacimiento);
            fecha21.setFullYear(fecha21.getFullYear() + 21);
            const meses =
              (fecha21 - new Date()) / (1000 * 60 * 60 * 24 * 30.44);
            if (meses <= 7 && meses > 0) proximosARemar++;
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

        // 4) PPA por lotes de <=10 userIds (permiso: ahora permitido)
        const lotes = chunk(
          protagonistasData.map((p) => p.uid),
          10
        );
        const ppaDocs = [];
        for (const lote of lotes) {
          const qPpa = query(
            collection(db, "PPA"),
            where("userId", "in", lote),
            where("estado", "==", "activo")
          );
          const snap = await getDocs(qPpa);
          ppaDocs.push(...snap.docs);
        }

        const nuevasAlertas = [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        ppaDocs.forEach((docu) => {
          const ppa = docu.data();
          const prota = protagonistasData.find((p) => p.uid === ppa.userId);
          const fechaVig = ppa.fechaDeVigencia?.toDate?.();
          if (!prota || !fechaVig) return;
          fechaVig.setHours(0, 0, 0, 0);
          const dias = Math.ceil((fechaVig - hoy) / (1000 * 60 * 60 * 24));
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
          if (mensaje) nuevasAlertas.push({ id: docu.id, mensaje, nivel });
        });

        setAlertasPpa(nuevasAlertas.sort((a, b) => a.nivel - b.nivel));
      } catch (e) {
        console.error("Error cargando datos del dashboard:", e);
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
