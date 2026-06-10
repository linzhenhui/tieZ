<template>
    <!-- 主弹窗 -->
    <view v-if="modelValue" class="popup-mask" @click="close" @touchmove.stop.prevent>
        <view class="popup-card" @click.stop @touchmove.stop.prevent>
            <!-- 头部 -->
            <view class="popup-header">
                <text class="popup-title">{{ title }}</text>
            </view>
            <!-- 上方：已报价车队列表 -->
            <view v-if="quotedTeamList.length > 0 && isAdmin" class="quoted-wrap">
                <view class="section-title">已报价车队</view>

                <scroll-view class="quoted-scroll" scroll-y>
                    <view v-for="(item, index) in quotedTeamList" :key="item.id || index" class="quoted-item"
                        :class="{ active: selectedQuotedIndex === index }"
                        @click="item.status == '2' && fillQuotedTeam(item, index)">
                        <view class="quoted-item-top">
                            <view class="quoted-name">
                                <text class="quoted-name-text">{{ item.supplierName || '未命名车队' }}</text>
                            </view>
                            <view class="quoted-status" :class="getStatusClass(item.status)">
                                {{ item.status == '1' ? '未报价' : item.status == '2' ? '已报价' : '已取消' }}
                            </view>
                        </view>

                        <view class="quoted-info" v-if="item.price">
                            <view class="info-row">
                                <text class="info-label">费用：</text>
                                <text class="info-value">{{ item.price != null && item.price !== '' ? item.price : '-'
                                }}</text>
                            </view>

                            <view class="info-row" v-if="item.quoteTime">
                                <text class="info-label">时间：</text>
                                <text class="info-value">{{ item.quoteTime || '-' }}</text>
                            </view>

                            <view class="info-row" v-if="item.remark">
                                <text class="info-label">说明：</text>
                                <text class="info-value">{{ item.remark }}</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 下方表单 -->
            <view class="form-wrap">
                <view class="form-item" v-if="isAdmin">
                    <text class="form-label required">车队：</text>
                    <view class="form-picker" @click="openTeamSelector">
                        {{ form.supplierName || '请选择车队' }}
                    </view>
                </view>

                <view class="form-item" v-if="isAdmin">
                    <text class="form-label required">车队费用：</text>
                    <input v-model="form.teamPrice" class="form-input" type="digit" placeholder="请输入车队费用" />
                </view>

                <view class="form-item">
                    <text class="form-label required">报价金额：</text>
                    <input v-model="form.priceQuote" class="form-input" type="digit" placeholder="请输入报价金额" />
                </view>
                <view class="tip" v-if="isAdmin">报价金额必须大于所选车队报价</view>

                <view class="form-item textarea-item">
                    <text class="form-label">报价备注：</text>
                    <textarea v-model="form.quoteRemark" class="form-textarea" placeholder="请输入报价备注" />
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="popup-footer">
                <button class="popup-btn cancel" @click="close">取消</button>
                <button class="popup-btn confirm" :loading="loading" @click="submitQuote">
                    确认
                </button>
            </view>
        </view>
    </view>

    <!-- 车队选择弹窗 -->
    <view v-if="teamSelectorVisible" class="selector-mask" @click="closeTeamSelector" @touchmove.stop.prevent>
        <view class="selector-card" @click.stop>
            <view class="selector-header">
                <text class="selector-title">选择车队</text>
                <text class="selector-close" @click="closeTeamSelector">×</text>
            </view>

            <!-- 搜索框 -->
            <view class="selector-search">
                <input v-model="teamKeyword" class="search-input" placeholder="请输入车队名称筛选"
                    placeholder-class="search-placeholder" confirm-type="search" />
                <text v-if="teamKeyword" class="search-clear" @click="clearTeamKeyword">清除</text>
            </view>

            <scroll-view class="selector-scroll" scroll-y>
                <view v-if="filteredTeamList.length > 0">
                    <view v-for="(item, index) in filteredTeamList" :key="item.id || index" class="selector-item"
                        :class="{ active: selectedAllTeamIndex === index }" @click="chooseTeam(item, index)">
                        <view class="selector-item-left">
                            <text class="selector-name">{{ item.nameCn || '未命名车队' }}</text>
                        </view>

                        <text v-if="selectedAllTeamIndex === index" class="selector-check">✓</text>
                    </view>
                </view>

                <view v-else class="empty-box">暂无车队数据</view>
            </scroll-view>

            <view class="selector-footer">
                <button class="selector-btn" @click="closeTeamSelector">取消</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { reactive, ref, watch, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '车队报价结果'
    },
    // 上方：已报价车队列表
    quotedTeamList: {
        type: Array,
        default: () => []
    },
    // 下方：全部车队列表（点击“车队”时弹出选择）
    allTeamList: {
        type: Array,
        default: () => []
    },
    // 是否管理员（可选：做报价金额校验）
    isAdmin: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'submit', 'change'])

