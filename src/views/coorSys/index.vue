<script setup>
import { ref, onMounted, nextTick } from 'vue'

const canvasRef = ref(null)
// 缩放比例，初始为1
const scale = ref(1)
// 缩放步长
const scaleStep = 0.1

// 中心点坐标
let centerPoint = ref([0, 0])
// 画图数据
const data = ref([])
// x,y方向的最大值和最小值
let boundary = ref([0, 0, 0, 0])

// 网格线的间隔
let interval = 0

// 初始化画布
const initCanvas = (
  width = 1600,
  height = 300,
  drawData = [
    {
      type: 'line',
      startPoint: [2000, 1000],
      endPoint: [2500, 2000],
      color: 'red',
      lineWidth: 1,
    },
    {
      type: 'line',
      startPoint: [2500, 2000],
      endPoint: [3000, 1000],
      color: 'red',
      lineWidth: 1,
    },
    {
      type: 'line',
      startPoint: [3000, 1000],
      endPoint: [3000, 0],
      color: 'red',
      lineWidth: 1,
    },
    {
      type: 'line',
      startPoint: [3000, 0],
      endPoint: [2000, 0],
      color: 'red',
      lineWidth: 1,
    },
    {
      type: 'line',
      startPoint: [2000, 0],
      endPoint: [2000, 1000],
      color: 'red',
      lineWidth: 1,
    },
  ],
) => {
  // 给canvas设置宽高
  canvasRef.value.width = width
  canvasRef.value.height = height

  // 初始化数据
  data.value = drawData

  const ctx = canvasRef.value.getContext('2d')
  // 计算中心点
  centerPoint.value = [width / 2, height / 2]
  // drawData中的最小x和最小y
  let [xMin, yMin] = getMin(drawData)
  // drawData中的最大x和最大y
  let [xMax, yMax] = getMax(drawData)
  boundary.value = [xMin, yMin, xMax, yMax]
  // 绘制网格函数
  drawGrid(ctx, width, height, boundary.value, scale.value)
  console.log(getPoint(drawData))
  drawCross(ctx, centerPoint.value)
}

// 获取drawData中x轴和y轴的最大值
const getMax = (drawData) => {
  let xMax = 0
  let yMax = 0
  drawData.forEach((item) => {
    if (item.startPoint[0] > xMax) {
      xMax = item.startPoint[0]
    }
    if (item.startPoint[1] > yMax) {
      yMax = item.startPoint[1]
    }
  })
  return [xMax, yMax]
}

// 获取drawData中x轴和y轴的最大值
const getMin = (drawData) => {
  let xMin = 0
  let yMin = 0
  drawData.forEach((item) => {
    if (item.startPoint[0] < xMin) {
      xMin = item.startPoint[0]
    }
    if (item.startPoint[1] < yMin) {
      yMin = item.startPoint[1]
    }
  })
  return [xMin, yMin]
}

// 判断数组是否在二位数组中存在，不存在就插入
const insertIfNotExists = (arr, newItem) => {
  const exists = arr.some((item) => JSON.stringify(item) === JSON.stringify(newItem))

  if (!exists) {
    arr.push(newItem)
  }
  return arr
}

// 抽离绘制线路的点的始末坐标并且去重
const getPoint = (drawData) => {
  let pointList = []
  drawData.forEach((item) => {
    insertIfNotExists(pointList, item.startPoint)
    insertIfNotExists(pointList, item.endPoint)
  })
  let center = calculateCenter(pointList)
  return center
}

// 计算中心点的位置
const calculateCenter = (points) => {
  if (points.length === 0) return [0, 0]
  let sumX = 0
  let sumY = 0

  for (const point of points) {
    sumX += point[0]
    sumY += point[1]
  }

  return [sumX / points.length, sumY / points.length]
}

