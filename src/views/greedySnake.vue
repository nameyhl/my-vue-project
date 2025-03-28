<template>
  <canvas id="game-board" width="400" height="400"></canvas>
  <div v-if="isGameOver" class="game-over">
    <p>Game Over!</p>
    <button @click="restartGame">Restart</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const ROWS = 20
const COLS = 20
const INITIAL_LENGTH = 3
const CELL_SIZE_RATIO = 0.8 // 调整蛇和食物的大小比例

const getRandomPosition = () => {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  }
}

const getInitialSnake = () => {
  const head = getRandomPosition()
  const snake = [head]
  let direction = Math.floor(Math.random() * 4) // 0: up, 1: down, 2: left, 3: right
  for (let i = 1; i < INITIAL_LENGTH; i++) {
    let newSegment
    switch (direction) {
      case 0:
        newSegment = { x: head.x, y: head.y + i }
        break
      case 1:
        newSegment = { x: head.x, y: head.y - i }
        break
      case 2:
        newSegment = { x: head.x + i, y: head.y }
        break
      case 3:
        newSegment = { x: head.x - i, y: head.y }
        break
    }
    snake.push(newSegment)
  }
  return snake
}

const INITIAL_SNAKE = getInitialSnake()
const INITIAL_DIRECTION = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]

const board = ref(null)
const snake = ref(INITIAL_SNAKE)
const direction = ref(INITIAL_DIRECTION)
const food = ref(null)
const isGameOver = ref(false)
const canvas = ref(null)
const ctx = ref(null)
const isPaused = ref(false) // 新增一个状态来表示游戏是否暂停

const createFood = () => {
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    }
  } while (snake.value.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
  food.value = newFood
}

const drawBoard = () => {
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  const cellSize = (canvas.value.width / COLS) * CELL_SIZE_RATIO
  const offset = (canvas.value.width / COLS - cellSize) / 2
  snake.value.forEach((segment, index) => {
    ctx.value.fillStyle = '#0f0' // 蛇的颜色改为绿色，类似诺基亚版本
    if (index === 0) {
      ctx.value.beginPath()
      ctx.value.arc(
        (segment.x * canvas.value.width) / COLS + canvas.value.width / COLS / 2,
        (segment.y * canvas.value.height) / COLS + canvas.value.height / COLS / 2,
        cellSize / 2,
        0,
        2 * Math.PI,
      )
      ctx.value.fill()
    } else {
      ctx.value.fillRect(
        (segment.x * canvas.value.width) / COLS + offset,
        (segment.y * canvas.value.height) / COLS + offset,
        cellSize,
        cellSize,
      )
    }
  })
  if (food.value) {
    ctx.value.fillStyle = '#f00'
    ctx.value.fillRect(
      (food.value.x * canvas.value.width) / COLS + offset,
      (food.value.y * canvas.value.height) / COLS + offset,
      cellSize,
      cellSize,
    )
  }
}

const moveSnake = () => {
  if (isPaused.value) return // 如果游戏暂停，不执行移动逻辑
  const head = { ...snake.value[0] }
  switch (direction.value) {
    case 'up':
      head.y--
      break
    case 'down':
      head.y++
      break
    case 'left':
      head.x--
      break
    case 'right':
      head.x++
      break
  }

  if (
    head.x < 0 ||
    head.x >= COLS ||
    head.y < 0 ||
    head.y >= ROWS ||
    snake.value.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    // Game over
    isGameOver.value = true
    isPaused.value = true // 游戏结束时暂停游戏
    return
  }

  snake.value.unshift(head)

  if (head.x === food.value.x && head.y === food.value.y) {
    createFood()
  } else {
    snake.value.pop()
  }

  drawBoard()
}

const handleKeyDown = (event) => {
  if (isPaused.value) return // 如果游戏暂停，不处理键盘事件
  switch (event.key) {
    case 'ArrowUp':
      if (direction.value !== 'down') direction.value = 'up'
      break
    case 'ArrowDown':
      if (direction.value !== 'up') direction.value = 'down'
      break
    case 'ArrowLeft':
      if (direction.value !== 'right') direction.value = 'left'
      break
    case 'ArrowRight':
      if (direction.value !== 'left') direction.value = 'right'
      break
  }
}

const restartGame = () => {
  isGameOver.value = false
  isPaused.value = false // 重新开始游戏时恢复游戏状态
  snake.value = getInitialSnake()
  direction.value = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]
  createFood()
  drawBoard()
}

onMounted(() => {
  canvas.value = document.getElementById('game-board')
  ctx.value = canvas.value.getContext('2d')
  createFood()
  drawBoard()
  const intervalId = setInterval(moveSnake, 200)
  window.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    clearInterval(intervalId)
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style scoped>
#game-board {
  background-color: #000; /* 背景颜色改为黑色，类似诺基亚版本 */
  position: relative;
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
}

.game-over button {
  margin-top: 10px;
}
</style>