const loading = ref(false)
const teamSelectorVisible = ref(false)
const selectedAllTeamIndex = ref(-1)
const selectedQuotedIndex = ref()
const form = reactive({
    supplierName: '',
    teamPrice: '',
    priceQuote: '',
    quoteRemark: '',
    truckId: ''
})
const teamKeyword = ref('')
const lockPageScroll = (lock) => {
    // #ifdef H5
    document.body.style.overflow = lock ? 'hidden' : ''
    document.body.style.height = lock ? '100%' : ''
    // #endif
}
const filteredTeamList = computed(() => {
    const keyword = teamKeyword.value.trim().toLowerCase()
    if (!keyword) return props.allTeamList

    return props.allTeamList.filter((item) => {
        const name = (item.nameCn || '').toLowerCase()
        return name.includes(keyword)
    })
})
const close = () => {
    emit('update:modelValue', false)
}
const openTeamSelector = () => {
    teamKeyword.value = ''
    // 打开前，尽量把当前选中的车队高亮
    const idx = props.allTeamList.findIndex(item => item.id === form.truckId)
    selectedAllTeamIndex.value = idx >= 0 ? idx : -1
    teamSelectorVisible.value = true
}
const closeTeamSelector = () => {
    teamSelectorVisible.value = false
    teamKeyword.value = ''
}
const clearTeamKeyword = () => {
    teamKeyword.value = ''
}
const chooseTeam = (item, index) => {
    selectedAllTeamIndex.value = index

    form.supplierName = item.nameCn || ''
    form.truckId = item.id || ''

    emit('change', item, index)
    closeTeamSelector()
}

const getStatusClass = (status) => {
    const text = String(status || '')

    if (text.includes('2')) {
        return 'status-success'
    }
    if (text.includes('1')) {
        return 'status-warn'
    }
    if (text.includes('3')) {
        return 'status-danger'
    }
    return 'status-default'
}
const submitQuote = () => {
    if (form.priceQuote === '' || form.priceQuote == null) {
        uni.showToast({ title: '请输入报价金额', icon: 'none' })
        return
    }
    if (props.isAdmin) {
        if (!form.truckId && isAdmin) {
            uni.showToast({ title: '请选择车队', icon: 'none' })
            return
        }

        if (form.teamPrice === '' || form.teamPrice == null) {
            uni.showToast({ title: '请输入车队费用', icon: 'none' })
            return
        }
        const teamPriceNum = Number(form.teamPrice || 0)
        const quoteAmountNum = Number(form.priceQuote || 0)
        if (quoteAmountNum <= teamPriceNum) {
            uni.showToast({
                title: '报价金额必须大于车队费用',
                icon: 'none'
            })
            return
        }
    }

    loading.value = true
    try {
        emit('submit', {
            supplierName: form.supplierName,
            truckId: form.truckId,
            teamPrice: form.teamPrice,
            priceQuote: form.priceQuote,
            quoteRemark: form.quoteRemark
        })
        close()
    } finally {
        loading.value = false
    }
}

