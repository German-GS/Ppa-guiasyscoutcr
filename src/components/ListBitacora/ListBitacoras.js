// en: src/components/ListBitacora/ListBitacoras.js (Versión Final Corregida)

import React, { useState, useEffect } from "react";
import { onGetPpas, deletePpa } from "../../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { BitacoraDetalle } from "../Bitacora/BitacoraDetalle";
import { useAuth } from "../../context/authContext";
import { Book, Edit, Trash2 } from "lucide-react";

const toJavaScriptDate = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue.toDate) return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  return new Date(dateValue);
};

export function ListBitacoras({ onEditBitacora }) {
  const { user } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  const [selectedBitacora, setSelectedBitacora] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsubscribe = onGetPpas(
      user.uid,
      (dataFromFirebase) => {
        const sortedData = dataFromFirebase.sort(
          (a, b) =>
            (toJavaScriptDate(b.createdAt)?.getTime() || 0) -
            (toJavaScriptDate(a.createdAt)?.getTime() || 0)
        );
        setBitacoras(sortedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error en listener de bitácoras:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe?.();
  }, [user?.uid]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Borrarás esta bitácora y todas sus reflexiones!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e67e22",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Sí, ¡bórrala!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deletePpa(id);
        Swal.fire("¡Eliminada!", "La bitácora ha sido eliminada.", "success");
      } catch (error) {
        Swal.fire(
          "Error",
          "Ocurrió un error al eliminar la bitácora.",
          "error"
        );
      }
    }
  };

  const openViewModal = (bitacora) => {
    setSelectedBitacora(bitacora);
    setViewModalIsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-principal"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bitacoras.map((bitacora) => {
          const fechaCreacion = toJavaScriptDate(bitacora.createdAt);
          return (
            <div
              key={bitacora.id}
              className="p-4 bg-white border border-borde rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <p className="font-bold text-lg text-principal">
                  {bitacora.titulo || "Bitácora de Reflexión"}
                </p>
                <p className="text-sm text-texto-secundario">
                  Creada el:{" "}
                  {fechaCreacion ? fechaCreacion.toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openViewModal(bitacora)}
                  className="btn-secondary flex items-center gap-2"
                  style={{ width: "auto", padding: "0.5rem 1rem" }}
                >
                  <Book size={16} /> Ver
                </button>
                <button
                  onClick={() => onEditBitacora(bitacora)}
                  className="btn-primary flex items-center gap-2"
                  style={{ width: "auto", padding: "0.5rem 1rem" }}
                >
                  <Edit size={16} /> Modificar
                </button>
                <button
                  onClick={() => handleDelete(bitacora.id)}
                  className="bg-error text-grey font-semibold py-2 px-3 text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={viewModalIsOpen}
        onRequestClose={() => setViewModalIsOpen(false)}
        contentLabel="Detalles de la Bitácora"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70"
      >
        {selectedBitacora && (
          <BitacoraDetalle
            selectedPpa={selectedBitacora}
            closeModal={() => setViewModalIsOpen(false)}
            onEdit={onEditBitacora}
          />
        )}
      </Modal>
    </>
  );
}
