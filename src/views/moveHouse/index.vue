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

let x = ref(-2382566)
let y = ref(9493329)
let z = ref(3200000)

const clickSmall = () => {
  z.value -= 10000
  console.log(z.value)
}
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
  viewer.scene.globe.show = false
  // 关闭大气效果
  viewer.scene.skyAtmosphere.show = false
  // 关闭星空背景
  viewer.scene.skyBox.show = false

  // 修改相机交互行为，左键为移动，右键为俯仰角
  // 确保相机控制器启用
  viewer.scene.screenSpaceCameraController.enableInputs = true

  // 设置右键拖动俯仰操作
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  // 设置放大缩小的最大最小值
  // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100 // 最小缩放距离
  // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000000 // 最大缩放距离

  let x = 120,
    y = 150,
    z = 144000
  // 把xyz转化为经纬度高度
  // 笛卡尔坐标为x,y,z把他转为经纬度
  let cartesian = new Cesium.Cartesian3(x, y, z)
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  let longitude = Cesium.Math.toDegrees(cartographic.longitude)
  let latitude = Cesium.Math.toDegrees(cartographic.latitude)
  let height = cartographic.height

  let boxPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  let cameraPosition = new Cesium.Cartesian3(longitude, latitude, height + 100)

  // 设置相机位置
  viewer.camera.setView({
    destination: cameraPosition,
    orientation: {
      heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
      // pitch: Cesium.Math.toRadians(-30), // 俯仰角，垂直倾斜角度
      roll: Cesium.Math.toRadians(0), // 翻滚角
    },
  })

  // 把鼠标左键拖动事件改为笛卡尔坐标系水平平移

  let box = new Cesium.BoxGraphics({
    dimensions: new Cesium.Cartesian3(1000000, 1000000, 1000000),
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
