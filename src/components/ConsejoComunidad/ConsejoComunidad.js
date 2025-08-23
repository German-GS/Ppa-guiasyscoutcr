// src/components/ConsejoComunidad/ConsejoComunidad.js
import React, { useState, useEffect } from "react";
import { Navbar } from "../Navbar/Navbar";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";
import { useAuth } from "../../context/authContext";
import { db } from "../../firebase";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { CicloForm } from "../CicloPrograma/CicloForm";

export function ConsejoComunidad() {
  const { user } = useAuth();
  const [vistaActual, setVistaActual] = useState("ciclo");
  const [esSecretario, setEsSecretario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comunidadId, setComunidadId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const step = async (label, p) => {
      console.log("[Perms][TRY]", label);
      try {
        const r = await p;
        console.log("[Perms][OK ]", label);
        return r;
      } catch (e) {
        console.error("[Perms][ERR]", label, e);
        throw e;
      }
    };

    // Busca /consejeros/{cid}/protagonistas/{uid} por el campo uid
    async function encontrarConsejeroPorProtagonista(db, protagonistaUid) {
      const q = query(
        collectionGroup(db, "protagonistas"),
        where("uid", "==", protagonistaUid)
      );
      const snap = await step("CG protagonistas where uid==", getDocs(q));
      if (snap.empty) return null;
      return snap.docs[0].ref.parent.parent.id; // {cid}
    }

    const verificarRolDirecto = async () => {
      setLoading(true);
      try {
        const uid = user?.uid;
        if (!uid) throw new Error("No hay usuario autenticado");

        const userRef = doc(db, "users", uid);
        const userSnap = await step("get users/{uid}", getDoc(userRef));

        let flagSecretario = false;
        let idPerfil = null;

        if (userSnap.exists()) {
          const userData = userSnap.data();
          flagSecretario =
            (userData?.puesto || "").toLowerCase() === "secretario";
          idPerfil = (userData?.consejeroId || "").trim() || null;
        }

        // Validar idPerfil si existe
        let validoPorPerfil = false;
        if (idPerfil) {
          const consejeroSnap = await step(
            "get consejeros/{idPerfil}",
            getDoc(doc(db, "consejeros", idPerfil))
          );
          const comunidadSnap = await step(
            "get comunidades/{idPerfil}",
            getDoc(doc(db, "comunidades", idPerfil))
          );
          console.log("[check] existe consejero?", consejeroSnap.exists());
          console.log("[check] existe comunidad?", comunidadSnap.exists());
          validoPorPerfil = consejeroSnap.exists() && comunidadSnap.exists();

          if (validoPorPerfil) {
            setComunidadId(idPerfil);
            setEsSecretario(flagSecretario);
            setLoading(false);
            return; // evita usar collectionGroup innecesariamente
          }
        } // <-- Cierra el if (idPerfil)

        // Fallback por collectionGroup
        let idResuelto = idPerfil;
        if (!validoPorPerfil) {
          const cid = await encontrarConsejeroPorProtagonista(db, uid);
          if (cid) {
            idResuelto = cid;
            try {
              await step(
                "update users/{uid}.consejeroId",
                updateDoc(userRef, { consejeroId: cid })
              );
            } catch (e) {
              console.warn(
                "[ConsejoComunidad] No se pudo actualizar el perfil:",
                e?.message
              );
            }
          } else {
            idResuelto = idPerfil || uid;
          }
        }

        console.log("[ConsejoComunidad] uid:", uid);
        console.log("[ConsejoComunidad] consejeroId en perfil:", idPerfil);
        console.log("[ConsejoComunidad] comunidadId final usado:", idResuelto);

        setEsSecretario(flagSecretario);
        setComunidadId(idResuelto);
      } catch (err) {
        console.error("Error al verificar el rol:", err);
        if (user?.uid) setComunidadId(user.uid);
      } finally {
        setLoading(false);
      }
    };

    verificarRolDirecto(); // ✅ no olvides invocarla
  }, [user]);

  // ... (El resto del componente (SubMenu, renderVista, JSX) se mantiene exactamente igual)
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

  const renderVista = () => {
    if (loading) {
      return <p className="p-4">Verificando permisos...</p>;
    }
    switch (vistaActual) {
      case "ciclo":
        return esSecretario ? (
          <CicloForm comunidadId={comunidadId} />
        ) : (
          <div className="p-4">
            <h2>Ciclo de Programa</h2>
            <p>
              Aquí podrás ver el ciclo de programa una vez que sea aprobado.
            </p>
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
    </div>
  );
}
