import mockData from '../data/mock_logs.json'

export class MockPassportService {
  /**
   * Simula una petición GET a la API con filtros
   * @param {URLSearchParams} params - Filtros Simulados
   * @returns {Promise<Object>}
   */

  static async getAll(params){
    return new Promise( resolve => {
      setTimeout(() => {
        console.log('📦 [MOCK] Retornando datos simulados...')
        //  Logica de parametros
        if(params){
          console.log('📦 [MOCK] Retornando datos simulados con parametros...', params)
        }

        resolve(mockData)
      }, 1500)
    })
  }
}
