// en: src/components/Home/Home.js

import React, { useState, useRef, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, updatePpa, uploadFile } from "../../firebase";
import { useAuth } from "../../context/authContext";
import { Navbar } from "../Navbar/Navbar";
import { ListPpa } from "../ListPpa/ListPpa";
import Swal from "sweetalert2";
import "../../index.css";
import comunidadIcon from "../../img/Raiders.conFondo.png";
import { BrujulaForm } from "./BrujulaForm";
import { BitacoraExplorador } from "../BitacoraExplorador/BitacoraExplorador";

export function Home() {
  const { loading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBitacoraId, setCurrentBitacoraId] = useState(null);
  const [currentEntradaId, setCurrentEntradaId] = useState(null);
  const [perfilInicializado, setPerfilInicializado] = useState(false);
  const [initialBrujulaData, setInitialBrujulaData] = useState(null);
  const [initialBitacoraData, setInitialBitacoraData] = useState(null);

  const brujulaRef = useRef();
  const bitacoraRef = useRef();

  useEffect(() => {
    const inicializarPerfil = async () => {
      if (!user?.uid || perfilInicializado) return;
      setPerfilInicializado(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (
            userData.primerInicioSesion === false ||
            userData.primerInicioSesion === undefined
          ) {
            await updateDoc(userRef, {
              primerInicioSesion: true,
              ultimoInicio: new Date(),
            });
            const notiRef = doc(db, "notificaciones", user.uid);
            await setDoc(notiRef, {
              notificaciones: [],
              creadoEn: new Date(),
              userId: user.uid,
            });
          }
        }
      } catch (error) {
        console.error("❌ Error crítico en inicialización:", error);
      }
    };
    inicializarPerfil();
  }, [user?.uid, perfilInicializado]);

  const loadBitacoraForEditing = async (bitacora) => {
    try {
      const q = query(
        collection(db, "PPA", bitacora.id, "entradas"),
        orderBy("fecha", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty)
        throw new Error("Esta bitácora no tiene entradas para editar.");

      const ultimaEntrada = snapshot.docs[0];
      const data = ultimaEntrada.data();

      setIsEditing(true);
      setCurrentBitacoraId(bitacora.id);
      setCurrentEntradaId(ultimaEntrada.id);

      setInitialBrujulaData({
        autoconciencia: data.autoconciencia,
        autovaloracion: data.autovaloracion,
        autodireccion: data.autodireccion,
      });
      setInitialBitacoraData(data.bitacoraExplorador);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo cargar la bitácora para edición. " + error.message,
        "error"
      );
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const respuestasBrujula = brujulaRef.current?.getValues();
    const evaluacionBitacora = bitacoraRef.current?.getValues();

    if (!respuestasBrujula || !evaluacionBitacora) return;

    setIsSubmitting(true);

    const entradaData = {
      ...respuestasBrujula,
      bitacoraExplorador: evaluacionBitacora,
      fecha: serverTimestamp(),
      userId: user.uid,
    };

    try {
      if (isEditing) {
        const entradaRef = doc(
          db,
          "PPA",
          currentBitacoraId,
          "entradas",
          currentEntradaId
        );
        await updateDoc(entradaRef, entradaData);
        Swal.fire("¡Actualizada!", "Tu reflexión ha sido guardada.", "success");
      } else {
        const bitacoraRef = await addDoc(collection(db, "PPA"), {
          userId: user.uid,
          createdAt: serverTimestamp(),
          titulo: `Bitácora del ${new Date().toLocaleDateString()}`,
        });
        await addDoc(collection(bitacoraRef, "entradas"), entradaData);
        Swal.fire("¡Guardada!", "Tu nueva bitácora ha sido creada.", "success");
      }
      resetForm();
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo guardar tu reflexión. " + error.message,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarInforme = async ({
    desafioId,
    titulo,
    notas,
    archivo,
  }) => {
    if (!user || !currentBitacoraId || !currentEntradaId) {
      Swal.fire(
        "Error",
        "No se ha seleccionado una bitácora para editar.",
        "error"
      );
      return;
    }

    try {
      let imageUrl = "";
      if (archivo) {
        // Creamos una ruta única para el archivo
        const filePath = `informes/${
          user.uid
        }/${currentBitacoraId}/${Date.now()}_${archivo.name}`;
        imageUrl = await uploadFile(archivo, filePath);
      }

      const informeRef = doc(
        db,
        "PPA",
        currentBitacoraId,
        "entradas",
        currentEntradaId,
        "informes",
        desafioId
      );

      await setDoc(
        informeRef,
        {
          titulo,
          notas,
          imageUrl,
          completadoEn: serverTimestamp(),
        },
        { merge: true }
      );

      Swal.fire(
        "¡Informe Guardado!",
        "Tu avance en el desafío ha sido registrado.",
        "success"
      );
    } catch (error) {
      console.error("Error guardando el informe:", error);
      Swal.fire("Error", "No se pudo guardar tu informe.", "error");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentBitacoraId(null);
    setCurrentEntradaId(null);
    setInitialBrujulaData(null);
    setInitialBitacoraData(null);
  };

  if (loading) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  return (
    <div className="bg-fondo w-full min-h-screen">
      <Navbar />
      <div className="max-w-screen-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-6 mt-5">
          <h1 className="text-3xl font-bold text-principal">
            {isEditing
              ? "Editando mi Bitácora"
              : "Mi Brújula de Autodescubrimiento"}
          </h1>
          <img src={comunidadIcon} alt="Comunidad" className="w-12 h-12 ml-4" />
        </div>

        <div className="space-y-8">
          <BrujulaForm ref={brujulaRef} initialData={initialBrujulaData} />
          <BitacoraExplorador
            ref={bitacoraRef}
            initialData={initialBitacoraData}
          />
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="btn-primary w-full md:w-auto px-8 py-3 disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : isEditing
              ? "Actualizar Bitacora"
              : "Guardar Bitacora"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 bg-gray-500 text-white font-medium rounded-lg transition-colors hover:bg-gray-600"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <div id="ppa-list" className="mt-16">
          <hr className="mb-6 border-borde" />
          <h2 className="text-2xl font-bold mb-4 text-principal text-center">
            Mis Bitácoras Anteriores
          </h2>
          <ListPpa onEditPpa={loadBitacoraForEditing} />
        </div>
      </div>

      <footer className="bg-principal text-white text-center py-4 mt-10">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            Herramienta Digital · Desarrollado por German García Siles · &copy;
            2025
          </p>
        </div>
      </footer>
    </div>
  );
}