watch(
    () => props.modelValue,
    (visible) => {
        lockPageScroll(visible)

        if (!visible) {
            closeTeamSelector()
            return
        }

        // 弹窗打开时，如果没有选择过，默认不自动选中
        // 你也可以按业务需要这里默认选第一项
        if (props.allTeamList.length > 0 && !form.truckId) {
            selectedAllTeamIndex.value = -1
        }
    },
    { immediate: true }
)

watch(
    () => props.allTeamList,
    () => {
        if (!props.modelValue) return
        if (!props.allTeamList.length) return
        const idx = props.allTeamList.findIndex(item => item.id === form.truckId)
        selectedAllTeamIndex.value = idx >= 0 ? idx : -1
    },
    { deep: true }
)

const fillQuotedTeam = (item, index) => {
    selectedQuotedIndex.value = index

    form.supplierName = item.supplierName || item.nameCn || ''
    form.truckId = item.truckId || item.id || ''
    form.teamPrice = item.price != null && item.price !== '' ? String(item.price) : ''
    form.quoteRemark = item.remark || ''

    const idx = props.allTeamList.findIndex(t =>
        t.id === form.truckId || t.nameCn === form.supplierName
    )
    selectedAllTeamIndex.value = idx >= 0 ? idx : -1
}

onBeforeUnmount(() => {
    lockPageScroll(false)
})
</script>

<style scoped>
.popup-mask {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    box-sizing: border-box;
}

.popup-card {
    width: 92vw;
    max-width: 680rpx;
    max-height: 88vh;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.18);
}

.popup-header {
    flex: 0 0 auto;
    position: relative;
    padding: 28rpx 24rpx 18rpx;
    text-align: center;
    border-bottom: 1rpx solid #f1f1f1;
}

.popup-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #222;
}

.popup-close {
    position: absolute;
    right: 20rpx;
    top: 14rpx;
    width: 56rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    font-size: 44rpx;
    color: #999;
}

/* 已报价车队列表 */
.quoted-wrap {
    padding: 18rpx 22rpx 0;
    flex: 0 0 auto;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 14rpx;
}

.quoted-scroll {
    max-height: 580rpx;
}

.quoted-item {
    border: 1rpx solid #e8e8e8;
    border-radius: 18rpx;
    padding: 12rpx;
    margin-bottom: 16rpx;
    background: #fff;
}

.quoted-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.quoted-name {
    flex: 1;
    min-width: 0;
}

.quoted-name-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #222;
    word-break: break-all;
}

.quoted-status {
    flex-shrink: 0;
    font-size: 24rpx;
    padding: 7rpx 14rpx;
    border-radius: 999rpx;
    background: #f2f2f2;
    color: #666;
}

.status-success {
    background: #e8f8ee;
    color: #18a058;
}

.status-info {
    background: #e8f4ff;
    color: #1e9bd7;
}

.status-warn {
    background: #fff6e7;
    color: #e6a23c;
}

.status-danger {
    background: #fdecec;
    color: #d9534f;
}

.status-default {
    background: #f2f2f2;
    color: #666;
}

.quoted-info {
    margin-top: 5rpx;
    padding-top: 5rpx;
    border-top: 1rpx dashed #ededed;
}

.info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 4rpx;
    line-height: 1.5;
}

.info-label {
    width: 88rpx;
    flex-shrink: 0;
    color: #888;
    font-size: 26rpx;
}

.info-value {
    flex: 1;
    color: #333;
    font-size: 26rpx;
    word-break: break-all;
}

/* 表单 */
.form-wrap {
    padding: 18rpx 22rpx 0;
}

.form-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.form-label {
    width: 160rpx;
    flex-shrink: 0;
    font-size: 28rpx;
    color: #333;
    display: flex;
    align-items: center;
    gap: 6rpx;

}

