<template>
  <view class="page">
    <web-view v-if="src" :src="src" />
    <view v-else class="empty">
      <text>内容不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const src = ref('')

// 这里换成你自己的协议地址
const AGREEMENT_URL = 'https://your-domain.com/agreement.html'
const PRIVACY_URL = 'https://your-domain.com/privacy.html'

onLoad((options) => {
  const type = String(options?.type || '')

  if (type === 'agreement') {
    src.value = AGREEMENT_URL
  } else if (type === 'privacy') {
    src.value = PRIVACY_URL
  } else {
    src.value = ''
  }
})
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100vh;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #999;
  font-size: 28rpx;
}
</style>