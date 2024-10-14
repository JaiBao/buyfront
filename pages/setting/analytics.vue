<!-- pages/analytics.vue -->
<template>
  <div class="chartPage">
    <!-- 控制區域：數據類型選擇器、圖表類型選擇器和月份範圍選擇器 -->
    <div class="controls">
      <!-- 數據類型選擇器 -->
      <div class="data-type-selector row items-center">
        <label class="data-type-label">選擇數據類型：</label>
        <q-select outlined v-model="selectedDataType" :options="dataTypeOptions" emit-value map-options class="q-mb-md" />
      </div>

      <!-- 圖表類型選擇器 -->
      <div class="chart-type-selector row">
        <label class="chart-type-label row items-center">選擇圖表類型：</label>
        <div class="chart-type-options">
          <label v-for="option in filteredChartTypeOptions" :key="option.value">
            <q-radio :val="option.value" v-model="selectedChartType" :disabled="option.disabled" size="xs" />
            {{ option.label }}
          </label>
        </div>
      </div>

      <!-- 快捷選擇按鈕 -->
      <div class="quick-select-buttons q-my-md" v-if="showDateSelectors">
        <label>快速選擇：</label>
        <q-btn @click="setCurrentYear" label="今年" class="q-mr-sm bg-yellow-7" />
        <q-btn @click="setLastYear" label="去年" class="q-mr-sm bg-yellow-7" />
        <q-btn @click="setCurrentMonth" label="本月" class="q-mr-sm bg-yellow-7" />
        <q-btn @click="setLastMonth" label="上個月" class="q-mr-sm bg-yellow-7" />
      </div>

      <!-- 月份範圍選擇器 -->
      <div class="monthRange" v-if="showDateSelectors">
        <label>選擇年份和月份範圍：</label>
        <div class="monthSelects">
          <q-input outlined v-model="selectedYear" label="年份" type="number" class="q-mr-md" />
          <q-select outlined v-model="selectedStartMonth" :options="monthOptions" label="開始月份" emit-value map-options />
          <span class="to-label">到</span>
          <q-select outlined v-model="selectedEndMonth" :options="monthOptions" label="結束月份" emit-value map-options />
        </div>
      </div>

      <!-- 顯示日期驗證錯誤 -->
      <div v-if="!isDateValid" class="text-red">開始月份不能晚於結束月份。</div>
    </div>

    <!-- 圖表展示區 -->
    <div class="chartDisplay">
      <ChartComponent
        :key="[selectedChartType, selectedDataType]"
        :chartType="selectedChartType"
        :apiEndpoint="computedApiEndpoint"
        :chartLabel="chartLabels[selectedChartType]?.[selectedDataType] || '圖表'"
        :dataType="selectedDataType" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'
import ChartComponent from '/components/ChartComponent.vue'
import { DateTime } from 'luxon'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin'
})

// 初始化 userStore
const userStore = useUserStore()
const { isSuperAdmin, isAdmin } = storeToRefs(userStore)
// 數據類型
const selectedDataType = ref(isSuperAdmin.value ? 'userAge' : 'orders')

// 圖表類型
const selectedChartType = ref('bar')

// 開始月份和結束月份，格式為 'MM'
const selectedStartMonth = ref('01')
const selectedEndMonth = ref('12')

// 定義月份選項
const monthOptions = computed(() => {
  const months = [
    { label: '1月', value: '01' },
    { label: '2月', value: '02' },
    { label: '3月', value: '03' },
    { label: '4月', value: '04' },
    { label: '5月', value: '05' },
    { label: '6月', value: '06' },
    { label: '7月', value: '07' },
    { label: '8月', value: '08' },
    { label: '9月', value: '09' },
    { label: '10月', value: '10' },
    { label: '11月', value: '11' },
    { label: '12月', value: '12' }
  ]
  return months
})

// 預設當前年份
const selectedYear = ref(new Date().getFullYear())

const showDateSelectors = computed(() => {
  // 如果選擇的數據類型需要日期範圍則顯示（排除 userAge, userCity, userDistrict）
  return !['userAge', 'userCity', 'userDistrict'].includes(selectedDataType.value)
})

// 定義數據類型選項
const allDataTypeOptions = [
  { label: '每月訂單數量', value: 'orders' },
  { label: '每月營業額', value: 'revenue' },
  { label: '產品訂購數量', value: 'products' },
  { label: '顧客年齡層分布', value: 'age' },
  { label: '顧客縣市分布', value: 'city' },
  { label: '顧客區域分布', value: 'district' },
  { label: '全會員年齡分布', value: 'userAge' },
  { label: '全會員縣市分布', value: 'userCity' },
  { label: '全會員區域分布', value: 'userDistrict' }
]

// 根據角色動態過濾數據類型選項
const dataTypeOptions = computed(() => {
  if (isSuperAdmin.value) {
    return allDataTypeOptions.filter(option => ['userAge', 'userCity', 'userDistrict'].includes(option.value))
  } else {
    // 管理員看到所有數據類型
    return allDataTypeOptions
  }
})

// 定義圖表類型選項
const allChartTypeOptions = [
  { label: '長條圖', value: 'bar' },
  { label: '折線圖', value: 'line' },
  { label: '圓餅圖', value: 'pie' }
]

