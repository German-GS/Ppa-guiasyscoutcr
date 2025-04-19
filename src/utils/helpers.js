/**
 * utils/helpers.js
 * Utilidades para manejo seguro de datos
 */

/**
 * Convierte cualquier valor a un array seguro
 * @param {any} data - Datos a normalizar
 * @returns {Array} - Array seguro
 */
export const arraySafe = (data) => {
    if (data === null || data === undefined) return [];
    if (Array.isArray(data)) return [...data].filter(item => item != null && item !== '');
    if (typeof data === 'string') return [data].filter(item => item !== '');
    if (typeof data === 'object') return Object.values(data).filter(item => item != null);
    return [data].filter(item => item != null);
  };
  
  /**
   * Normaliza un objeto PPA para garantizar estructura consistente
   * @param {Object} ppa - Objeto PPA a normalizar
   * @returns {Object} - Objeto PPA normalizado
   */
  export const normalizePpa = (ppa) => {
    if (!ppa || typeof ppa !== 'object') return {
      suenos: [],
      retos: [],
      fortalezas: [],
      corporabilidad: [],
      creatividad: [],
      afectividad: [],
      espiritualidad: [],
      caracter: [],
      sociabilidad: [],
      actividad: [],
      userId: '',
      modifiedAt: new Date().toISOString()
    };
  
    return {
      suenos: arraySafe(ppa.suenos),
      retos: arraySafe(ppa.retos),
      fortalezas: arraySafe(ppa.fortalezas),
      corporabilidad: arraySafe(ppa.corporabilidad),
      creatividad: arraySafe(ppa.creatividad),
      afectividad: arraySafe(ppa.afectividad),
      espiritualidad: arraySafe(ppa.espiritualidad),
      caracter: arraySafe(ppa.caracter),
      sociabilidad: arraySafe(ppa.sociabilidad),
      actividad: ppa.actividad?.map(act => ({
        actividad: act.actividad || "",
        fecha: act.fecha || ""
      })) || [],
      userId: ppa.userId || '',
      modifiedAt: ppa.modifiedAt || new Date().toISOString()
    };
  };
  
  /**
   * Convierte un valor a string seguro
   * @param {any} value - Valor a convertir
   * @returns {string} - String seguro
   */
  export const safeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  /**
   * Valida si un objeto está vacío
   * @param {Object} obj - Objeto a validar
   * @returns {boolean} - True si está vacío
   */
  export const isEmptyObject = (obj) => {
    if (!obj || typeof obj !== 'object') return true;
    return Object.keys(obj).length === 0;
  };
  
  /**
   * Genera un ID único simple
   * @returns {string} - ID único
   */
  export const generateSimpleId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Función debounce para optimizar llamadas frecuentes
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} - Función debounceada
   */
  export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };
  
  export default {
    arraySafe,
    normalizePpa,
    safeString,
    isEmptyObject,
    generateSimpleId,
    debounce
  };