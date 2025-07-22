<script setup>
import { onMounted, ref, render } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/')
let viewer = null

import data from '@/data.js'

// 转换轨迹数据为Cartesian3数组
function convertTrajectory(lines) {
  const positions = []
  for (const segment of lines) {
    if (segment.type === 1) {
      // 直线段
      positions.push(
        new Cesium.Cartesian3(
          5000, // x坐标设为0，因为是y-z平面运动
          segment.startPoint[0],
          segment.startPoint[1],
        ),
      )
      positions.push(new Cesium.Cartesian3(5000, segment.endPoint[0], segment.endPoint[1]))
    } else if (segment.type === 2) {
      // 圆弧段
      const arcPoints = generateArcPoints(segment)
      positions.push(...arcPoints)
    }
  }

  return positions
}

// 生成圆弧点
function generateArcPoints(arcSegment) {
  const points = []
  const [cx, cy] = arcSegment.center
  const radius = arcSegment.radius
  const startAngle = Math.atan2(arcSegment.startPoint[1] - cy, arcSegment.startPoint[0] - cx)
  const endAngle = Math.atan2(arcSegment.endPoint[1] - cy, arcSegment.endPoint[0] - cx)

  let angleDiff = endAngle - startAngle
  if (!arcSegment.clockwise && angleDiff < 0) {
    angleDiff += 2 * Math.PI
  } else if (arcSegment.clockwise && angleDiff > 0) {
    angleDiff -= 2 * Math.PI
  }

  const steps = 20 // 圆弧分段数
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (angleDiff * i) / steps
    const y = cx + radius * Math.cos(angle)
    const z = cy + radius * Math.sin(angle)
    points.push(new Cesium.Cartesian3(5000, y, z))
  }

  return points
}
const createElement = () => {
  // 定义折线路径
  const positions = convertTrajectory(data.lines)

  // 定义截面形状(相对于路径的局部坐标系)

  const shape = data.section.map((p) => new Cesium.Cartesian2(p[1], p[0]))

  // 创建几何体
  const geometry = new Cesium.PolylineVolumeGeometry({
    polylinePositions: positions,
    shapePositions: shape,
    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
    granularity: 0.01,
  })

  // 创建几何体实例
  const instance = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE.withAlpha(1.0)), // alpha改为1.0
    },
  })
  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        translucent: false,
        closed: true,
      }),
    }),
  )
}

onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzFiMDc5Ni05YjE2LTQ2YWYtYmJlMi1mNzRhYWM5ZGY2ZGUiLCJpZCI6MjU2NzIxLCJpYXQiOjE3MzIxNTI4OTZ9.WTGHaY16gaELJeBQbjcL7fSbd21wUWvzZkTbG9D-uqw'

  // 初始化Cesium Viewer，设置为平面模式
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

  // 隐藏地球
  viewer.scene.globe.show = false
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
  // 修改相机交互行为，左键为移动，右键为俯仰角
  // 确保相机控制器启用
  viewer.scene.screenSpaceCameraController.enableInputs = true

  // 设置右键拖动俯仰操作
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  const cameraControl = viewer.scene.screenSpaceCameraController

  //相机允许在地底移动
  cameraControl.enableCollisionDetection = false
  // Cesium.CameraEventType.RIGHT_DRAG -> Cesium.CameraEventType.MIDDLE_DRAG
  cameraControl.zoomEventTypes = cameraControl.zoomEventTypes.map((k) => {
    return Cesium.CameraEventType.RIGHT_DRAG === k ? Cesium.CameraEventType.MIDDLE_DRAG : k
  })
  // Cesium.CameraEventType.MIDDLE_DRAG -> Cesium.CameraEventType.RIGHT_DRAG
  cameraControl.tiltEventTypes = cameraControl.tiltEventTypes.map((k) => {
    return Cesium.CameraEventType.MIDDLE_DRAG === k ? Cesium.CameraEventType.RIGHT_DRAG : k
  })

  const element = createElement()

  // 计算元素的中心位置
  const positions = convertTrajectory(data.lines)
  let sumX = 0
  let sumY = 0
  let sumZ = 0
  for (const pos of positions) {
    sumX += pos.x
    sumY += pos.y
    sumZ += pos.z
  }
  const centerX = sumX / positions.length
  const centerY = sumY / positions.length
  const centerZ = sumZ / positions.length

  // 创建中心位置的 Cartesian3 对象
  const centerPosition = new Cesium.Cartesian3(centerX, centerY, centerZ)

  // 计算中心上方100m的位置（假设x轴为上方）
  const targetPosition = Cesium.Cartesian3.add(
    centerPosition,
    new Cesium.Cartesian3(100, 0, 0),
    new Cesium.Cartesian3(),
  )
  // 将相机定位到目标位置
  viewer.camera.setView({
    destination: targetPosition,
    orientation: {
      heading: Cesium.Math.toRadians(0), // 偏航角
      pitch: Cesium.Math.toRadians(-90), // 俯仰角，向下看
      roll: Cesium.Math.toRadians(0), // 翻滚角
    },
  })
})
</script>
<template>
  <div id="cesiumContainer"></div>
</template>
<style>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}
</style>
