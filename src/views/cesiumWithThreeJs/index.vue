<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue' // 移除未使用的 render 导入
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as THREE from 'three'

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/')

let viewer = null,
  scene,
  camera,
  renderer

// 将Threejs相机和Cesium相机同步
const syncCameras = () => {
  if (!viewer || !viewer.scene) return // 增加空值检查

  // 从Cesium相机获取参数
  let cesiumCamera = viewer.scene.camera
  let position = cesiumCamera.positionWC
  let direction = cesiumCamera.directionWC
  let up = cesiumCamera.upWC

  // 更新Threejs相机参数
  camera.position.set(position.x, position.y, position.z)
  camera.lookAt(position.x + direction.x, position.y + direction.y, position.z + direction.z)
  camera.up.set(up.x, up.y, up.z)

  // 更新投影矩阵
  let frustum = cesiumCamera.frustum
  if (frustum instanceof Cesium.PerspectiveFrustum) {
    camera.fov = (frustum.fov * 180) / Math.PI
    camera.aspect = frustum.aspectRatio
    camera.near = frustum.near
    camera.far = frustum.far
    camera.updateProjectionMatrix()
  }

  // 更新渲染器尺寸
  if (viewer.canvas) {
    let width = viewer.canvas.clientWidth
    let height = viewer.canvas.clientHeight
    if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
  }

  // 渲染Three.js场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

import drawData from '@/data.js'

const { lines, section } = drawData

const createElement = (lines, section) => {
  let mesh
  // 1.创建截面形状
  const shape = new THREE.Shape()
  shape.moveTo(-section[0][0], section[0][1])
  for (let i = 1; i < section.length; i++) {
    shape.lineTo(-section[i][0], section[i][1])
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
  console.log('path', path)

  // 3.创建拉伸几何体
  const extrudeSettings = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: path,
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

  // 6. 为几何体添加颜色
  const positionAttribute = geometry.getAttribute('position')
  const colors = []
  const color = new THREE.Color()

  for (let i = 0; i < positionAttribute.count; i++) {
    const t = i / positionAttribute.count
    color.setHSL(t, 1.0, 0.5)
    colors.push(color.r, color.g, color.b)
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  // 7. 创建材质
  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    flatShading: true,
    transparent: true,
    opacity: 0.9,
    shininess: 100,
  })

  // 8. 创建网格对象
  mesh = new THREE.Mesh(geometry, material)
  return mesh
}

onMounted(() => {
  // 设置 Cesium 的访问令牌，如果你有的话
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzFiMDc5Ni05YjE2LTQ2YWYtYmJlMi1mNzRhYWM5ZGY2ZGUiLCJpZCI6MjU2NzIxLCJpYXQiOjE3MzIxNTI4OTZ9.WTGHaY16gaELJeBQbjcL7fSbd21wUWvzZkTbG9D-uqw'

  // 创建 Cesium Viewer 实例
  viewer = new Cesium.Viewer('cesiumContainer', {
    // 移除一些默认控件
    shouldAnimate: true, //是否允许动画
    selectionIndicator: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    showRenderLoopErrors: false,
    shadows: false,
  })

  // 抗锯齿
  viewer.scene.fxaa = true
  viewer.scene.postProcessStages.fxaa.enabled = false
  // 水雾特效
  viewer.scene.globe.showGroundAtmosphere = true
  // 设置最大俯仰角，[-90,0]区间内，默认为-30，单位弧度
  viewer.scene.screenSpaceCameraController.constrainedPitch = Cesium.Math.toRadians(-20)
  viewer.scene.screenSpaceCameraController.autoResetHeadingPitch = false
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [
    Cesium.CameraEventType.RIGHT_DRAG,
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH,
  ]
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [
    Cesium.CameraEventType.MIDDLE_DRAG,
    Cesium.CameraEventType.PINCH,
    {
      eventType: Cesium.CameraEventType.LEFT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL,
    },
    {
      eventType: Cesium.CameraEventType.RIGHT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL,
    },
  ]

  viewer.scene.globe.show = false

  // 创建three.js场景
  const threeContainer = document.createElement('div')
  viewer.container.appendChild(threeContainer)

  scene = new THREE.Scene()
  // 使用Cesium画布尺寸初始化相机
  const width = viewer.canvas.clientWidth
  const height = viewer.canvas.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(width, height)
  threeContainer.appendChild(renderer.domElement)

  // 设置THREEjs渲染器样式
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.pointerEvents = 'none'

  const cube2 = createElement(lines, section)
  scene.add(cube2)

  var geometry = new THREE.BoxGeometry(10000, 10000, 10000)
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube1 = new THREE.Mesh(geometry, material)
  scene.add(cube1)

  // 成都的经纬度和高度（单位：米）
  const chengduPosition = Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 10)
  positionModel(cube1, chengduPosition)
  positionModel(cube2, chengduPosition)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 1000),
    duration: 1,
  })

  // 开始同步相机
  syncCameras()
  // 监听 postUpdate 事件进行每帧同步
  viewer.scene.postUpdate.addEventListener(syncCameras)

  // 修改相机交互行为，左键为移动，右键为俯仰角
  // 确保相机控制器启用
  viewer.scene.screenSpaceCameraController.enableInputs = true

  // 设置右键拖动俯仰操作
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  // 设置放大缩小的最大最小值
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100 // 最小缩放距离
  // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000000 // 最大缩放距离
})

// 将模型放置在特定经纬度
function positionModel(model, position) {
  model.position.set(position.x, position.y, position.z)
}
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
