import React, { useState, useEffect } from "react";
import { onGetPpas, deletePpa } from "../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { Ppa } from "./Ppa";
import { formatDateTime } from "../utils/dateUtils";
import { useAuth } from "../context/authContext";

export function ListPpa({ onEditPpa }) {
  const { user } = useAuth();
  const [realtimePpaData, setRealtimePpaData] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPpa(null);
  };

  const handleEditPpa = (ppa) => {
    closeModal();
    onEditPpa(ppa);
  };

  const eliminarPpa = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      });

      if (result.isConfirmed) {
        await deletePpa(id);
        Swal.fire('¡Eliminado!', 'Tu PPA ha sido eliminado.', 'success');
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire('Error', 'Ocurrió un problema al eliminar el PPA', 'error');
    }
  };

  const openModal = (ppa) => {
    setSelectedPpa(ppa);
    setModalIsOpen(true);
  };

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);

    const unsubscribe = onGetPpas(user.uid, (ppas) => {
      const sortedData = ppas.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });

      setRealtimePpaData(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Error en listener:", error);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout"></div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold text-center text-scout mt-6 mb-4">PPA's Registrados</h1>

      {realtimePpaData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay PPAs registrados aún
        </div>
      ) : (
        <div className="space-y-4">
          {realtimePpaData.map((ppa, index) => (
            <div
              key={ppa.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="mb-4 md:mb-0">
                <p className="font-semibold text-gray-800">{index + 1}. Fecha de Creación:</p>
                <p>{formatDateTime(ppa.createdAt)}</p>
                {ppa.modifiedAt && (
                  <p className="text-xs text-gray-500">Modificado: {formatDateTime(ppa.modifiedAt)}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => openModal(ppa)}
                  className="btn-scout-red text-white px-4 py-2 rounded-lg hover:bg-[#FFA400] transition-colors"
                >
                  Ver Detalles
                </button>
                <button
                  onClick={() => eliminarPpa(ppa.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        {selectedPpa && (
          <Ppa
            selectedPpa={selectedPpa}
            closeModal={closeModal}
            onEdit={handleEditPpa}
          />
        )}
      </Modal>
    </div>
  );
}
