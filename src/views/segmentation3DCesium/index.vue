<script setup>
import { onMounted, ref, render } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/')
let viewer = null

import data from '@/data.js'
import init, * as wasm from '/public/pkg/js_tools.js'

// 将单个数据变成经纬度
const toLonLat = async (point) => {
  await init()
  let lonLat = wasm.xy_2_lonlat_utm(point[0], point[1], 48)
  return new Promise((resolve) => {
    resolve(lonLat)
  })
}
// 批量转经纬度
const toLonLatMany = async (points) => {
  await init()
  let lonLats = wasm.xy_2_lonlat_utm_many(points, 48)
  return new Promise((resolve) => {
    resolve(lonLats)
  })
}

// 将圆弧段转换为多个点
const convertArcToPoints = (line) => {
  let arcPoints = []
  let pointNum = 20

  let center = {
    x: line.center[0],
    y: line.center[1],
  }
  let radius = line.radius
  let start = {
    x: line.startPoint[0],
    y: line.startPoint[1],
  }
  let end = {
    x: line.endPoint[0],
    y: line.endPoint[1],
  }

  // 获取圆弧的起点和终点角度
  let startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  let endAngle = Math.atan2(end.y - center.y, end.x - center.x)

  // 确保角度方向正确
  let angleDiff = endAngle - startAngle
  if (line.clockwise) {
    if (angleDiff > 0) angleDiff -= 2 * Math.PI
  } else {
    if (angleDiff < 0) angleDiff += 2 * Math.PI
  }

  // 生成圆弧上的点
  for (let i = 0; i <= pointNum; i++) {
    const f = i / pointNum
    const angle = startAngle + angleDiff * f
    const x = center.x + radius * Math.cos(angle)
    const y = center.y + radius * Math.sin(angle)
    arcPoints.push([Number(x), Number(y)])
  }
  return arcPoints
}

// 转换轨迹数据为Cartesian3数组
async function convertTrajectory1(lines) {
  // 获取轨迹上的点
  lines.forEach(async (line) => {
    let points = []
    if (line.type === 1) {
      points.push([line.startPoint[0], line.startPoint[1]])
      points.push([line.endPoint[0], line.endPoint[1]])
    } else if (line.type === 2) {
      points = points.concat(convertArcToPoints(line))
    }
    // 将所有points转换为经纬度
    let lonLats = await toLonLatMany(points)
    let positions = []
    for (let i = 0; i < lonLats.length; i += 2) {
      positions.push(Cesium.Cartesian3.fromDegrees(lonLats[i], lonLats[i + 1]))
    }
    createElement1(positions)
  })
}

const createElement1 = (positions) => {
  const shape = data.section.map((p) => new Cesium.Cartesian2(-p[0], p[1]))
  const entity = viewer.entities.add({
    name: '带圆弧的轨迹体积模型',
    polylineVolume: {
      positions: positions,
      shape: shape,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.7)),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      cornerType: Cesium.CornerType.ROUNDED,
      closeVolume: false, // 明确设置不闭合体积
    },
  })
  viewer.zoomTo(entity)
}

onMounted(async () => {
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
  // viewer.scene.globe.show = false
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

  // const element = await convertTrajectory1(data.lines)

  await convertTrajectory1(data.lines)
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
