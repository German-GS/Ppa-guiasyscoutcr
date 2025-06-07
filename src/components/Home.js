import React, { useState, useRef, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, analytics } from "../firebase";
import { useAuth } from "../context/authContext";
import { Navbar } from "./Navbar";
import { ListPpa } from "./ListPpa";
import { InputForm } from "./InputForm";
import { savePpa, updatePpa, onPpaUpdate } from "../firebase";
import { Agendar } from "./Agendar";
import Swal from "sweetalert2";
import "../App.css";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";


export function Home() {
  const { loading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPpaId, setCurrentPpaId] = useState(null);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const registerButtonRef = useRef(null);
  console.log("Usuario autenticado:", user);

  const refs = {
    suenos: useRef(),
    retos: useRef(),
    fortalezas: useRef(),
    corporabilidad: useRef(),
    creatividad: useRef(),
    afectividad: useRef(),
    espiritualidad: useRef(),
    caracter: useRef(),
    sociabilidad: useRef(),
    actividad: useRef()
  };

  const fieldTitles = {
    suenos: "Sueños",
    retos: "Retos",
    fortalezas: "Fortalezas",
    corporabilidad: "Corporabilidad",
    creatividad: "Creatividad",
    afectividad: "Afectividad",
    espiritualidad: "Espiritualidad",
    caracter: "Carácter",
    sociabilidad: "Sociabilidad"
  };

  const fieldPlaceholders = {
    suenos: "Ej: Liderar una expedición scout",
    retos: "Ej: Aprender a hacer nudos avanzados",
    fortalezas: "Ej: Buen trabajo en equipo",
    corporabilidad: "Ej: Correr 5km sin parar",
    creatividad: "Ej: Diseñar un nuevo juego scout",
    afectividad: "Ej: Expresar mis sentimientos",
    espiritualidad: "Ej: Meditar 10 minutos diarios",
    caracter: "Ej: Controlar mi temperamento",
    sociabilidad: "Ej: Hacer 3 nuevos amigos"
  };

  const loadPpaForEditing = async (ppa) => {
    try {
      const docRef = doc(db, 'PPA', ppa.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("El PPA no existe");

      const freshData = docSnap.data();
      setIsEditing(true);
      setCurrentPpaId(ppa.id);

      Object.entries(refs).forEach(([key, ref]) => {
        if (ref.current && typeof ref.current.setInputs === "function") {
          ref.current.setInputs(freshData[key] || []);
        }
        if (ref.current && typeof ref.current.setValues === "function") {
          ref.current.setValues(freshData[key] || []);
        }
      });
    } catch (error) {
      console.error("Error cargando PPA:", error);
      Swal.fire("Error", "No se pudo cargar el PPA para edición", "error");
    }
  };

useEffect(() => {
  const inicializarPerfil = async () => {
    if (!user?.uid) {
      console.log("Usuario no autenticado");
      return;
    }

    console.log("Iniciando verificación de primer inicio para:", user.uid);

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("Documento de usuario no existe");
        return;
      }

      const userData = userSnap.data();
      console.log("Datos actuales del usuario:", userData);

      // Verificar si es el primer inicio
      if (userData.primerInicioSesion === false || userData.primerInicioSesion === undefined) {
        console.log("Primer inicio detectado, inicializando...");

        // Transacción para asegurar consistencia
        try {
          // 1. Actualizar marca de primer inicio
          await updateDoc(userRef, {
            primerInicioSesion: true,
            ultimoInicio: new Date()
          });

          // 2. Crear documento de notificaciones
          const notiRef = doc(db, "notificaciones", user.uid);
          await setDoc(notiRef, {
            notificaciones: [],
            creadoEn: new Date(),
            userId: user.uid
          });

          console.log("✅ Perfil inicializado correctamente");
        } catch (updateError) {
          console.error("Error en transacción:", updateError);
          throw updateError;
        }
      } else {
        console.log("No es primer inicio");
      }
    } catch (error) {
      console.error("❌ Error crítico en inicialización:", error);
      
      // Mostrar error específico al usuario
      let errorMessage = "Error al inicializar perfil";
      if (error.code === 'permission-denied') {
        errorMessage = "No tienes permisos para esta acción";
      } else if (error.code === 'not-found') {
        errorMessage = "Tu perfil no fue encontrado";
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error"
      });
    }
  };

  inicializarPerfil();
}, [user?.uid]);

  const handleSavePpa = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const ppaData = {};
    Object.entries(refs).forEach(([key, ref]) => {
      if (ref.current && typeof ref.current.getValues === "function") {
        ppaData[key] = ref.current.getValues();
      }
    });

    try {
      if (isEditing) {
        await updatePpa(currentPpaId, ppaData);
        Swal.fire("¡Actualizado!", "Tu PPA se ha actualizado correctamente.", "success");
      } else {
        const result = await savePpa(ppaData);
        setCurrentPpaId(result.id);
        setIsEditing(true);
        Swal.fire("¡Éxito!", "Tu PPA se ha registrado correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire("Error", error.message || "Ocurrió un error al guardar", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout"></div>
    </div>
  );

  return (
    <div className="bg-white text-gray-800 w-full lg:mb-0 mb-4">
      <Navbar />
      <div className="max-w-screen-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-6 mt-5">
          <h1 className="text-3xl font-bold text-scout">
            {isEditing ? "Modificar PPA" : "Mi PPA"}
          </h1>
          <img src={comunidadIcon} alt="Comunidad" className="w-12 h-12 ml-4" />
        </div>

        <form id="ppa-form" onSubmit={handleSavePpa} className="space-y-12 bg-white shadow-md rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(refs).filter(([key]) => key !== "actividad").map(([key, ref]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-scout mb-3 border-b border-gray-300 pb-2">{fieldTitles[key]}</h2>
                <InputForm ref={ref} placeholder={fieldPlaceholders[key]} />
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-scout mb-4">Mi Plan de Acción</h2>
            <Agendar ref={refs.actividad} initialData={[]} />
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
            <button
              ref={registerButtonRef}
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-scout text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-md hover:bg-[#FFA400] hover:shadow-lg"
            >
              {isSubmitting ? (
                <><span className="inline-block animate-spin mr-2">↻</span>{isEditing ? "Actualizar..." : "Registrando..."}</>
              ) : isEditing ? "Actualizar PPA" : "Registrar PPA"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPpaId(null);
                  Object.values(refs).forEach(ref => {
                    if (ref.current?.setInputs) ref.current.setInputs([{ id: Date.now(), value: "" }]);
                    if (ref.current?.setValues) ref.current.setValues([]);
                  });
                }}
                className="px-8 py-3 bg-gray-500 text-white font-medium rounded-lg transition-colors hover:bg-gray-600"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>

        <div id="ppa-list" className="mt-16">
          <hr className="mb-6 border-gray-200" />
          <h2 className="text-2xl font-bold mb-4 text-scout text-center">Mis Progresos</h2>
          <ListPpa onEditPpa={loadPpaForEditing} />
        </div>
      </div>

      <footer className="bg-scout text-white text-center py-4 mt-10">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            Herramienta Digital de PPA    ·     Desarrollado por German García Siles     ·    &copy; 2025 v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}

