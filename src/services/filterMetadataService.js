import { axiosInstance } from './axiosConfig'
// import { LOGS } from './endpoints'

export class FilterMetadataService {
  static async getFilterConfig(system) {
    const params = {}
    if (system) params.system = system

    const { data } = await axiosInstance.get('/filters/config', { params, timeout: 5000 })
    return data
  }
}
