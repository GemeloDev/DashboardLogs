/**
 * Servicio de Usuarios
 * Gestión de usuarios del sistema
 */

import { axiosInstance } from './axiosConfig'
import { SERVER_CONFIG } from '../config/serverConfig'

/**
 * Obtiene la lista de usuarios con paginación
 * @param {number} page - Número de página (0-indexed)
 * @param {number} size - Tamaño de página
 * @param {string} search - Término de búsqueda (opcional)
 * @param {string} role - Filtro por rol (opcional)
 * @returns {Promise<Object>}
 */
export const getUsers = async (page = 0, size = 10, search = '', role = '') => {
  try {
    // 1) Descargar todo desde backend (solo page/size)
    const batchSize = 10; // ajusta (100/200/500) según performance
    let currentPage = 0;

    let total = null;
    let allUsers = [];

    while (true) {
      const resp = await axiosInstance.get(`${SERVER_CONFIG.BASE_URL}/core/users`, {
        params: { page: currentPage, size: batchSize }
      });

      // shape real:
      // resp.data.data = { page, size, total, data:[...] }
      const payload = resp?.data;
      const dataBlock = payload?.data || {};
      const users = Array.isArray(dataBlock?.data) ? dataBlock.data : [];
      const apiTotal = Number(dataBlock?.total ?? 0);

      if (total === null) total = apiTotal;

      allUsers = allUsers.concat(users);

      // stop cuando ya tenemos todo
      if (allUsers.length >= total) break;

      // seguridad extra por si algo raro pasa
      if (!users.length) break;

      currentPage += 1;
    }

    // 2) Filtrar en FRONT (search + role)
    const s = String(search || '').trim().toLowerCase();
    const r = String(role || '').trim().toLowerCase();

    const filtered = allUsers.filter((u) => {
      const haystack = [
        u?.name,
        u?.email,
        u?.status,
        u?.id
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = s ? haystack.includes(s) : true;

      const roles = Array.isArray(u?.roles)
        ? u.roles.map(x => String(x).toLowerCase())
        : [];

      const matchRole = r ? roles.includes(r) : true;

      return matchSearch && matchRole;
    });

    // 3) Paginar el resultado filtrado (para UI)
    const start = page * size;
    const end = start + size;
    const paged = filtered.slice(start, end);

    // 4) Regresar con el MISMO formato del backend (pero ya filtrado)
    return {
      ok: true,
      code: 'ok',
      message: 'Usuarios listados (filtrado en front)',
      timestamp: new Date().toISOString(),
      data: {
        page,
        size,
        total: filtered.length,
        data: paged
      }
    };
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    throw error;
  }
};

export const editUser = async (formData) => {
  const { id, email, name, status } = formData
  try {
    const response = await axiosInstance.put(`${SERVER_CONFIG.BASE_URL}/core/users/${id}`, {
      email,
      name,
      status
    })

    return response
  } catch(error) {
    console.error(`❌ Error al editar usuario: ${ id }`, error.message)
    throw error
  }
}


export const deleteUser = async (idUser) => {
  try {
    console.log('🗑️ Eliminando registro de usuario: ', idUser)
    const response = await axiosInstance.delete(`${SERVER_CONFIG.BASE_URL}/core/users/${idUser}`)

    return response
  } catch(error) {
    console.log(`❌ Error al eliminar el usuario: ${idUser}`, error.message)
    throw error
  }
}

export default {
    getUsers,
    editUser,
    deleteUser,
}