// 根據選擇的數據類型動態過濾圖表類型選項
const filteredChartTypeOptions = computed(() => {
  if (selectedDataType.value === 'orders' || selectedDataType.value === 'revenue') {
    // 不需要圓餅圖
    return allChartTypeOptions.filter(option => option.value !== 'pie')
  } else if (selectedDataType.value === 'age' || selectedDataType.value === 'userAge') {
    // 不需要折線圖
    return allChartTypeOptions.filter(option => option.value !== 'line')
  } else if (['city', 'products', 'district', 'userCity', 'userDistrict'].includes(selectedDataType.value)) {
    selectedChartType.value = 'wordCloud'
    // 為詞雲圖顯示特定圖表類型
    return [
      { label: '詞雲圖', value: 'wordCloud' },
      { label: '圓餅圖', value: 'pie' },
      { label: '長條圖', value: 'bar' }
    ]
  } else {
    // 可以使用所有圖表類型
    return allChartTypeOptions
  }
})

// 當數據類型改變時，檢查當前選擇的圖表類型是否仍然有效
watch(selectedDataType, newType => {
  const validChartTypes = filteredChartTypeOptions.value.map(option => option.value)
  if (!validChartTypes.includes(selectedChartType.value)) {
    // 如果當前選擇的圖表類型不在有效選項中，重置為第一個有效選項
    selectedChartType.value = filteredChartTypeOptions.value[0]?.value || 'bar'
  }
})

// 定義圖表標籤，根據數據類型和圖表類型動態設置
const chartLabels = computed(() => {
  return {
    bar: {
      orders: '每月訂單數量',
      revenue: '每月營業額',
      products: '產品訂購數量',
      age: '顧客年齡層分布'
    },
    line: {
      orders: '每月訂單數量',
      revenue: '每月營業額',
      products: '產品訂購數量',
      age: '顧客年齡層分布'
    },
    pie: {
      orders: '每月訂單數量',
      revenue: '每月營業額',
      products: '產品訂購數量',
      age: '顧客年齡層分布'
    },
    wordCloud: {
      products: '產品訂購數量',
      city: '縣市分布',
      district: '區域分布'
    }
  }
})

// 計算完整的 API endpoint，包括數據類型和月份範圍參數
const computedApiEndpoint = computed(() => {
  if (!userStore.uid) {
    console.error('User UID is not available')
    return ''
  }
  // 確保年份和月份都已經選擇
  if (!selectedStartMonth.value || !selectedEndMonth.value || !selectedYear.value) {
    return ''
  }
  let endpoint = ''

  // 根據選擇的數據類型設置 API 端點
  switch (selectedDataType.value) {
    case 'orders':
      endpoint = `analytics/orders/${userStore.uid}`
      break
    case 'revenue':
      endpoint = `analytics/revenue/${userStore.uid}`
      break
    case 'products':
      endpoint = `analytics/products/${userStore.uid}`
      break
    case 'age':
      endpoint = `analytics/age/${userStore.uid}`
      break
    case 'city':
      endpoint = `analytics/city/${userStore.uid}`
      break
    case 'district':
      endpoint = `analytics/district/${userStore.uid}`
      break
    case 'userAge':
      endpoint = `analytics/age`
      break
    case 'userCity':
      endpoint = `analytics/city`
      break
    case 'userDistrict':
      endpoint = `analytics/district`
      break
    default:
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `沒有這個數據類型: ${selectedDataType.value}`,
        confirmButtonText: '確定'
      })
      break
  }
  if (['userAge', 'userCity', 'userDistrict'].includes(selectedDataType.value)) {
    return endpoint // 不需要日期範圍的類型直接返回 endpoint
  }

  const startDate = `${selectedYear.value}-${selectedStartMonth.value}-01`
  const endDate = `${selectedYear.value}-${selectedEndMonth.value}-${getLastDayOfMonth(selectedYear.value, selectedEndMonth.value)}`

  const params = new URLSearchParams({
    startDate,
    endDate
  })

  endpoint += `?${params.toString()}`

  return endpoint
})

// 獲取指定月份的最後一天
function getLastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate().toString().padStart(2, '0')
}

// 定義快捷設置func
const setCurrentYear = () => {
  selectedYear.value = new Date().getFullYear()
  selectedStartMonth.value = '01'
  selectedEndMonth.value = '12'
}

const setLastYear = () => {
  selectedYear.value = new Date().getFullYear() - 1
  selectedStartMonth.value = '01'
  selectedEndMonth.value = '12'
}

const setCurrentMonth = () => {
  const currentMonth = new Date().getMonth() + 1
  selectedYear.value = new Date().getFullYear()
  selectedStartMonth.value = currentMonth.toString().padStart(2, '0')
  selectedEndMonth.value = currentMonth.toString().padStart(2, '0')
}

const setLastMonth = () => {
  const date = DateTime.now().minus({ months: 1 })
  selectedYear.value = date.year
  selectedStartMonth.value = date.month.toString().padStart(2, '0')
  selectedEndMonth.value = date.month.toString().padStart(2, '0')
}

// 驗證選擇的月份範圍是否有效
const isDateValid = computed(() => {
  if (selectedStartMonth.value && selectedEndMonth.value) {
    return parseInt(selectedStartMonth.value) <= parseInt(selectedEndMonth.value)
  }
  return true // 如果未選擇完整範圍，視為有效
})
</script>

<style lang="scss" scoped>
@import 'assets/setting/analytics.scss';
</style>