.required {
    color: #e60012;
    font-weight: 600;
}

.tip {
    margin-top: -20rpx;
    margin-bottom: 20rpx;
    text-align: center;
    font-size: 18rpx;
}

.form-picker,
.form-input,
.form-textarea {
    width: 100%;
    height: 40rpx;
    box-sizing: border-box;
    border: 1rpx solid #dcdcdc;
    border-radius: 14rpx;
    background: #fff;
    font-size: 28rpx;
    color: #222;
}

.form-picker {
    min-height: 82rpx;
    line-height: 82rpx;
    padding: 0 20rpx;
}

.form-input {
    height: 82rpx;
    padding: 0 20rpx;
}

.form-textarea {
    min-height: 140rpx;
    padding: 18rpx 20rpx;
}

.textarea-item {
    margin-bottom: 0;
}

/* 底部按钮 */
.popup-footer {
    flex: 0 0 auto;
    display: flex;
    gap: 18rpx;
    padding: 18rpx 22rpx 22rpx;
    border-top: 1rpx solid #f1f1f1;
    background: #fff;
}

.popup-btn {
    flex: 1;
    height: 84rpx;
    line-height: 84rpx;
    border-radius: 14rpx;
    font-size: 30rpx;
    font-weight: 600;
}

.cancel {
    background: #f5f5f5;
    color: #333;
}

.confirm {
    background: #1e9bd7;
    color: #fff;
}

/* 车队选择弹窗 */
.selector-mask {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    box-sizing: border-box;
}

.selector-card {
    width: 90vw;
    max-width: 650rpx;
    max-height: 70vh;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.selector-header {
    position: relative;
    padding: 26rpx 24rpx 18rpx;
    text-align: center;
    border-bottom: 1rpx solid #f1f1f1;
}

.selector-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #222;
}

.selector-close {
    position: absolute;
    right: 20rpx;
    top: 12rpx;
    width: 56rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    font-size: 44rpx;
    color: #999;
}

.selector-scroll {
    flex: 1;
    min-height: 0;
    padding: 18rpx 20rpx;
    box-sizing: border-box;
}

.selector-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 18rpx;
    border: 1rpx solid #e8e8e8;
    border-radius: 14rpx;
    margin-bottom: 16rpx;
    background: #fff;
}

.selector-item.active {
    border-color: #1e9bd7;
    background: #f4fbff;
}

.selector-item-left {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.selector-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #222;
}

.selector-desc {
    font-size: 24rpx;
    color: #666;
}

.selector-check {
    font-size: 34rpx;
    color: #1e9bd7;
    font-weight: 700;
}

.empty-box {
    text-align: center;
    color: #999;
    font-size: 28rpx;
    padding: 80rpx 0;
}

.selector-footer {
    padding: 18rpx 20rpx 22rpx;
    border-top: 1rpx solid #f1f1f1;
}

.selector-btn {
    width: 100%;
    height: 84rpx;
    line-height: 84rpx;
    border-radius: 14rpx;
    background: #f5f5f5;
    color: #333;
    font-size: 30rpx;
    font-weight: 600;
}

.quoted-item {
    position: relative;
}

.quoted-item.active {
    border-color: #1e9bd7;
    background: #f4fbff;
    box-shadow: 0 0 0 1rpx rgba(30, 155, 215, 0.15) inset;
}

.quoted-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12rpx;
    bottom: 12rpx;
    width: 6rpx;
    border-radius: 6rpx;
    background: #1e9bd7;
}

.selector-search {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 18rpx 20rpx 0;
    box-sizing: border-box;
}

.search-input {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    background: #fff;
    font-size: 28rpx;
    box-sizing: border-box;
}

.search-placeholder {
    color: #999;
}

.search-clear {
    color: #1e9bd7;
    font-size: 26rpx;
    white-space: nowrap;
}
</style>