import { api } from 'src/boot/axios'

export interface BackupItem {
  id: number
  tenant_id: string
  backup_type: 'full' | 'incremental' | 'export'
  file_path: string
  file_size: number
  checksum: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  formatted_file_size: string
  duration: number | null
  age_in_days: number
}

export interface BackupSchedule {
  id: number
  tenant_id: string
  backup_type: 'full' | 'incremental' | 'export'
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BackupStatistics {
  total_backups: number
  completed_backups: number
  failed_backups: number
  total_size: number
  latest_backup: string | null
  oldest_backup: string | null
  by_type: {
    full: number
    incremental: number
    export: number
  }
}

export interface CreateBackupRequest {
  backup_type: 'full' | 'incremental' | 'export'
  options?: Record<string, any>
}

export interface CreateScheduleRequest {
  backup_type: 'full' | 'incremental' | 'export'
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  is_active?: boolean
  metadata?: Record<string, any>
}

export interface RestoreBackupRequest {
  backup_id: number
  point_in_time?: string
}

export interface ValidationResult {
  valid: boolean
  checks: {
    file_exists: boolean
    size_match: boolean
    checksum_valid: boolean
    readable: boolean
    read_error?: string
  }
}

class BackupService {
  private baseUrl = '/backups'
  private isDevelopment = false // Switch to production API endpoints

  constructor() {
    console.log('BackupService initialized:', {
      NODE_ENV: process.env.NODE_ENV,
      isDevelopment: this.isDevelopment,
      baseUrl: this.baseUrl
    })
  }

  async getBackups(params: {
    page?: number
    per_page?: number
    sort_by?: string
    sort_desc?: boolean
    type?: string
    status?: string
  } = {}) {
    // In development, use test endpoint if no auth
    const url = this.isDevelopment ? '/backups-test' : this.baseUrl
    console.log('getBackups called:', { url, isDevelopment: this.isDevelopment, params })
    const response = await api.get(url, { params })
    return response.data
  }

  async getBackup(id: number): Promise<BackupItem> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createBackup(data: CreateBackupRequest): Promise<BackupItem> {
    // In development, use test endpoint if no auth
    const url = this.isDevelopment ? '/backup-create-simple' : this.baseUrl
    const payload = this.isDevelopment ? { backup_type: data.backup_type } : data
    const response = await api.post(url, payload)
    return response.data
  }

  async deleteBackup(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`)
  }

  async downloadBackup(id: number): Promise<void> {
    const response = await api.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Get filename from response headers
    const contentDisposition = response.headers['content-disposition']
    let filename = 'backup.zip'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  async restoreBackup(data: RestoreBackupRequest): Promise<void> {
    await api.post(`${this.baseUrl}/${data.backup_id}/restore`, {
      point_in_time: data.point_in_time
    })
  }

  async validateBackup(id: number): Promise<ValidationResult> {
    const response = await api.post(`${this.baseUrl}/${id}/validate`)
    return response.data
  }

  async getStatistics(): Promise<BackupStatistics> {
    // In development, use test endpoint if no auth
    const url = this.isDevelopment ? '/backups-statistics-test' : `${this.baseUrl}/statistics`
    console.log('getStatistics called:', { url, isDevelopment: this.isDevelopment })
    const response = await api.get(url)
    return response.data
  }

  // Schedule management
  async getSchedules(params: {
    page?: number
    per_page?: number
    is_active?: boolean
  } = {}) {
    const response = await api.get(`${this.baseUrl}/schedules`, { params })
    return response.data
  }

  async getSchedule(id: number): Promise<BackupSchedule> {
    const response = await api.get(`${this.baseUrl}/schedules/${id}`)
    return response.data
  }

  async createSchedule(data: CreateScheduleRequest): Promise<BackupSchedule> {
    const response = await api.post(`${this.baseUrl}/schedules`, data)
    return response.data
  }

  async updateSchedule(id: number, data: Partial<CreateScheduleRequest>): Promise<BackupSchedule> {
    const response = await api.put(`${this.baseUrl}/schedules/${id}`, data)
    return response.data
  }

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/schedules/${id}`)
  }

  async toggleSchedule(id: number): Promise<BackupSchedule> {
    const response = await api.patch(`${this.baseUrl}/schedules/${id}/toggle`)
    return response.data
  }
}

export const backupService = new BackupService()