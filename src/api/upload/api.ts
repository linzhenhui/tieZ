import { http } from '@/request/http'
import type { BaseResult } from '@/api/common/type'
import type { UploadResult } from './type'
import { uploadFile } from '@/utils/request'

/** 文件上传 */
export const uploadFileApi = (filePath: string) => {
  return http<BaseResult<UploadResult>>({
    url: '/api/pri/upload/file',
    method: 'POST',
    data: { filePath }
  })
}

export const uploadImageApi = (filePath: string) => {
  return uploadFile<UploadResult>(filePath, 'file')
}