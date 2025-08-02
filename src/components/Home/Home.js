import React, { useState, useRef, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/authContext";
import { Navbar } from "../Navbar";
import { ListPpa } from "../ListPpa/ListPpa";
import { InputForm } from "../InputForm/InputForm";
import { savePpa, updatePpa } from "../../firebase";
import { Agendar } from "../Agendar/Agendar";
import Swal from "sweetalert2";
import Modal from "react-modal";
import "../../index.css";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";
import { BrujulaCrecimiento } from "../AreasCrecimiento/AreasCrecimiento";

export function Home() {
  const { loading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPpaId, setCurrentPpaId] = useState(null);
  const [perfilInicializado, setPerfilInicializado] = useState(false);
  const [durationModalIsOpen, setDurationModalIsOpen] = useState(false);
  const [pendingPpaData, setPendingPpaData] = useState(null);
  const [customDate, setCustomDate] = useState("");

  const refs = {
    suenos: useRef(),
    retos: useRef(),
    fortalezas: useRef(),
    brujula: useRef(),
    actividad: useRef(),
  };

  const fieldTitles = {
    suenos: "Sueños",
    retos: "Retos",
    fortalezas: "Fortalezas",
  };

  const fieldPlaceholders = {
    suenos: "Ej: Liderar una expedición scout",
    retos: "Ej: Aprender a hacer nudos avanzados",
    fortalezas: "Ej: Buen trabajo en equipo",
  };

  const loadPpaForEditing = async (ppa) => {
    try {
      const docRef = doc(db, "PPA", ppa.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("El PPA no existe");
      const freshData = docSnap.data();
      setIsEditing(true);
      setCurrentPpaId(ppa.id);
      refs.suenos.current?.setInputs(freshData.suenos || []);
      refs.retos.current?.setInputs(freshData.retos || []);
      refs.fortalezas.current?.setInputs(freshData.fortalezas || []);
      refs.actividad.current?.setValues(freshData.actividad || []);
      refs.brujula.current?.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar el PPA para edición", "error");
    }
  };

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

  const handleSavePpa = async (event) => {
    event.preventDefault();
    const getValuesFromRef = (ref) => {
      return ref.current?.getValues ? ref.current.getValues() : [];
    };
    const ppaDataBase = {
      suenos: getValuesFromRef(refs.suenos),
      retos: getValuesFromRef(refs.retos),
      fortalezas: getValuesFromRef(refs.fortalezas),
      actividad: getValuesFromRef(refs.actividad),
    };
    const brujulaObjectives = getValuesFromRef(refs.brujula);
    const finalPpaData = {
      ...ppaDataBase,
      ...brujulaObjectives,
      userId: user.uid,
    };
    if (isEditing) {
      setIsSubmitting(true);
      try {
        await updatePpa(currentPpaId, finalPpaData);
        Swal.fire(
          "¡Actualizado!",
          "Tu PPA se ha actualizado correctamente.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error",
          error.message || "Ocurrió un error al actualizar",
          "error"
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setPendingPpaData(finalPpaData);
      setDurationModalIsOpen(true);
    }
  };

  // ▼▼▼ FUNCIÓN DE CONFIRMACIÓN MODIFICADA CON VALIDACIÓN ▼▼▼
  const handleConfirmAndSave = async ({ months, date }) => {
    if (!pendingPpaData) return;

    let fechaDeVigencia;

    if (date) {
      // --- 1. Verificación de la fecha manual ---
      const today = new Date();
      // Ajustamos 'hoy' para que represente el inicio del día (medianoche)
      today.setHours(0, 0, 0, 0);

      // El input de fecha devuelve un string "YYYY-MM-DD". Al pasarlo a new Date(),
      // puede interpretarlo como UTC. Para evitar problemas de zona horaria,
      // creamos la fecha de una manera que respete la zona horaria local.
      const dateParts = date.split("-");
      const selectedDate = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2]
      );

      if (selectedDate < today) {
        Swal.fire(
          "Fecha inválida",
          "No puedes seleccionar una fecha anterior a hoy.",
          "error"
        );
        return; // Detiene la ejecución
      }
      fechaDeVigencia = selectedDate;
    } else if (months) {
      fechaDeVigencia = new Date();
      fechaDeVigencia.setMonth(fechaDeVigencia.getMonth() + months);
    } else {
      Swal.fire(
        "Atención",
        "Por favor, selecciona una fecha límite.",
        "warning"
      );
      return;
    }

    setDurationModalIsOpen(false);
    setIsSubmitting(true);

    const finalPpaDataWithDate = {
      ...pendingPpaData,
      fechaDeVigencia: fechaDeVigencia,
    };

    try {
      const result = await savePpa(finalPpaDataWithDate);
      setCurrentPpaId(result.id);
      setIsEditing(true);
      Swal.fire("¡Éxito!", "Tu PPA se ha registrado correctamente.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Ocurrió un error al guardar",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setPendingPpaData(null);
      setCustomDate("");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentPpaId(null);
    refs.suenos.current?.setInputs([]);
    refs.retos.current?.setInputs([]);
    refs.fortalezas.current?.setInputs([]);
    refs.actividad.current?.setValues([]);
    refs.brujula.current?.reset();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout"></div>
      </div>
    );
  }

  // --- 2. Variable para obtener la fecha de hoy en formato YYYY-MM-DD ---
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white text-gray-800 w-full">
      <Navbar />
      <div className="max-w-screen-lg mx-auto p-4">
        {/* ... (resto del JSX sin cambios hasta el modal) ... */}

        <div className="flex items-center justify-between mb-6 mt-5">
          <h1 className="text-3xl font-bold text-scout">
            {isEditing ? "Modificar mi PPA" : "Crear mi PPA"}
          </h1>
          <img src={comunidadIcon} alt="Comunidad" className="w-12 h-12 ml-4" />
        </div>

        <div className="space-y-12">
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {["suenos", "retos", "fortalezas"].map((key) => (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <h2 className="text-lg font-bold text-scout mb-3 border-b border-gray-300 pb-2">
                    {fieldTitles[key]}
                  </h2>
                  <InputForm
                    ref={refs[key]}
                    placeholder={fieldPlaceholders[key]}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <BrujulaCrecimiento ref={refs.brujula} />
          </div>
        </div>

        <form
          id="ppa-form"
          onSubmit={handleSavePpa}
          className="mt-12 space-y-12 bg-white shadow-lg rounded-xl p-6 border"
        >
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-scout mb-4">
              Mi Plan de Acción
            </h2>
            <Agendar ref={refs.actividad} initialData={[]} />
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full md:w-auto px-8 py-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  {isEditing ? "Actualizando..." : "Registrando..."}
                </>
              ) : isEditing ? (
                "Actualizar PPA"
              ) : (
                "Registrar PPA"
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 bg-gray-500 text-white font-medium rounded-lg transition-colors hover:bg-gray-600"
              >
                Crear un PPA Nuevo
              </button>
            )}
          </div>
        </form>

        <div id="ppa-list" className="mt-16">
          <hr className="mb-6 border-gray-300" />
          <h2 className="text-2xl font-bold mb-4 text-scout text-center">
            Mis Progresos
          </h2>
          <ListPpa onEditPpa={loadPpaForEditing} />
        </div>
      </div>

      <Modal
        isOpen={durationModalIsOpen}
        onRequestClose={() => setDurationModalIsOpen(false)}
        contentLabel="Definir Vigencia del PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60"
      >
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-scout mb-6">
            Define la Vigencia de tu PPA
          </h2>
          <p className="text-gray-600 mb-8">
            Selecciona una duración o establece una fecha límite para tu Plan.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => handleConfirmAndSave({ months: 2 })}
              className="w-full btn-primary"
            >
              Bimestral (2 meses)
            </button>
            <button
              onClick={() => handleConfirmAndSave({ months: 4 })}
              className="w-full btn-primary"
            >
              Cuatrimestral (4 meses)
            </button>
            <button
              onClick={() => handleConfirmAndSave({ months: 6 })}
              className="w-full btn-primary"
            >
              Semestral (6 meses)
            </button>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="flex-shrink mx-4 text-gray-400">O</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDate}
                min={todayString} // <-- 3. Atributo min añadido
                onChange={(e) => setCustomDate(e.target.value)}
                className="border-input flex-grow"
              />
              <button
                onClick={() => handleConfirmAndSave({ date: customDate })}
                className="btn-secondary flex-shrink-0"
                style={{ padding: "0.625rem" }}
              >
                Fijar
              </button>
            </div>

            <button
              onClick={() => setDurationModalIsOpen(false)}
              className="w-full mt-6 text-gray-500 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
      <footer className="bg-scout text-white text-center py-4 mt-10">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            Herramienta Digital de PPA · Desarrollado por German García Siles ·
            &copy; 2025 v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
