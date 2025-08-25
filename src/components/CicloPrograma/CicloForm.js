// src/components/CicloPrograma/CicloForm.js
import React, { useState, useEffect } from "react"; // CAMBIO: Quitamos useRef
import { useAuth } from "../../context/authContext";
import { areasDeCrecimiento } from "../AreasCrecimiento/data";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  getDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { Agendar } from "../Agendar/Agendar";
import { PreviewVotacionModal } from "./PreviewVotacionModal";

export function CicloForm({ comunidadId, esSecretario = false }) {
  const { user } = useAuth();
  const [cicloDocId, setCicloDocId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cicloAnterior, setCicloAnterior] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(!!esSecretario);
  const [miembros, setMiembros] = useState([]);
  const [comunidadNombre, setComunidadNombre] = useState(
    "Comunidad sin nombre"
  );

  // CAMBIO: Eliminamos la ref porque ya no la usaremos
  // const cronogramaRef = useRef();

  const [cicloData, setCicloData] = useState({
    estado: "borrador",
    secretarioId: user?.uid || "",
    comunidadId: comunidadId || "",
    año: new Date().getFullYear(),
    cicloNumero: 1,
    evaluacionAnterior: {},
    enfasis: { principal: "", secundario: "" },
    cronograma: [],
    solicitudesJunta: "",
  });

  // ---------- AUTODETECCIÓN DE SECRETARIO (LÓGICA ORIGINAL)----------
  const autoDetectSecretary = async () => {
    if (!user?.uid) {
      setCanEdit(!!esSecretario);
      return;
    }
    let isSec = !!esSecretario;
    try {
      const meSnap = await getDoc(doc(db, "users", user.uid));
      if (meSnap.exists()) {
        const puesto = (meSnap.data()?.puesto || "").toLowerCase().trim();
        if (puesto === "secretario" || puesto === "secretaria") isSec = true;
      }
    } catch (e) {
      console.warn("[CicloForm] No se pudo leer /users/{uid}:", e?.message);
    }
    if (comunidadId) {
      try {
        const cSnap = await getDoc(doc(db, "comunidades", comunidadId));
        if (cSnap.exists()) {
          const consejo = cSnap.data()?.consejo || {};
          const uidSec = consejo?.secretario?.uid || consejo?.secretaria?.uid;
          if (uidSec && uidSec === user.uid) isSec = true;
        }
      } catch (e) {
        console.warn(
          "[CicloForm] No se pudo leer /comunidades/{id}:",
          e?.message
        );
      }
    }
    setCanEdit(isSec);
  };

  useEffect(() => {
    autoDetectSecretary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, comunidadId, esSecretario]);

  // ---------- CARGAS (LÓGICA ORIGINAL CON CORRECCIÓN) ----------
  useEffect(() => {
    if (!comunidadId) {
      setLoading(false);
      return;
    }

    const fetchComunidad = async () => {
      try {
        const comunidadRef = doc(db, "comunidades", comunidadId);
        const comunidadSnap = await getDoc(comunidadRef);
        setComunidadNombre(
          comunidadSnap.exists()
            ? comunidadSnap.data().nombreSeccion || "Comunidad sin nombre"
            : "Comunidad no encontrada"
        );
      } catch (e) {
        console.error("Nombre comunidad:", e);
      }
      try {
        const protagonistasRef = collection(
          db,
          "consejeros",
          comunidadId,
          "protagonistas"
        );
        const protagonistasSnap = await getDocs(protagonistasRef);
        const list = protagonistasSnap.docs.map((d) => ({
          uid: d.id,
          nombre: d.data().nombre || "(sin nombre)",
        }));
        setMiembros(list);
      } catch (e) {
        console.error("Miembros:", e);
        setMiembros([]);
      }
    };

    const fetchCicloAnterior = async () => {
      try {
        const ciclosRef = collection(db, "ciclos");
        const qCiclos = query(
          ciclosRef,
          where("comunidadId", "==", comunidadId),
          where("estado", "in", ["activo", "evaluado"]),
          orderBy("fechaFin", "desc"),
          limit(1)
        );
        const cicloSnapshot = await getDocs(qCiclos);
        if (!cicloSnapshot.empty) {
          const d = cicloSnapshot.docs[0];
          setCicloAnterior({ id: d.id, ...d.data() });
          setCicloData((prev) => ({
            ...prev,
            cicloNumero: (d.data().cicloNumero || 0) + 1,
          }));
        }
      } catch (e) {
        console.error("Ciclo anterior:", e);
      }
    };

    const fetchBorrador = async () => {
      if (!user?.uid) return;
      try {
        const ciclosRef = collection(db, "ciclos");
        const qBorrador = query(
          ciclosRef,
          where("comunidadId", "==", comunidadId),
          where("secretarioId", "==", user.uid),
          where("estado", "==", "borrador"),
          orderBy("fechaCreacion", "desc"),
          limit(1)
        );
        const snap = await getDocs(qBorrador);
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();
          setCicloDocId(d.id);
          setCicloData((p) => ({
            ...p,
            ...data,
            comunidadId,
            secretarioId: user.uid,
          }));
          // CORRECCIÓN: Se elimina el setTimeout que usaba la ref.
        }
      } catch (e) {
        console.warn("[CicloForm] fetchBorrador:", e?.message);
      }
    };

    (async () => {
      setLoading(true);
      await Promise.all([
        fetchComunidad(),
        fetchCicloAnterior(),
        fetchBorrador(),
      ]);
      setCicloData((p) => ({
        ...p,
        comunidadId,
        secretarioId: user?.uid || "",
      }));
      setLoading(false);
    })();
  }, [comunidadId, user?.uid]);

  // ---------- HANDLERS (LÓGICA ORIGINAL CON CORRECCIONES) ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setCicloData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setCicloData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // CAMBIO: Agregamos el nuevo manejador para Agendar
  const handleCronogramaUpdate = (nuevasActividades) => {
    setCicloData((prev) => ({
      ...prev,
      cronograma: nuevasActividades,
    }));
  };

  // CAMBIO: Eliminamos la función que usaba la ref
  // const actividadesFromRef = () => { ... };

  const guardarBorrador = async () => {
    setIsSubmitting(true);
    try {
      if (!canEdit) throw new Error("Solo el secretario puede guardar.");
      if (!cicloData.enfasis.principal)
        throw new Error("Selecciona un énfasis principal.");

      // Se obtienen las actividades del estado (esto incluye los IDs temporales)
      const actividades = cicloData.cronograma || [];

      // CAMBIO: Creamos una copia limpia del cronograma SIN los IDs temporales
      // para no guardar datos innecesarios en Firestore.
      const cleanCronograma = actividades.map(({ id, ...rest }) => rest);

      const ref = cicloDocId
        ? doc(db, "ciclos", cicloDocId)
        : doc(collection(db, "ciclos"));

      await setDoc(
        ref,
        {
          ...cicloData,
          estado: "borrador",
          cronograma: cleanCronograma, // <-- Usamos la copia limpia para guardar
          fechaCreacion: serverTimestamp(),
          visible: false,
        },
        { merge: true }
      );
      if (!cicloDocId) setCicloDocId(ref.id);
      Swal.fire("Guardado", "Borrador guardado.", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", e.message || "No se pudo guardar.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirPreview = () => {
    // CORRECCIÓN: Leemos el cronograma desde el estado
    const acts = cicloData.cronograma || [];
    setPreview({
      enfasis: cicloData.enfasis,
      solicitudesJunta: cicloData.solicitudesJunta,
      cronograma: acts,
    });
    setModalIsOpen(true);
  };

   const iniciarVotacion = async () => {
  setIsSubmitting(true);
  try {
    if (!canEdit) {
      throw new Error("Solo el secretario puede someter a votación.");
    }
    if (!cicloData.enfasis.principal) {
      throw new Error("Selecciona un énfasis principal.");
    }

    const ref = cicloDocId
      ? doc(db, "ciclos", cicloDocId)
      : doc(collection(db, "ciclos"));
    
    // El tiempo de cierre ahora es de 5 minutos para pruebas
    const ahora = new Date();
    const cierra = Timestamp.fromDate(new Date(ahora.getTime() + 5 * 60000));
    
    const cleanCronograma = cicloData.cronograma.map(({ id, ...rest }) => rest);

    // 1. Guardamos el ciclo, actualizando su estado a "en_votacion"
    await setDoc(
      ref,
      {
        ...cicloData,
        estado: "en_votacion",
        cronograma: cleanCronograma,
        fechaCreacion: cicloData.fechaCreacion || serverTimestamp(),
        visible: false, // Se hará visible solo si se aprueba
        votacion: {
          cierraEn: cierra,
          estado: "en_votacion",
          requeridos: Math.floor(miembros.length / 2) + 1,
          totalMiembros: miembros.length,
          aFavor: 0,
          enContra: 0,
        },
      },
      { merge: true }
    );

    if (!cicloDocId) setCicloDocId(ref.id);

    // --- CÓDIGO RESTAURADO ---
    // 2. Preparamos el envío de notificaciones a TODOS los miembros
    console.log("MIEMBROS QUE SERÁN NOTIFICADOS:", miembros);
    const batch = writeBatch(db);
    const mensaje = `Votación pendiente para el nuevo ciclo de ${comunidadNombre}.`;

    miembros.forEach((miembro) => {
      const notifRef = doc(collection(db, `notificaciones/${miembro.uid}/invitaciones`));
      batch.set(notifRef, {
        tipo: "votacion_ciclo",
        cicloId: ref.id,
        comunidadId,
        creadorId: user.uid,
        venceEn: cierra,
        estado: "pendiente",
        mensaje: mensaje,
        fecha: serverTimestamp(),
      });
    });

    // 3. Ejecutamos el batch para enviar todas las notificaciones a la vez
    await batch.commit();
    // --- FIN DEL CÓDIGO RESTAURADO ---

    setModalIsOpen(false);
    Swal.fire("¡Enviado!", "La propuesta se envió a votación a toda la comunidad.", "success");
  } catch (e) {
    console.error("Error al iniciar votación:", e);
    Swal.fire("Error", e.message || "No se pudo enviar a votación.", "error");
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) return <div className="text-center p-10">Cargando…</div>;
  const soloLectura = !canEdit;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-3xl font-bold text-morado-principal mb-2">
        Crear Nuevo Ciclo de Programa
      </h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border text-sm text-gray-700">
        <p>
          <strong>Comunidad:</strong> {comunidadNombre}
        </p>
        <p>
          <strong>Miembros:</strong> {miembros.map((m) => m.nombre).join(", ")}
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
            1. Propuesta y Selección de Énfasis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Énfasis Principal *
              </label>
              <select
                name="enfasis.principal"
                value={cicloData.enfasis.principal}
                onChange={handleChange}
                className="border-input w-full"
                required
                disabled={soloLectura}
              >
                <option value="">-- Selecciona un área --</option>
                {areasDeCrecimiento.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Énfasis Secundario
              </label>
              <select
                name="enfasis.secundario"
                value={cicloData.enfasis.secundario}
                onChange={handleChange}
                className="border-input w-full"
                disabled={soloLectura}
              >
                <option value="">-- Selecciona un área (opcional) --</option>
                {areasDeCrecimiento
                  .filter((a) => a.id !== cicloData.enfasis.principal)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titulo}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
            2. Evaluación del Ciclo Anterior
          </h2>
          {cicloAnterior ? (
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-bold">
                Evaluando ciclo: {cicloAnterior.año} • Ciclo #
                {cicloAnterior.cicloNumero}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No se encontró un ciclo anterior para evaluar. Este será el
              primero.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
            3. Cronograma de Actividades
          </h2>
          {/* CAMBIO: Se actualiza el componente Agendar para usar props en vez de ref */}
          <Agendar
            initialData={cicloData.cronograma}
            onUpdate={handleCronogramaUpdate}
            simple={true}
            readOnly={soloLectura}
            miembros={miembros.map((m) => m.nombre)}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
            4. Solicitudes a la Junta de Grupo
          </h2>
          <textarea
            name="solicitudesJunta"
            value={cicloData.solicitudesJunta}
            onChange={handleChange}
            rows="3"
            className="border-input w-full"
            placeholder="Describe solicitudes especiales"
            disabled={soloLectura}
          />
        </section>

        {canEdit && (
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={guardarBorrador}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Guardar Borrador
            </button>
            <button
              type="button"
              onClick={abrirPreview}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Someter a Votación"}
            </button>
          </div>
        )}
      </form>

      <PreviewVotacionModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onConfirm={iniciarVotacion}
        resumen={preview}
        comunidadInfo={{
          nombre: comunidadNombre,
          miembros: miembros.map((m) => m.nombre),
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
