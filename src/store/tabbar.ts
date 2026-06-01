import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from './user'
import type { TabbarItem } from '@/api'

export const useTabbarStore = defineStore('tabbar', () => {
  const userStore = useUserStore()

  const isFleet = computed(() => userStore.role === 'fleet')

  // 是否 H5
  const isH5 = computed(() => {
    return uni.getSystemInfoSync().uniPlatform === 'web'
  })

  const tabbarList = computed<TabbarItem[]>(() => {
    // H5 端：只显示两个 tab
    // if (isH5.value) {
    //   return [
    //     {
    //       text: '我的询价单',
    //       pagePath: '/pages/inquiry/list'
    //     },
    //     {
    //       text: '我的物流单',
    //       pagePath: '/pages/logistics/list'
    //     }
    //   ]
    // }

    // 非 H5：保留你原来的逻辑
    if (isFleet.value) {
      return [
        {
          text: '我的询价单',
          pagePath: '/pages/inquiry/list'
        },
        {
          text: '我的物流单',
          pagePath: '/pages/logistics/list'
        },
        {
          text: '我的',
          pagePath: '/pages/mine/index'
        }
      ]
    }

    return [
      {
        text: '首页',
        pagePath: '/pages/home/index'
      },
      {
        text: '人工询价',
        pagePath: '/pages/inquiry/form'
      },
      {
        text: '我的',
        pagePath: '/pages/mine/index'
      }
    ]
  })

  /**
   * 根据角色/平台返回默认首页
   */
  const defaultHomePath = computed(() => {
    // if (isH5.value) {
    //   return '/pages/inquiry/list'
    // }

    return isFleet.value ? '/pages/inquiry/list' : '/pages/home/index'
  })

  return {
    tabbarList,
    defaultHomePath
  }
})