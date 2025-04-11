<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, onUnmounted, ref, watch } from 'vue'
const container = ref(null)
let scene, camera, renderer, cube, controls, heart, axesHelper, rotundity
const cameraZValue = ref(20) // 用于控制 camera 的 z 值
const init = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000)
  camera.position.z = cameraZValue.value

  // 创建渲染器
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(500, 500)
  container.value.appendChild(renderer.domElement)

  // 添加轨道控制器（orbitcontrols）
  // controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true
  // controls.dampingFactor = 0.25

  // 创建立方体
  const geometry1 = new THREE.BoxGeometry(2, 1, 1)
  const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
  cube = new THREE.Mesh(geometry1, material1)
  scene.add(cube)

  // 随机生成一个-14-14的数字
  const randomX = Math.floor(Math.random() * 29) - 14
  const randomY = Math.floor(Math.random() * 29) - 14

  // 创建一个球体
  const geometry2 = new THREE.SphereGeometry(1, 32, 32)
  const material2 = new THREE.MeshBasicMaterial({ color: 'red', wireframe: false })
  // 球体的位置
  rotundity = new THREE.Mesh(geometry2, material2)
  rotundity.position.x = randomX
  rotundity.position.y = randomY
  scene.add(rotundity)

  // 创建新的心形几何体
  const heartShape = new THREE.Shape()
  const scale = 0.5 // 调整心形的大小
  const x = 0
  const y = 0

  // 绘制心形路径
  const t = 0.01 // 步长
  for (let i = 2 * Math.PI; i >= 0; i -= t) {
    // 反转循环方向
    const xPos = 16 * Math.pow(Math.sin(i), 3) * scale
    // 去掉负号来修正心形上下颠倒的问题
    const yPos =
      (13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i)) * scale
    if (i === 2 * Math.PI) {
      heartShape.moveTo(xPos + x, yPos + y)
    } else {
      heartShape.lineTo(xPos + x, yPos + y)
    }
  }

  const extrudeSettings = {
    steps: 20, // 增加步数使心形更平滑
    depth: 0.5, // 调整心形的深度
    bevelEnabled: false,
  }

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
  const material = new THREE.MeshPhongMaterial({
    color: 0xff69b4, // 红色
    specular: 0x555555,
    shininess: 30,
    side: THREE.DoubleSide, // 双面渲染，确保实心效果
  }) // 更换材质以获得更好的光照效果
  heart = new THREE.Mesh(geometry, material)
  scene.add(heart)

  // 添加坐标参考系
  axesHelper = new THREE.AxesHelper(5) // 长度为 5 的坐标轴
  scene.add(axesHelper)

  // 添加窗口变化监听

  // 开始动画
  anmate()
}

// 进度条改变时更新 camera 的 z 值
const updateCameraZ = (value) => {
  cameraZValue.value = value
  camera.position.z = value
}

watch(cameraZValue, (value) => {
  camera.position.z = value
})

// 添加球体
const addBall = () => {
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
  const ball = new THREE.Mesh(geometry, material)
  ball.position.x = Math.floor(Math.random() * 29) - 14
  ball.position.y = Math.floor(Math.random() * 29) - 14
  scene.add(ball)
}

const anmate = () => {
  requestAnimationFrame(anmate)

  // 旋转心形
  if (heart) {
  }

  // 旋转立方体

  renderer.render(scene, camera)
}

const onWindowResize = () => {
  camera.aspect = 500 / 500
  camera.updateProjectionMatrix()
  renderer.setSize(500, 500)
}

const cleanup = () => {
  window.removeEventListener('resize', onWindowResize)
  renderer.dispose()
}

let HaveCube = ref(true)
let HaveHeart = ref(true)
let HaveAxesHelper = ref(true)

const clearOrAddHeart = () => {
  if (HaveHeart.value) {
    // 移除心形
    scene.remove(heart)
  } else {
    // 添加心形
    scene.add(heart)
  }
  HaveHeart.value = !HaveHeart.value
}

const clearOrAddCube = () => {
  if (HaveCube.value) {
    // 移除立方体
    scene.remove(cube)
  } else {
    // 添加立方体
    scene.add(cube)
  }
  HaveCube.value = !HaveCube.value
}

const clearOrAxesHelper = () => {
  if (HaveAxesHelper.value) {
    // 移除坐标轴
    scene.remove(axesHelper)
  } else {
    // 添加坐标轴
    scene.add(axesHelper)
  }
  HaveAxesHelper.value = !HaveAxesHelper.value
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  cleanup()
})
</script>
<template>
  <div class="buttonBox">
    <el-button type="primary" @click="clearOrAddHeart">{{
      HaveHeart ? '清除心形' : '添加心形'
    }}</el-button>
    <el-button type="primary" @click="clearOrAddCube">{{
      HaveCube ? '清除立方体' : '添加立方体'
    }}</el-button>
    <el-button type="primary" @click="clearOrAxesHelper">{{
      HaveAxesHelper ? '清除参考系' : '添加参考系'
    }}</el-button>
    <el-button type="primary" @click="addBall">添加球体</el-button>
    <el-slider
      v-model="cameraZValue"
      :min="5"
      :max="50"
      @change="updateCameraZ"
      label="Camera Z值"
    />
  </div>
  <div ref="container" class="three_container"></div>
</template>
<style scoped>
.three_container {
  width: 500px;
  height: 500px;
}
</style>
