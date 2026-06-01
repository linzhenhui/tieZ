import type { InquiryOrder, LogisticsOrder, PriceQuoteItem } from '@/api'

export const mockInquiryList: InquiryOrder[] = [
    {
        id: 'inq-1',
        orderNo: 'TZ2026030002',
        createdAt: '2026-03-30 10:10:10',
        status: 'inquiring',
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        quotedPrice: undefined,
        boxPlace1: '宁波',
        boxPlace2: '',
        loadingPlace: '台州',
        destination: '金华',
        containerType: '40HQ',
        containerCount: 2,
        pickupTime: '2026-04-11',
        weight: '22000',
        goodsName: '布料',
        remark: '超22吨，每吨增加200元'
    },
    {
        id: 'inq-2',
        orderNo: 'TZ2026030001',
        createdAt: '2026-03-30 10:10:10',
        status: 'quoted',
        quotedPrice: 1800,
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        boxPlace1: '宁波',
        boxPlace2: '',
        loadingPlace: '台州',
        destination: '金华',
        containerType: '40HQ',
        containerCount: 2,
        pickupTime: '2026-04-11',
        weight: '22000',
        goodsName: '布料',
        remark: ''
    }
]

export const mockLogisticsList: LogisticsOrder[] = [
    {
        id: 'log-1',
        orderNo: 'XJ2026030001',
        createdAt: '2026-03-30 10:10:10',
        status: 'dispatching',
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        containerInfo: '40HQ * 2',
        goodsName: '布料',
        pickupTime: '2026-04-11',
        weight: '22000 KGS',
        freight: 1800
    },
    {
        id: 'log-2',
        orderNo: 'XJ2026030002',
        createdAt: '2026-03-30 10:10:10',
        status: 'picking',
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        containerInfo: '40HQ * 2',
        goodsName: '布料',
        pickupTime: '2026-04-11',
        weight: '22000 KGS',
        freight: 1800,
        dispatchInfo: {
            driverName: '张三',
            phone: '13888888888',
            idCard: '330235199212061820',
            truckNo: '浙B293484',
            trailerNo: '浙B29485'
        },
        pickupBoxInfo: {
            containerNo: 'SITU2938895',
            sealNo: '28340485',
            pickupBoxDate: '2026-04-01',
            photos: ['1', '2', '3', '4']
        },
        pickupGoodsInfo: {
            pickupGoodsDate: '2026-04-02',
            photos: ['5', '6', '7']
        },
        weighInInfo: {
            stationDate: '2026-04-02',
            photos: ['8'],
            extraFeeType: '过磅费',
            extraFeeAmount: '25',
            extraFeeRemark: ''
        },
        extraFees: [
            {
                feeType: '拖车费',
                price: 2000,
                count: 1,
                amount: 2000
            },
            {
                feeType: '过磅费',
                price: 25,
                count: 1,
                amount: 25
            }
        ]
    }
]

export const mockPriceList: PriceQuoteItem[] = [
    {
        id: 'price-1',
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        remark: '超过22吨，每吨增加200元',
        price: 1800
    },
    {
        id: 'price-2',
        fromCity: '台州',
        toCity: '金华',
        boxPlace: '宁波',
        remark: '超过22吨，每吨增加200元',
        price: 1850
    }
]