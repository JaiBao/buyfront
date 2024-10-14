<!-- components/ChartComponent.vue -->
<template>
  <div class="chart-container">
    <!-- 只有非詞雲圖顯示標籤 -->
    <div v-if="!isWordCloud" class="text-h6 q-mb-md">{{ chartLabel }}</div>

    <!-- 如果是 wordCloud，則使用 WordCloudComponent -->
    <WordCloudComponent v-if="isWordCloud" :data="wordCloudData" :width="width" :height="height" :minFontSize="20" :maxFontSize="80" />

    <!-- 否則使用 Chart.js 渲染圖表 -->
    <component v-else :is="chartTypeComponent" :data="chartJsData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { Line, Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import WordCloudComponent from './WordCloudComponent.vue'

const { $apiAuth } = useNuxtApp()

// 註冊所需的 Chart.js 組件和插件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartDataLabels // 註冊插件
)

// 定義組件屬性
const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: value => ['pie', 'line', 'bar', 'wordCloud'].includes(value)
  },
  apiEndpoint: {
    type: String,
    required: true
  },
  chartLabel: {
    type: String,
    default: '圖表'
  },
  dataType: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  }
})

// 根據 chartType 動態選擇組件（不包含 wordCloud）
const chartTypeComponent = computed(() => {
  switch (props.chartType) {
    case 'line':
      return Line
    case 'bar':
      return Bar
    case 'pie':
      return Pie
    default:
      return Line
  }
})

// 是否使用詞雲
const isWordCloud = computed(() => props.chartType === 'wordCloud')

// 初始化圖表數據
const chartJsData = ref({
  labels: [],
  datasets: []
})

const wordCloudData = ref({})

// 定義背景和邊框顏色
const backgroundColor = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(199, 199, 199, 0.6)'
]

const borderColor = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)'
]

// 生成新的 HSL 顏色
function generateColor(index) {
  const hue = (index * 137.5) % 360 // 使用黃金角度近似，避免重複色
  return `hsl(${hue}, 70%, 70%)` // 調整飽和度和亮度以確保顏色明顯
}
// 更新 Chart.js 數據
const updateChartJsData = newData => {
  const labels = Object.keys(newData)
  const dataValues = Object.values(newData)

  chartJsData.value = {
    labels,
    datasets: [
      {
        label: props.chartLabel,
        backgroundColor: labels.map((_, i) => backgroundColor[i] || generateColor(i)), // 動態生成背景顏色
        borderColor: labels.map((_, i) => borderColor[i] || generateColor(i)), // 動態生成邊框顏色
        borderWidth: 1,
        data: dataValues,
        ...(props.chartType !== 'pie' && {
          datalabels: {
            color: 'black',
            anchor: 'end',
            align: 'top',
            backgroundColor: 'white',
            font: {
              weight: 'bold'
            },
            formatter: function (value) {
              return value
            }
          }
        })
      }
    ]
  }
}

const chartOptions = computed(() => {
  const totalDataPoints = chartJsData.value.labels.length
  const threshold = 12 // 設定一個閾值，當資料點超過這個數量時不顯示標籤

  return {
    responsive: true,
    maintainAspectRatio: false, // 允許圖表調整高度
    plugins: {
      datalabels:
        totalDataPoints <= threshold
          ? {
              // 當資料點小於等於 threshold 時啟用
              color: 'black',
              anchor: props.chartType === 'pie' ? 'center' : 'end',
              align: props.chartType === 'pie' ? undefined : 'top',
              backgroundColor: 'transparent',
              clip: false, // 防止標籤裁剪
              formatter: (value, context) => {
                // 根據是否為 pie 來設置標籤格式
                return props.chartType === 'pie' ? `${context.chart.data.labels[context.dataIndex]}: ${value}` : value
              },
              display: true // 確保 datalabels 顯示在資料點數小於等於 threshold 時
            }
          : false, // 超過閾值時禁用 datalabels 插件
      legend: {
        display: props.chartType === 'pie', // 只有圓餅圖顯示圖例
        position: 'top',
        align: 'start',
        padding: 20, // 圖例間距
        labels: {
          boxWidth: 20,
          padding: 15
        }
      },
      title: {
        display: false,
        text: '分析圖表'
      }
    },
    scales:
      props.chartType === 'pie'
        ? {} // 圓餅圖無需 y 軸
        : {
            y: {
              beginAtZero: true,
              grace: '2%', // y 軸頂增加空間
              ticks: {
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value
                  }
                },
                stepSize: 1 // 設置1，防止出現小數
              }
            }
          },
    layout: {
      padding: {
        top: props.chartType !== 'pie' ? 20 : 10 // 為長條圖和折線圖增加上方內邊距
      }
    }
  }
})

// 獲取資料
const fetchData = async () => {
  try {
    // console.log(`Calling API: ${props.apiEndpoint}`)
    const response = await $apiAuth(props.apiEndpoint)

    if (response.data.success) {
      const data = response.data.result
      // console.log('Fetched data:', data)
      if (isWordCloud.value) {
        // 將數據傳遞給 WordCloudComponent
        wordCloudData.value = data
        // console.log('WordCloud data set:', wordCloudData.value)
      } else {
        updateChartJsData(data)
        // console.log('Chart.js data set:', chartJsData.value)
      }
    } else {
      console.error('API call failed:', response)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await fetchData()
})

watch(
  () => props.apiEndpoint,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      await fetchData()
    }
  }
)
</script>

<style lang="scss" scoped>
@import 'assets/components/ChartComponent';
</style>
