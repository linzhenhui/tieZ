import { uploadFile } from '@/utils/request'

export interface UploadResult {
  url: string
  name?: string
  size?: number
}

export const uploadImageApi = (filePath: string) => {
  return uploadFile<UploadResult>(filePath, 'file')
}