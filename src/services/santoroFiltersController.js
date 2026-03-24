import { API_ENDPOINTS } from "./apiEndpoints";
import { axiosInstance } from "./axiosConfig";


const STAT_FIELDS = [
  'topEventTypes',
  'outcomes',
  'severities',
  'statuses',
  'topTags',
  'topLocations',
  'topActors',
  'environments',
];

/**
 * Obtiene todos los `value` agrupados por campo del dashboard stats.
 * @param {string} system - Nombre del sistema (ej: "LECTOR BIOMETRICO")
 * @returns {Promise<Object>} Objeto con los values extraídos por campo
 */
async function getDashboardStatsValues(system) {

  const response = await axiosInstance.get(`${API_ENDPOINTS.LOGS_STATS}?system=${system}`);

  const { data } = response;

  if (!data.ok) {
    throw new Error(`Error al obtener dashboard stats: ${response.status}`);
  }

  return extractValues(data.data);
}

/**
 * Extrae los `value` de cada campo StatItem[].
 * @param {Object} data
 * @returns {Object}
 */
function extractValues(data) {
  return STAT_FIELDS.reduce((acc, field) => {
    acc[field] = (data[field] ?? []).map((item) => item.value);
    return acc;
  }, {});
}

export {
  getDashboardStatsValues
}
