<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, onUnmounted, ref } from 'vue'
const container = ref(null)
let scene, camera, renderer, controls, heart
let cameraZValue = ref(20) // 用于控制 camera 的 z 值

import drawData from '@/data.js'

const { lines, section } = drawData
const init = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // 获取组件宽高
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = cameraZValue.value
  // 创建渲染器
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)

  // 添加轨道控制器（orbitcontrols）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25

  controls.addEventListener('change', () => {
    cameraZValue.value = camera.position.z
  })
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const mesh = createElement(lines, section)
  scene.add(mesh)

  // 计算 mesh 的边界框
  mesh.geometry.computeBoundingBox()
  const boundingBox = mesh.geometry.boundingBox
  // 计算 mesh 的中心点
  const center = new THREE.Vector3()
  boundingBox.getCenter(center)
  // 将相机定位到 mesh 的中心点前方
  camera.position.copy(center)
  camera.position.z += 50 // 在 z 轴上后退一段距离以便观察
  // 设置相机的目标点为 mesh 的中心点
  if (controls) {
    controls.target.copy(center)
    controls.update()
  }

  anmate()
}

const createElement = (lines, section) => {
  let mesh
  // 1.常见截面形状
  const shape = new THREE.Shape()
  shape.moveTo(-section[0][1], section[0][0])
  for (let i = 1; i < section.length; i++) {
    shape.lineTo(-section[i][1], section[i][0])
  }

  // 2.创建运动轨迹
  const path = new THREE.CurvePath()

  lines.forEach((line) => {
    if (line.type === 1) {
      // 添加直线段
      const lineStart = new THREE.Vector3(0, line.startPoint[0], line.startPoint[1])
      const lineEnd = new THREE.Vector3(0, line.endPoint[0], line.endPoint[1])
      path.add(new THREE.LineCurve3(lineStart, lineEnd))
    }
    if (line.type === 2) {
      // 添加圆弧段
      const arcPoints = []
      const arcCenter = new THREE.Vector2(line.center[0], line.center[1])
      const arcRadius = line.radius
      // 计算圆弧的起点和终点角度
      let startAngle = Math.atan2(
        line.startPoint[1] - line.center[1],
        line.startPoint[0] - line.center[0],
      )
      let endAngle = Math.atan2(
        line.endPoint[1] - line.center[1],
        line.endPoint[0] - line.center[0],
      )
      // 判断优弧/劣弧
      let angleDiff = endAngle - startAngle
      if (line.clockwise) {
        // 顺时针方向
        if (angleDiff > 0) angleDiff -= Math.PI * 2
      } else {
        // 逆时针方向
        if (angleDiff < 0) angleDiff += Math.PI * 2
      }

      // 生成圆弧上的点
      const arcSegmentCount = 32
      // 判断方向，默认顺时针，line.direction 为 1 时逆时针
      for (let i = 0; i <= arcSegmentCount; i++) {
        const t = i / arcSegmentCount
        const angle = startAngle + angleDiff * t
        const x = arcCenter.x + arcRadius * Math.cos(angle)
        const y = arcCenter.y + arcRadius * Math.sin(angle)
        arcPoints.push(new THREE.Vector3(0, x, y))
      }
      // 将圆弧点添加到路径
      path.add(new THREE.CatmullRomCurve3(arcPoints))
    }
  })
  console.log(path)

  // 3.创建拉伸集合体
  const extrudeSettings = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: path,
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

  // 移除原有的顶点颜色设置逻辑
  // 7. 创建材质，将颜色设置为 #ccc
  const material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
    flatShading: true,
    transparent: true,
    opacity: 0.9,
    shininess: 100,
  })

  // 8. 创建网格对象
  mesh = new THREE.Mesh(geometry, material)
  console.log(mesh)

  return mesh
}

const anmate = () => {
  requestAnimationFrame(anmate)
  // 更新控制器
  if (controls) {
    controls.update()
  }
  // 旋转心形
  if (heart) {
  }
  // 旋转立方体
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  // 清理资源，防止内存泄漏
  if (controls) {
    controls.dispose()
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>
<template>
  <div ref="container" class="three_container"></div>
</template>
<style scoped>
.three_container {
  width: 100vw;
  height: 100vh;
}
</style>
