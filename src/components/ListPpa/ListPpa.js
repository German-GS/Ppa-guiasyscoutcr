import React, { useState, useEffect } from "react";
// ▼▼▼ 1. IMPORTAR deletePpa Y Swal ▼▼▼
import { onGetPpas, deletePpa } from "../../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { Ppa } from "../../components/PPA/Ppa";
import { EvaluacionPpa } from "../EvaluacionPpa/EvaluacionPpa";
import { useAuth } from "../../context/authContext";

const toJavaScriptDate = (dateValue) => {
  if (!dateValue) return null;
  if (typeof dateValue.toDate === "function") return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) return d;
  return null;
};

export function ListPpa({ onEditPpa }) {
  const { user } = useAuth();
  const [realtimePpaData, setRealtimePpaData] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [evalModalIsOpen, setEvalModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsubscribe = onGetPpas(
      user.uid,
      (ppasFromFirebase) => {
        const sortedData = ppasFromFirebase.sort(
          (a, b) =>
            (toJavaScriptDate(b.createdAt)?.getTime() || 0) -
            (toJavaScriptDate(a.createdAt)?.getTime() || 0)
        );
        setRealtimePpaData(sortedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error en listener:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe?.();
  }, [user?.uid]);

  // ▼▼▼ 2. AÑADIR LA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN ▼▼▼
  const handleDeletePpa = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡elimínalo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deletePpa(id);
        Swal.fire("¡Eliminado!", "El PPA ha sido eliminado.", "success");
      } catch (error) {
        Swal.fire("Error", "Ocurrió un error al eliminar el PPA.", "error");
      }
    }
  };

  const openViewModal = (ppa) => {
    setSelectedPpa(ppa);
    setViewModalIsOpen(true);
  };
  const closeViewModal = () => setViewModalIsOpen(false);
  const openEvalModal = (ppa) => {
    setSelectedPpa(ppa);
    setEvalModalIsOpen(true);
  };
  const closeEvalModal = () => setEvalModalIsOpen(false);

  const getVencimientoInfo = (ppa) => {
    if (ppa.estado === "evaluado")
      return {
        text: "Evaluado",
        style: "bg-gray-200 text-gray-800",
        status: "evaluado",
      };
    const fechaVigencia = toJavaScriptDate(ppa.fechaDeVigencia);
    if (!fechaVigencia)
      return {
        text: "Sin Vigencia",
        style: "bg-gray-200 text-gray-800",
        status: "activo",
      };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVigencia.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (fechaVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return {
        text: `Vencido hace ${Math.abs(diffDays)} días`,
        style: "bg-red-100 text-red-800",
        status: "vencido",
      };
    if (diffDays === 0)
      return {
        text: "Vence hoy",
        style: "bg-yellow-100 text-yellow-800 font-bold",
        status: "activo",
      };
    if (diffDays <= 15)
      return {
        text: `Vence en ${diffDays} días`,
        style: "bg-yellow-100 text-yellow-800",
        status: "activo",
      };
    return {
      text: `Vence en ${diffDays} días`,
      style: "bg-green-100 text-green-800",
      status: "activo",
    };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout"></div>
      </div>
    );

  return (
    <>
      <div className="space-y-4">
        {realtimePpaData.map((ppa) => {
          const vencimiento = getVencimientoInfo(ppa);
          const fechaCreacion = toJavaScriptDate(ppa.createdAt);
          return (
            <div
              key={ppa.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <p className="font-bold text-lg text-scout">
                  PPA Creado:{" "}
                  {fechaCreacion ? fechaCreacion.toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${vencimiento.style}`}
                >
                  {vencimiento.text}
                </span>
                {vencimiento.status === "vencido" && (
                  <button
                    onClick={() => openEvalModal(ppa)}
                    className="btn-warning"
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    Evaluar PPA
                  </button>
                )}
                {vencimiento.status === "activo" && (
                  <>
                    <button
                      onClick={() => openViewModal(ppa)}
                      className="btn-secondary"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => onEditPpa(ppa)}
                      className="btn-primary"
                      style={{ width: "auto", padding: "0.5rem 1rem" }}
                    >
                      Modificar
                    </button>
                    {/* ▼▼▼ 3. AÑADIR EL BOTÓN DE ELIMINAR AQUÍ ▼▼▼ */}
                    <button
                      onClick={() => handleDeletePpa(ppa.id)}
                      className="bg-red-500 text-white font-semibold py-1 px-4 text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {vencimiento.status === "evaluado" && (
                  <button
                    onClick={() => openViewModal(ppa)}
                    className="btn-secondary"
                  >
                    Evaluado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={viewModalIsOpen}
        onRequestClose={closeViewModal}
        contentLabel="Detalles del PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70"
      >
        {selectedPpa && (
          <Ppa
            selectedPpa={selectedPpa}
            closeModal={closeViewModal}
            onEdit={onEditPpa}
          />
        )}
      </Modal>

      <Modal
        isOpen={evalModalIsOpen}
        onRequestClose={closeEvalModal}
        contentLabel="Evaluación de PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70"
      >
        {selectedPpa && (
          <EvaluacionPpa ppaToEvaluate={selectedPpa} onClose={closeEvalModal} />
        )}
      </Modal>
    </>
  );
}
