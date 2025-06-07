export const formatDateTime = (date) => {
    if (!date) return "No especificada";
    
    try {
      // Si es un Timestamp de Firebase
      if (typeof date === 'object' && 'toDate' in date) {
        return date.toDate().toLocaleString();
      }
      // Si ya es un Date
      if (date instanceof Date) {
        return date.toLocaleString();
      }
      // Si es un string ISO
      if (typeof date === 'string') {
        return new Date(date).toLocaleString();
      }
      return "Formato desconocido";
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };