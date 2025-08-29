// src/components/ConsejoComunidad/ConsejoComunidad.js
import React, { useState, useEffect } from "react";
import { Navbar } from "../Navbar/Navbar";
import { CicloActivoVista } from "../CicloPrograma/CicloActivoVista";
import { EvaluacionCiclo } from "../CicloPrograma/EvaluacionCiclo";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { CicloForm } from "../CicloPrograma/CicloForm";
import { VotarCiclo } from "../CicloPrograma/VotarCiclo";
import Swal from "sweetalert2";

export function ConsejoComunidad() {
  const { user } = useAuth();
  const [vistaActual, setVistaActual] = useState("ciclo");
  const [esSecretario, setEsSecretario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comunidadId, setComunidadId] = useState(null);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [evaluandoCiclo, setEvaluandoCiclo] = useState(null);

  // Estados para manejar el ciclo y la votación
  const [cicloActivo, setCicloActivo] = useState(null);
  const [comunidadNombre, setComunidadNombre] = useState("");
  const [miembrosNombres, setMiembrosNombres] = useState([]);
  const [miVoto, setMiVoto] = useState(null);
  const [cargandoVoto, setCargandoVoto] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function encontrarConsejeroPorProtagonista(db, protagonistaUid) {
      const q = query(
        collectionGroup(db, "protagonistas"),
        where("uid", "==", protagonistaUid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return doc.ref.parent.parent.id;
      }
      return null;
    }

    const verificarRolDirecto = async () => {
      setLoading(true);
      try {
        const uid = user?.uid;
        if (!uid) throw new Error("No hay usuario autenticado");
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        let flagSecretario = false;
        let idPerfil = null;
        if (userSnap.exists()) {
          const userData = userSnap.data();
          flagSecretario =
            (userData?.puesto || "").toLowerCase() === "secretario";
          idPerfil = (userData?.consejeroId || "").trim() || null;
        }
        let validoPorPerfil = false;
        if (idPerfil) {
          const consejeroSnap = await getDoc(doc(db, "consejeros", idPerfil));
          const comunidadSnap = await getDoc(doc(db, "comunidades", idPerfil));
          validoPorPerfil = consejeroSnap.exists() && comunidadSnap.exists();
          if (validoPorPerfil) {
            setComunidadId(idPerfil);
            setEsSecretario(flagSecretario);
            setLoading(false);
            return;
          }
        }
        let idResuelto = idPerfil;
        if (!validoPorPerfil) {
          const cid = await encontrarConsejeroPorProtagonista(db, uid);
          if (cid) {
            idResuelto = cid;
            await updateDoc(userRef, { consejeroId: cid });
          } else {
            idResuelto = idPerfil || uid;
          }
        }
        console.log(
          "[ConsejoComunidad] Comunidad ID resuelta para este usuario:",
          idResuelto
        );
        setEsSecretario(flagSecretario);
        setComunidadId(idResuelto);
      } catch (err) {
        console.error("Error al verificar el rol:", err);
        if (user?.uid) setComunidadId(user.uid);
      } finally {
        setLoading(false);
      }
    };
    verificarRolDirecto();
  }, [user]);

  useEffect(() => {
    if (!comunidadId) return;

    const fetchComunidadInfo = async () => {
      try {
        const comDoc = await getDoc(doc(db, "comunidades", comunidadId));
        if (comDoc.exists()) {
          setComunidadNombre(comDoc.data().nombreSeccion || "Comunidad");
        }
        const protasSnap = await getDocs(
          collection(db, `consejeros/${comunidadId}/protagonistas`)
        );
        setMiembrosNombres(protasSnap.docs.map((d) => d.data().nombre || ""));
      } catch (e) {
        console.error("No se pudo cargar la info de la comunidad", e);
      }
    };
    fetchComunidadInfo();

    const ciclosRef = collection(db, "ciclos");
    const q = query(
      ciclosRef,
      where("comunidadId", "==", comunidadId),
      where("estado", "in", ["en_votacion", "activo"]),
      orderBy("fechaCreacion", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cicloDoc = snapshot.docs[0];
          setCicloActivo({ id: cicloDoc.id, ...cicloDoc.data() });
        } else {
          setCicloActivo(null);
        }
      },
      (error) => {
        console.error("Error al escuchar el ciclo:", error);
      }
    );

    return () => unsubscribe();
  }, [comunidadId]);

  useEffect(() => {
    if (
      !user?.uid ||
      !cicloActivo?.id ||
      cicloActivo.estado !== "en_votacion"
    ) {
      setCargandoVoto(false);
      setMiVoto(null);
      return;
    }

    setCargandoVoto(true);
    const votoRef = doc(db, "ciclos", cicloActivo.id, "votos", user.uid);
    const unsubscribe = onSnapshot(votoRef, (docSnap) => {
      setMiVoto(docSnap.exists() ? docSnap.data() : null);
      setCargandoVoto(false);
    });

    return () => unsubscribe();
  }, [user?.uid, cicloActivo]);

  const SubMenu = () => (
    <nav className="bg-white shadow-md rounded-lg p-2 mb-8 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
      <button
        onClick={() => setVistaActual("ciclo")}
        className={`btn-secondary ${
          vistaActual === "ciclo" ? "btn-morado text-white" : ""
        }`}
        style={{ width: "auto", padding: "0.5rem 1rem" }}
      >
        Ciclo de Programa
      </button>
      <button
        onClick={() => setVistaActual("actas")}
        className={`btn-secondary ${
          vistaActual === "actas" ? "btn-morado text-white" : ""
        }`}
        style={{ width: "auto", padding: "0.5rem 1rem" }}
      >
        Actas
      </button>
      <button
        onClick={() => setVistaActual("tesoreria")}
        className={`btn-secondary ${
          vistaActual === "tesoreria" ? "btn-morado text-white" : ""
        }`}
        style={{ width: "auto", padding: "0.5rem 1rem" }}
      >
        Tesoreria
      </button>
      <button
        onClick={() => setVistaActual("carta")}
        className={`btn-secondary ${
          vistaActual === "carta" ? "btn-morado text-white" : ""
        }`}
        style={{ width: "auto", padding: "0.5rem 1rem" }}
      >
        Carta Comunidad
      </button>
    </nav>
  );

  const handleSaveEvaluacion = async (cicloId, data) => {
    try {
      const cicloRef = doc(db, "ciclos", cicloId);
      await updateDoc(cicloRef, {
        estado: "evaluado",
        evaluacion: data,
      });
      setEvaluandoCiclo(null); // Cierra el modal
      Swal.fire(
        "¡Guardado!",
        "La evaluación se ha guardado correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error al guardar la evaluación:", error);
      Swal.fire("Error", "No se pudo guardar la evaluación.", "error");
    }
  };

  const renderVista = () => {
    if (loading) {
      return <p className="p-4">Verificando permisos...</p>;
    }

    if (modoCreacion && esSecretario) {
      return (
        <>
          <CicloForm comunidadId={comunidadId} esSecretario={true} />
          <div className="p-4 text-center">
            <button
              className="btn-secondary"
              onClick={() => setModoCreacion(false)}
            >
              Ver Ciclo Activo
            </button>
          </div>
        </>
      );
    }

    switch (vistaActual) {
      case "ciclo":
        if (cicloActivo) {
          if (cicloActivo.estado === "activo") {
            return (
              <div>
                <CicloActivoVista
                  ciclo={cicloActivo}
                  onEvaluar={setEvaluandoCiclo}
                />
                {esSecretario && (
                  <div className="p-4 text-center border-t mt-4">
                    <button
                      className="btn-primary"
                      onClick={() => setModoCreacion(true)}
                    >
                      Crear Nuevo Ciclo
                    </button>
                  </div>
                )}
              </div>
            );
          }

          if (cicloActivo.estado === "en_votacion") {
            if (cargandoVoto) {
              return (
                <p className="p-4 text-center">
                  Verificando tu estado de votación...
                </p>
              );
            }
            if (miVoto) {
              return (
                <div className="p-8 text-center bg-blue-50 border border-blue-200 rounded-lg m-4">
                  <h3 className="text-xl font-bold text-blue-800">
                    ¡Gracias por tu voto!
                  </h3>
                  <p className="text-blue-700 mt-2">
                    Esperando que el resto de la comunidad vote. El resultado se
                    mostrará aquí cuando la votación finalice.
                  </p>
                </div>
              );
            }
            return (
              <div className="p-4 md:p-8">
                <VotarCiclo
                  ciclo={cicloActivo}
                  comunidadNombre={comunidadNombre}
                  miembrosNombres={miembrosNombres}
                />
              </div>
            );
          }
        }

        if (esSecretario) {
          return <CicloForm comunidadId={comunidadId} esSecretario={true} />;
        }

        return (
          <div className="p-4 text-center text-gray-500">
            <h2 className="font-bold text-lg">Ciclo de Programa</h2>
            <p>Actualmente no hay ningún ciclo activo o en votación.</p>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2>
              {vistaActual.charAt(0).toUpperCase() + vistaActual.slice(1)}
            </h2>
            <p>Módulo próximamente.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-fondo-claro min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={comunidadIcon}
            alt="Icono de Comunidad"
            className="w-12 h-12"
          />
          <h1 className="text-3xl font-bold text-morado-principal">
            Consejo de Comunidad
          </h1>
        </div>
        <SubMenu />
        <div className="bg-white rounded-lg shadow-md min-h-[300px]">
          {renderVista()}
        </div>
      </main>

      {evaluandoCiclo && (
        <EvaluacionCiclo
          ciclo={evaluandoCiclo}
          onClose={() => setEvaluandoCiclo(null)}
          onSave={handleSaveEvaluacion}
        />
      )}
    </div>
  );
}
