<!-- components/WordCloudComponent.vue -->
<template>
  <div ref="wordCloudContainer" class="word-cloud"></div>
</template>

<script setup>
import * as d3 from 'd3'
import cloud from 'd3-cloud'

// 定義屬性
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  width: {
    type: Number,
    default: 800 // 增大寬度
  },
  height: {
    type: Number,
    default: 600 // 增大高度
  },
  minFontSize: {
    // 最小字體大小
    type: Number,
    default: 5
  },
  maxFontSize: {
    // 最大字體大小
    type: Number,
    default: 80 // 減少最大字體大小
  }
})

const wordCloudContainer = ref(null)

const renderWordCloud = data => {
  console.log('WordCloud data:', data) // 調試輸出

  // 取得數量範圍
  const counts = Object.values(data)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  // 使用 D3 的比例縮放來動態調整字體大小
  const fontSizeScale = d3
    .scalePow()
    .exponent(0.5) // 平方根比例縮放
    .domain([minCount, maxCount])
    .range([props.minFontSize, props.maxFontSize])

  const wordList = Object.entries(data).map(([word, count]) => ({
    text: word,
    size: fontSizeScale(count) // 根據比例縮放設置字體大小
  }))

  //   console.log('Word list:', wordList)

  const layout = cloud()
    .size([props.width, props.height])
    .words(wordList)
    .padding(5)
    .rotate(0)
    //.rotate(() => (Math.random() > 0.5 ? 0 : 90)) //  0 度或 90 度旋轉
    .font('Arial')
    .fontSize(d => d.size)
    .on('end', draw)

  layout.start()

  function draw(words) {
    // console.log('Drawing words:', words)

    // 清空之前的詞雲
    d3.select(wordCloudContainer.value).selectAll('*').remove()

    // SVG 和群組
    d3.select(wordCloudContainer.value)
      .append('svg')
      .attr('width', props.width)
      .attr('height', props.height)
      .append('g')
      .attr('transform', `translate(${props.width / 2},${props.height / 2})`)
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('font-family', 'Arial')
      .style('fill', () => `hsl(${Math.random() * 360},100%,50%)`)
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
      .text(d => d.text)
  }
}

onMounted(() => {
  renderWordCloud(props.data)
})

watch(
  () => props.data,
  newData => {
    renderWordCloud(newData)
  }
)
</script>

<style lang="scss" scoped>
.word-cloud {
  width: 100%;
  height: 100%;
}
</style>
