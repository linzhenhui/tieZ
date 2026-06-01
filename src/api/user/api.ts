import { http } from '@/request/http'

export const getMyInquiryCountApi = () => {
    return http({ url: '/api/pri/inquiryTruck/myCount', method: 'GET' })
}

export const getTruckInquiryCountApi = () => {
    return http({ url: '/api/pri/inquiryTruck/truckCount', method: 'GET' })
}

export const getMyLogisticsCountApi = () => {
    return http({ url: '/api/pri/logisticsTruck/myCount', method: 'GET' })
}

export const getTruckLogisticsCountApi = () => {
    return http({ url: '/api/pri/logisticsTruck/truckCount', method: 'GET' })
}