// 绘制网格
const drawGrid = (ctx, width, height, boundary, multiple, offset = [500, 100]) => {
  multiple = multiple.toFixed(1)
  let xmin = boundary[0] * multiple
  let xmax = boundary[2] * multiple
  // y方向取值范围
  let ymin = boundary[1] * multiple
  let ymax = boundary[3] * multiple

  // 一像素代表距离
  let xStep = (xmax - xmin) / width
  let yStep = (ymax - ymin) / height

  // 平移的偏移量
  xmax = xmax - offset[0] * 2
  xmin = xmin - offset[0] * 2
  ymax = ymax - offset[1] * 4
  ymin = ymin - offset[1] * 4

  // 每条线间隔距离
  let xinterval = 100

  // 第一条线的距离值
  let xFirst = Math.ceil(xmin / xinterval) * xinterval

  // i为x方向上的像素值 xcount为x方向上的第几条线
  let xcount = 0
  for (let i = (xFirst - xmin) / xStep; i < width; i += xinterval / xStep) {
    drawLine(ctx, {
      startPoint: [i, 0],
      endPoint: [i, height],
    })
    drawText(ctx, {
      text: xFirst + xcount * xinterval,
      coor: [i, height - 10],
      color: 'red',
    })
    xcount++
  }
  let yInterval = 200

  // y方向上的第一根线为向上取能被100整除的数字
  let yFirst = Math.ceil(ymin / yInterval) * yInterval
  let ycount = 0
  for (let i = (yFirst - ymin) / yStep; i < width; i += yInterval / yStep) {
    drawLine(ctx, {
      startPoint: [0, i],
      endPoint: [width, i],
    })
    drawText(ctx, {
      text: yFirst + ycount * yInterval,
      coor: [width - 50, i + 15],
      color: 'red',
    })
    ycount++
  }
}

// 绘制线条
const drawLine = (ctx, data) => {
  ctx.beginPath()
  ctx.moveTo(data.startPoint[0], data.startPoint[1])
  ctx.lineTo(data.endPoint[0], data.endPoint[1])
  ctx.strokeStyle = data.color ? data.color : 'rgb(0,0,0,0.3)'
  ctx.lineWidth = 1
  ctx.stroke()
}

// 写字
const drawText = (ctx, data) => {
  ctx.beginPath()
  ctx.font = '12px serif'
  ctx.fillStyle = data.color ? data.color : 'red'
  ctx.fillText(data.text, data.coor[0], data.coor[1])
}

// 绘制十字标
const drawCross = (ctx, data) => {
  ctx.beginPath()
  ctx.moveTo(data[0] - 2, data[1] - 2)
  ctx.lineTo(data[0] + 2, data[1] + 2)
  ctx.moveTo(data[0] - 2, data[1] + 2)
  ctx.lineTo(data[0] + 2, data[1] - 2)
  ctx.strokeStyle = data.color ? data.color : 'red'
  ctx.lineWidth = 1
  ctx.stroke()
}

// 记录鼠标是否按下
let isMouseDown = false
// 记录鼠标点击的位置
let mousePlace = [0, 0]
// 记录鼠标偏移量
let offset = [0, 0]

// 处理鼠标滚轮事件，实现缩放
const handleMouseWheel = (event) => {
  if (event.deltaY > 0) {
    // 向下滚动，缩小
    scale.value = Math.max(0.1, scale.value - scaleStep)
  } else {
    // 向上滚动，放大
    scale.value = Math.min(5, scale.value + scaleStep)
  }
  const ctx = canvasRef.value.getContext('2d')
  const width = canvasRef.value.width
  const height = canvasRef.value.height
  let [xmax, ymax, xmin, ymin] = boundary.value

  let need = [xmax, ymax, xmin, ymin]

  // 清除画布
  ctx.clearRect(0, 0, width, height)
  // 重新绘制网格
  drawGrid(ctx, width, height, need, scale.value)
  // 重新绘制十字标
  drawCross(ctx, centerPoint.value)
}

// 处理鼠标按下事件
const handleMouseDown = (event) => {
  isMouseDown = true
  // 记录鼠标点击的位置
  mousePlace = [event.offsetX, event.offsetY]
}

// 处理鼠标拖动事件
const handleMouseMove = (event) => {
  if (isMouseDown) {
    // 鼠标偏移量
    const offsetX = event.offsetX - mousePlace[0]
    const offsetY = event.offsetY - mousePlace[1]
    offset = [offsetX, offsetY]
    const width = canvasRef.value.width
    const height = canvasRef.value.height
    const ctx = canvasRef.value.getContext('2d')
    const drawData = data.value
    let [xMin, yMin] = getMin(drawData)
    let [xMax, yMax] = getMax(drawData)
    let boundary = [xMin, yMin, xMax, yMax]
    // 清除画布
    ctx.clearRect(0, 0, width, height)
    // 重新绘制网格
    drawGrid(ctx, width, height, boundary, scale.value, offset)
    // 重新绘制十字标
    drawCross(ctx, centerPoint.value)
  }
}

// 处理鼠标松开事件
const handleMouseUp = (event) => {
  isMouseDown = false
}

// 处理鼠标离开事件
const handlemouseLeave = (event) => {
  isMouseDown = false
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
defineExpose({
  initCanvas,
})
</script>
<template>
  <div ref="canvasContainer">
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handlemouseLeave"
      @wheel.prevent="handleMouseWheel"
      @mousemove="handleMouseMove"
    ></canvas>
  </div>
</template>
<style lang="less" scoped></style>
