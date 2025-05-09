<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
  <el-button type="primary" @click="clickSmall">--</el-button>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

let viewer = null

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/')
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
  // 取消注释以显示地球
  viewer.scene.globe.show = false
  // 关闭大气效果
  viewer.scene.skyAtmosphere.show = false
  // 关闭星空背景
  viewer.scene.backgroundColor = new Cesium.Color(0.1, 0.2, 0.3, 1.0)

  // 设置放大缩小的最大最小值
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100 // 最小缩放距离
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000000 // 最大缩放距离

  /// 修改相机控制
  // ScreenSpaceCameraController.js #160 #192
  let cameraControl = viewer.scene.screenSpaceCameraController

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

  // 报错 "oneOverRadii is required" 通常是因为在调用 Cesium.Cartographic.fromCartesian 时，缺少必要的椭球体参数。
  // 可以通过传递 Cesium.Ellipsoid.WGS84 来解决这个问题。

  console.log(Cesium.Cartesian3.fromDegrees(114.0707, 22.5431, 10))

  let x = -2403826.4959479137,
    y = 5381202.542238743,
    z = 2430069.5996584026
  // 把 xyz 转换为经纬度高度，明确指定椭球体为 WGS84
  let cartographic = Cesium.Cartographic.fromCartesian(
    new Cesium.Cartesian3(x, y, z),
    Cesium.Ellipsoid.WGS84,
    new Cesium.Cartographic(),
  )
  let longitude = Cesium.Math.toDegrees(cartographic.longitude)
  let latitude = Cesium.Math.toDegrees(cartographic.latitude)
  let height = cartographic.height

  let boxPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  // 修正相机位置
  let cameraPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 10000 + 10)

  // 设置相机位置
  viewer.camera.setView({
    destination: cameraPosition,
    orientation: {
      heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
      pitch: Cesium.Math.toRadians(-30), // 俯仰角，垂直倾斜角度
      roll: Cesium.Math.toRadians(0), // 翻滚角
    },
  })

  let box = new Cesium.BoxGraphics({
    dimensions: new Cesium.Cartesian3(10000, 10000, 10000),
    material: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.BLACK,
  })
  viewer.entities.add({
    position: boxPosition,
    box: box,
  })
})
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
