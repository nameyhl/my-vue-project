<template>
  <div id="game-container">
    <button @click="startGame">开始游戏</button>
    <div>分数: {{ score }}</div>
    <div class="grid-container">
      <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="grid-row">
        <div
          v-for="(cell, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          :class="['grid-cell', `tile-${cell}`]"
          :style="{ opacity: cell === 0 ? 0.5 : 1 }"
          transition="fade"
        >
          {{ cell === 0 ? '' : cell }}
        </div>
      </div>
    </div>
    <div v-if="isGameOver">游戏结束！</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const grid = ref([
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
])
const score = ref(0)
const isGameOver = ref(false)

const addRandomTile = () => {
  const emptyCells = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid.value[i][j] === 0) {
        emptyCells.push({ i, j })
      }
    }
  }
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    grid.value[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4
  }
}

const moveLeft = () => {
  const originalGrid = JSON.parse(JSON.stringify(grid.value))
  for (let i = 0; i < 4; i++) {
    let newRow = []
    let merged = [false, false, false, false]
    for (let j = 0; j < 4; j++) {
      if (grid.value[i][j] !== 0) {
        if (
          newRow.length > 0 &&
          newRow[newRow.length - 1] === grid.value[i][j] &&
          !merged[newRow.length - 1]
        ) {
          newRow[newRow.length - 1] *= 2
          score.value += newRow[newRow.length - 1]
          merged[newRow.length - 1] = true
        } else {
          newRow.push(grid.value[i][j])
        }
      }
    }
    while (newRow.length < 4) {
      newRow.push(0)
    }
    grid.value[i] = newRow
  }
  return !isSameGrid(originalGrid, grid.value)
}

const moveRight = () => {
  const originalGrid = JSON.parse(JSON.stringify(grid.value))
  for (let i = 0; i < 4; i++) {
    let newRow = []
    let merged = [false, false, false, false]
    for (let j = 3; j >= 0; j--) {
      if (grid.value[i][j] !== 0) {
        if (
          newRow.length > 0 &&
          newRow[newRow.length - 1] === grid.value[i][j] &&
          !merged[newRow.length - 1]
        ) {
          newRow[newRow.length - 1] *= 2
          score.value += newRow[newRow.length - 1]
          merged[newRow.length - 1] = true
        } else {
          newRow.push(grid.value[i][j])
        }
      }
    }
    newRow.reverse()
    while (newRow.length < 4) {
      newRow.unshift(0)
    }
    grid.value[i] = newRow
  }
  return !isSameGrid(originalGrid, grid.value)
}

const moveUp = () => {
  const originalGrid = JSON.parse(JSON.stringify(grid.value))
  for (let j = 0; j < 4; j++) {
    let newCol = []
    let merged = [false, false, false, false]
    for (let i = 0; i < 4; i++) {
      if (grid.value[i][j] !== 0) {
        if (
          newCol.length > 0 &&
          newCol[newCol.length - 1] === grid.value[i][j] &&
          !merged[newCol.length - 1]
        ) {
          newCol[newCol.length - 1] *= 2
          score.value += newCol[newCol.length - 1]
          merged[newCol.length - 1] = true
        } else {
          newCol.push(grid.value[i][j])
        }
      }
    }
    while (newCol.length < 4) {
      newCol.push(0)
    }
    for (let i = 0; i < 4; i++) {
      grid.value[i][j] = newCol[i]
    }
  }
  return !isSameGrid(originalGrid, grid.value)
}

const moveDown = () => {
  const originalGrid = JSON.parse(JSON.stringify(grid.value))
  for (let j = 0; j < 4; j++) {
    let newCol = []
    let merged = [false, false, false, false]
    for (let i = 3; i >= 0; i--) {
      if (grid.value[i][j] !== 0) {
        if (
          newCol.length > 0 &&
          newCol[newCol.length - 1] === grid.value[i][j] &&
          !merged[newCol.length - 1]
        ) {
          newCol[newCol.length - 1] *= 2
          score.value += newCol[newCol.length - 1]
          merged[newCol.length - 1] = true
        } else {
          newCol.push(grid.value[i][j])
        }
      }
    }
    newCol.reverse()
    while (newCol.length < 4) {
      newCol.unshift(0)
    }
    for (let i = 0; i < 4; i++) {
      grid.value[i][j] = newCol[i]
    }
  }
  return !isSameGrid(originalGrid, grid.value)
}

const isSameGrid = (grid1, grid2) => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid1[i][j] !== grid2[i][j]) {
        return false
      }
    }
  }
  return true
}

const isGameOverCheck = () => {
  const originalGrid = JSON.parse(JSON.stringify(grid.value))
  const canMoveLeft = moveLeft()
  grid.value = JSON.parse(JSON.stringify(originalGrid))
  const canMoveRight = moveRight()
  grid.value = JSON.parse(JSON.stringify(originalGrid))
  const canMoveUp = moveUp()
  grid.value = JSON.parse(JSON.stringify(originalGrid))
  const canMoveDown = moveDown()
  grid.value = JSON.parse(JSON.stringify(originalGrid))
  return !canMoveLeft && !canMoveRight && !canMoveUp && !canMoveDown
}

const handleKeyDown = (event) => {
  if (isGameOver.value) return
  let moved = false
  switch (event.key) {
    case 'ArrowLeft':
      moved = moveLeft()
      break
    case 'ArrowRight':
      moved = moveRight()
      break
    case 'ArrowUp':
      moved = moveUp()
      break
    case 'ArrowDown':
      moved = moveDown()
      break
  }
  if (moved) {
    addRandomTile()
    isGameOver.value = isGameOverCheck()
    if (isGameOver.value) {
      endGame()
    }
  }
}

const startGame = () => {
  grid.value = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  score.value = 0
  isGameOver.value = false
  addRandomTile()
  addRandomTile()
  window.addEventListener('keydown', handleKeyDown)
}

const endGame = () => {
  window.removeEventListener('keydown', handleKeyDown)
}

// 移除 onMounted 钩子，避免页面加载时自动开始游戏
</script>

<style scoped>
#game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #faf8ef;
  flex-direction: column;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-template-rows: repeat(4, 100px);
  gap: 10px;
  background-color: #bbada0;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.grid-row {
  display: contents;
}

.grid-cell {
  background-color: rgba(238, 228, 218, 0.35);
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
}

.tile-2 {
  background-color: #eee4da;
  color: #776e65;
}

.tile-4 {
  background-color: #ede0c8;
  color: #776e65;
}

.tile-8 {
  background-color: #f2b179;
  color: #f9f6f2;
}

.tile-16 {
  background-color: #f59563;
  color: #f9f6f2;
}

.tile-32 {
  background-color: #f67c5f;
  color: #f9f6f2;
}

.tile-64 {
  background-color: #f65e3b;
  color: #f9f6f2;
}

.tile-128 {
  background-color: #edcf72;
  color: #f9f6f2;
  font-size: 40px;
}

.tile-256 {
  background-color: #edcc61;
  color: #f9f6f2;
  font-size: 40px;
}

.tile-512 {
  background-color: #edc850;
  color: #f9f6f2;
  font-size: 40px;
}

.tile-1024 {
  background-color: #edc53f;
  color: #f9f6f2;
  font-size: 32px;
}

.tile-2048 {
  background-color: #edc22e;
  color: #f9f6f2;
  font-size: 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
