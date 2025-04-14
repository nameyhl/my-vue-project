<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
  <el-button type='primary' @click="flyToDaLian">飞往大连</el-button>
  <el-button type='primary' @click="flyToChengdu">飞往成都</el-button>
  <el-button type='primary' @click="flyToLNPU">飞往辽宁石油化工大学</el-button>
  <el-button type='primary' @click="flyToZZ">飞往大竹中学</el-button>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/');

let viewer = null;
let cubePosition = null;

onMounted(() => {
  // 设置 Cesium 的访问令牌，如果你有的话
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzFiMDc5Ni05YjE2LTQ2YWYtYmJlMi1mNzRhYWM5ZGY2ZGUiLCJpZCI6MjU2NzIxLCJpYXQiOjE3MzIxNTI4OTZ9.WTGHaY16gaELJeBQbjcL7fSbd21wUWvzZkTbG9D-uqw';

// 没有地球可能是地形加载失败导致的，下面为你确保地形加载正常
// 尝试使用 Ion 资源加载地形，同时设置访问令牌

  // 创建 Cesium Viewer 实例
  viewer = new Cesium.Viewer('cesiumContainer', {
    // 移除一些默认控件
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    geocoder: false,
  });

  // 隐藏地球表面
//   viewer.scene.globe.show = false;

  // 修改相机交互行为，左键为移动，右键为俯仰角
  // 确保相机控制器启用
  viewer.scene.screenSpaceCameraController.enableInputs = true;

  // 设置右键拖动俯仰操作
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG];

  // 设置放大缩小的最大最小值
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100; // 最小缩放距离
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000000; // 最大缩放距离

  // 成都的经纬度和高度（单位：米）
  const chengduPosition = Cesium.Cartesian3.fromDegrees(104.09107514265429, 30.703094449201284, 0);
  // 大连的经纬度
  const daLianPosition = Cesium.Cartesian3.fromDegrees(121.51286327283768, 38.850599019545704, 0);

  // 计算大连到成都的距离
  const distance = Cesium.Cartesian3.distance(daLianPosition, chengduPosition);
  console.log(`大连到成都的距离: ${distance} 米`);
  
  // 大连和成都的中间距离
  const middlePosition = Cesium.Cartesian3.lerp(daLianPosition, chengduPosition, 0.5, new Cesium.Cartesian3());

  
  let label = {
    position: middlePosition, // 标签的位置
    label: {
      text: '大连到成都的距离: ' + distance.toFixed(2) + ' 米', // 标签的文本内容
      font: '16px sans-serif', // 字体样式
      style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 标签样式
    }
  }

  const line = {
    name: 'Line',
    polyline: {
      positions: [daLianPosition, chengduPosition], // 直线的起点和终点
      width: 5, // 线宽
      material: Cesium.Color.GREEN // 线的颜色  
    }
  }
  // 添加直线到场景
  viewer.entities.add(line)
  // 添加文字到场景
  viewer.entities.add(label)
  // 设置相机位置
  viewer.camera.setView({
    destination: chengduPosition,
    orientation: {
      heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
      // pitch: Cesium.Math.toRadians(-30), // 俯仰角，垂直倾斜角度
      roll: Cesium.Math.toRadians(0) // 翻滚角
    }
  });

  let boxSize_x = 1000; // 盒子的大小
  let boxSize_y = 1000; // 盒子的大小
  let boxSize_z = 1000; // 盒子的大小
  // 立方体位置，假设一个经纬度，这里简单用成都的经纬度加一个小偏移
  cubePosition = Cesium.Cartesian3.fromDegrees(104.065735 + 0.01, 30.572776 + 0.01, 1000);

  // 添加立方体实体
  viewer.entities.add({
    position: cubePosition,
    box: {
      dimensions: new Cesium.Cartesian3(boxSize_x, boxSize_y, boxSize_z),
      material: Cesium.Color.RED.withAlpha(0)
    }
  });

  // 添加地图双击事件，打印点击点的经纬度
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      console.log(`经度: ${longitude}, 纬度: ${latitude}`);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
});

const flyToDaLian = () => {
  // 大连的经纬度和高度（单位：米）
  const daLianPosition = Cesium.Cartesian3.fromDegrees(121.51286327283768, 38.850599019545704, 1000); 
  viewer.camera.flyTo({
      destination: daLianPosition,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        roll: Cesium.Math.toRadians(0)
      },
      duration: 3 // 飞行动画时长，单位：秒
    });
}
const flyToChengdu = () => {
  // 成都的经纬度和高度（单位：米）
  const chengduPosition = Cesium.Cartesian3.fromDegrees(104.09107514265429, 30.703094449201284, 1000)
  viewer.camera.flyTo({
      destination: chengduPosition,
      orientation: {
        heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
        roll: Cesium.Math.toRadians(0) // 翻滚角
      }, 
      duration: 3 // 飞行动画时长，单位：秒
    });
}

const flyToLNPU = () => {
  // 辽宁石油化工大学的经纬度和高度（单位：米）
  const LNPUPosition = Cesium.Cartesian3.fromDegrees(123.78024415648377, 41.853869300817585, 1000) 
  viewer.camera.flyTo({
      destination: LNPUPosition,
      orientation: {
        heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
        roll: Cesium.Math.toRadians(0) // 翻滚角  
      },
      duration: 3 // 飞行动画时长，单位：秒 
  })
}

const flyToZZ = () => {
    // 大竹中学经纬度
    const ZZPosition = Cesium.Cartesian3.fromDegrees(107.1881332645924, 30.729990628955097, 1000)
    viewer.camera.flyTo({
        destination: ZZPosition,
        orientation: {
            heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
            roll: Cesium.Math.toRadians(0) // 翻滚角
        },
        duration: 3 // 飞行动画时长，单位：秒
    });
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

#locateBoxBtn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
