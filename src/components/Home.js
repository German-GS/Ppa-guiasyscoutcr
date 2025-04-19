import React, { useState, useRef, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, analytics } from "../firebase";
import { useAuth } from "../context/authContext";
import { Navbar } from "./Navbar";
import { ListPpa } from "./ListPpa";
import { InputForm } from "./InputForm";
import { savePpa, updatePpa, onPpaUpdate } from "../firebase";
import { Agendar } from "./Agendar";
import Swal from "sweetalert2";
import "../App.css";

export function Home() {
  const { loading, user } = useAuth();
  const [ppaData, setPpaData] = useState({
    suenos: [],
    retos: [],
    fortalezas: [],
    corporabilidad: [],
    creatividad: [],
    afectividad: [],
    espiritualidad: [],
    caracter: [],
    sociabilidad: [],
    actividad: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPpaId, setCurrentPpaId] = useState(null);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const registerButtonRef = useRef(null);

  // Cargar PPA para edición
  const loadPpaForEditing = async (ppa) => {
    try {
      const docRef = doc(db, 'PPA', ppa.id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        throw new Error("El PPA no existe");
      }
  
      const freshData = docSnap.data();
      setPpaData(freshData);
      setIsEditing(true);
      setCurrentPpaId(ppa.id);
    } catch (error) {
      console.error("Error cargando PPA:", error);
      Swal.fire("Error", "No se pudo cargar el PPA para edición", "error");
    }
  };

  // Escuchar actualizaciones en tiempo real
  useEffect(() => {
    if (!selectedPpa?.id) return;

    const unsubscribe = onPpaUpdate(selectedPpa.id, (updatedPpa) => {
      setPpaData(updatedPpa);
    });

    return () => unsubscribe();
  }, [selectedPpa?.id]);

  // Manejar guardado del PPA
  const handleSavePpa = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
  
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

  const handleInputChange = (key, data) => {
    console.log(`Recibiendo ${key}:`, data); // Para depuración
    setPpaData(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const handleActivityChange = (activities) => {
    setPpaData(prev => ({
      ...prev,
      actividad: activities
    }));
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
        <h1 className="text-3xl font-bold mb-5 mt-5 text-scout">
          {isEditing ? "Modificar PPA" : "Mi PPA"}
        </h1>
        
        {isEditing && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            Estás modificando un PPA existente. Los cambios se guardarán sobre este PPA.
          </div>
        )}
        
        <hr className="mb-6 border-gray-200" />

        <form id="ppa-form" onSubmit={handleSavePpa} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1 */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Sueños</h2>
                <InputForm 
                  placeholder="Ej: Liderar una expedición scout"
                  onSave={(data) => handleInputChange("suenos", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.suenos}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Corporabilidad</h2>
                <InputForm
                  placeholder="Ej: Correr 5km sin parar"
                  onSave={(data) => handleInputChange("corporabilidad", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.corporabilidad}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Espiritualidad</h2>
                <InputForm
                  placeholder="Ej: Meditar 10 minutos diarios"
                  onSave={(data) => handleInputChange("espiritualidad", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.espiritualidad}
                />
              </div>
            </div>

            {/* Columna 2 */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Retos</h2>
                <InputForm
                  placeholder="Ej: Aprender a hacer nudos avanzados"
                  onSave={(data) => handleInputChange("retos", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.retos}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Creatividad</h2>
                <InputForm
                  placeholder="Ej: Diseñar un nuevo juego scout"
                  onSave={(data) => handleInputChange("creatividad", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.creatividad}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Carácter</h2>
                <InputForm
                  placeholder="Ej: Controlar mi temperamento"
                  onSave={(data) => handleInputChange("caracter", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.caracter}
                />
              </div>
            </div>

            {/* Columna 3 */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Mis Fortalezas</h2>
                <InputForm
                  placeholder="Ej: Buen trabajo en equipo"
                  onSave={(data) => handleInputChange("fortalezas", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.fortalezas}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Afectividad</h2>
                <InputForm
                  placeholder="Ej: Expresar mis sentimientos"
                  onSave={(data) => handleInputChange("afectividad", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.afectividad}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Sociabilidad</h2>
                <InputForm
                  placeholder="Ej: Hacer 3 nuevos amigos"
                  onSave={(data) => handleInputChange("sociabilidad", data)}
                  addButtonClass="btn-scout-red text-white"
                  initialValues={ppaData.sociabilidad}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Mi Plan de Acción</h2>
            <hr className="mb-6 border-gray-200" />
            <Agendar
              onSave={handleActivityChange}
              initialData={ppaData.actividad || []}
            />
          </div>
          
          <div className="flex justify-center mt-10">
            <button
              ref={registerButtonRef}
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-scout text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-md hover:bg-[#FFA400] hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  {isEditing ? "Actualizando..." : "Registrando..."}
                </>
              ) : isEditing ? "Actualizar PPA" : "Registrar PPA"}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPpaId(null);
                  setPpaData({
                    suenos: [],
                    retos: [],
                    fortalezas: [],
                    corporabilidad: [],
                    creatividad: [],
                    afectividad: [],
                    espiritualidad: [],
                    caracter: [],
                    sociabilidad: [],
                    actividad: []
                  });
                }}
                className="ml-4 px-8 py-3 bg-gray-500 text-white font-medium rounded-lg transition-colors hover:bg-gray-600"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
        
        <div id="ppa-list" className="mt-16">
          <hr className="mb-6 border-gray-200" />
          <h2 className="text-2xl font-bold mb-4 text-scout">Mis Progresos</h2>
          <ListPpa onEditPpa={loadPpaForEditing} />
        </div>
      </div>
    </div>
  );
}