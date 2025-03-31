<template>
  <div id="game-container">
    <button @click="startGame" :disabled="isGameStarted">开始游戏</button>
    <button @click="endGame" :disabled="!isGameStarted">结束游戏</button>
    <div
      id="target"
      :style="{
        left: targetX + 'px',
        top: targetY + 'px',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
      }"
      @click="shoot"
      v-if="isGameStarted"
    ></div>
    <p v-if="isGameStarted">得分: {{ score }}</p>
    <p v-if="isGameStarted">倒计时: {{ countdown }}s</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      targetX: 0,
      targetY: 0,
      score: 0,
      gameWidth: 800,
      gameHeight: 600,
      countdown: 60,
      timer: null,
      isGameStarted: false,
    }
  },
  methods: {
    moveTarget() {
      this.targetX = Math.random() * (this.gameWidth - 30)
      this.targetY = Math.random() * (this.gameHeight - 30)
    },
    shoot() {
      if (this.countdown > 0) {
        this.score++
        // 点击后移动目标
        this.moveTarget()
      }
    },
    startCountdown() {
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.endGame()
        }
      }, 1000)
    },
    startGame() {
      this.isGameStarted = true
      this.score = 0
      this.countdown = 60
      this.moveTarget()
      this.startCountdown()
    },
    endGame() {
      this.isGameStarted = false
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
}
</script>

<style scoped>
#game-container {
  width: 800px;
  height: 600px;
  border: 1px solid black;
  position: relative;
}

#target {
  background-color: red;
  position: absolute;
}
</style>
