<template>
  <div ref="stackedBarChartContainer" class="stacked-bar-chart"></div>
</template>

<script setup>
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'

// 接收props
const props = defineProps({
  data: {
    type: Array,
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

const stackedBarChartContainer = ref(null)

const renderStackedBarChart = data => {
  if (!Array.isArray(data)) {
    console.error('Data is not an array:', data)
    return
  }

  // 清空之前的圖表
  d3.select(stackedBarChartContainer.value).selectAll('*').remove()

  // 設置圖表的邊界和尺寸
  const margin = { top: 20, right: 30, bottom: 40, left: 100 }
  const width = props.width - margin.left - margin.right
  const height = props.height - margin.top - margin.bottom

  // 創建 svg 畫布
  const svg = d3
    .select(stackedBarChartContainer.value)
    .append('svg')
    .attr('width', props.width)
    .attr('height', props.height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 定義數據的分類和鍵，負值表示男性，正值表示女性
  const categories = ['male', 'female']
  const names = data.map(d => d.ageGroup)

  // 使用 d3.stack 和 d3.stackOffsetDiverging 進行堆疊
  const stack = d3.stack().keys(categories).offset(d3.stackOffsetDiverging)

  const stackedData = stack(data)

  // 設置 x 軸比例尺，從負到正，顯示對稱
  const x = d3
    .scaleLinear()
    .domain([
      d3.min(stackedData.flat(2)), // 最小值
      d3.max(stackedData.flat(2)) // 最大值
    ])
    .range([0, width])

  // 設置 y 軸比例尺
  const y = d3.scaleBand().domain(names).range([0, height]).padding(0.1)

  // 顏色比例
  const color = d3.scaleOrdinal().domain(categories).range(['#1f77b4', '#ff7f0e'])

  // 繪製條形圖
  svg
    .selectAll('g')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('x', d => x(d[0])) // 根據堆疊範圍從中間向外
    .attr('y', d => y(d.data.ageGroup))
    .attr('width', d => Math.abs(x(d[1]) - x(d[0]))) // 條形圖的寬度
    .attr('height', y.bandwidth())

  // x 軸
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5))

  // y 軸
  svg.append('g').call(d3.axisLeft(y))

  // 圖例
  const legend = svg
    .selectAll('.legend')
    .data(categories)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20})`)

  legend
    .append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', color)

  legend
    .append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text(d => d)
}

// 當元件掛載時渲染圖表
onMounted(() => {
  renderStackedBarChart(props.data)
})

// 當數據變更時重新渲染圖表
watch(
  () => props.data,
  newData => {
    renderStackedBarChart(newData)
  }
)
</script>

<style scoped>
.stacked-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
