<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
  <div class="operate">
    <!-- 相机飞行 -->
    <div class="flyBox">
      <el-button type="primary" v-for="item in cubeList" :key="item" @click="flyToCube(item)"
        >飞往{{ item.name }}</el-button
      >
    </div>
    <!-- 计算两点距离 -->
    <div class="destanceBox">
      <el-form style="margin: 0 auto">
        <el-form-item label="第一个位置">
          <el-select
            v-model="selectCubeEntity1"
            placeholder="请选择第一个盒子"
            @change="selectCube1"
          >
            <el-option
              v-for="item in cubeList"
              :key="item"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="第二个位置">
          <el-select
            v-model="selectCubeEntity2"
            placeholder="请选择第二个盒子"
            @change="selectCube2"
          >
            <el-option
              v-for="item in cubeList"
              :key="item"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="getDestance">计算距离</el-button>
      <div>{{ cube1.name }}和{{ cube2.name }}的距离为{{ distance }}</div>
    </div>
    <!-- 给两点连线 -->
    <div class="connection">
      <el-form style="margin: 0 auto">
        <el-form-item label="第一个点">
          <el-select v-model="selectLineCubeEntity1" placeholder="请选择第一个点">
            <el-option
              v-for="item in cubeList"
              :key="item"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="第二个点">
          <el-select v-model="selectLineCubeEntity2" placeholder="请选择第二个点">
            <el-option
              v-for="item in cubeList"
              :key="item"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="connect">连接两点</el-button>
    </div>
    <!-- 一些基础功能 -->
    <div class="basic">
      <!-- 到达最高视角 -->
      <el-button type="primary" @click="flyTo(0)">到达最高视角</el-button>
      <!-- 回到初始视角 -->
      <el-button type="primary" @click="flyTo(1)">回到初始视角</el-button>
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="请输入盒子名称" width="500" :before-close="handleClose">
    <span>盒子名称</span>
    <el-input v-model="cubeName" ref="input"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cercle">取消</el-button>
        <el-button type="primary" @click="sure"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 设置 Cesium 资源路径
Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/')

let viewer = null
let cubeList = ref([
  {
    id: 1,
    name: '成都',
    position: Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 1000),
    longitude: 104.08868521039491,
    latitude: 30.705575276418518,
  },
  {
    id: 2,
    name: '大连',
    position: Cesium.Cartesian3.fromDegrees(121.51286327283768, 38.850599019545704, 1000),
    longitude: 121.51286327283768,
    latitude: 38.850599019545704,
  },
  {
    id: 3,
    name: '辽宁石油化工大学',
    position: Cesium.Cartesian3.fromDegrees(123.78024415648377, 41.853869300817585, 1000),
    longitude: 123.78024415648377,
    latitude: 41.853869300817585,
  },
  {
    id: 4,
    name: '大竹中学',
    position: Cesium.Cartesian3.fromDegrees(107.1881332645924, 30.729990628955097, 1000),
    longitude: 107.1881332645924,
    latitude: 30.729990628955097,
  },
])
let cubeName = ref('')
let dialogVisible = ref(false)
let cube = null
let cubeEntity = ref({})
let selectCubeEntity1 = ref('')
let selectCubeEntity2 = ref('')
let cubeId = 5
let cubeLabel = {}
let input = ref(null)

const cercle = () => {
  dialogVisible.value = false
  cubeName.value = ''
}

const sure = () => {
  if (!cubeName.value) {
    ElMessage.error('请输入盒子名称')
    return
  }
  cubeLabel.label.text = cubeName.value
  viewer.entities.add(cubeLabel)
  viewer.entities.add(cube)
  cubeList.value.push({
    id: cubeId++,
    name: cubeName.value,
    ...cubeEntity,
  })
  cubeName.value = ''
  dialogVisible.value = false
}

let cube1 = ref({})
let cube2 = ref({})
const selectCube1 = (val) => {
  if (!val) {
    ElMessage.error('请选择第一个盒子')
    return
  }
  cube1.value = cubeList.value.find((item) => item.id == val)
  console.log(cube1.value)
}

const selectCube2 = (val) => {
  if (!val) {
    ElMessage.error('请选择第二个盒子')
    return
  }
  cube2.value = cubeList.value.find((item) => item.id == val)
  console.log(cube2.value)
}

let distance = ref('')

// 判断选择的两个盒子的距离
const getDestance = () => {
  let range
  range = Cesium.Cartesian3.distance(cube1.value.position, cube2.value.position).toFixed(2)

  if (range < 1000) {
    distance.value = range + '米'
  } else {
    distance.value = (range / 1000).toFixed(2) + '千米'
  }
}

// 选择两个需要连线的点
let selectLineCubeEntity1 = ref('')
let selectLineCubeEntity2 = ref('')

const connect = () => {
  if (!selectLineCubeEntity1.value || !selectLineCubeEntity2.value) {
    ElMessage.error('请选择两个点')
    return
  }
  let entity1 = cubeList.value.find((item) => item.id == selectLineCubeEntity1.value)
  let entity2 = cubeList.value.find((item) => item.id == selectLineCubeEntity2.value)

  const entity1Postion = new Cesium.Cartesian3.fromDegrees(entity1.longitude, entity1.latitude, 10)

  const entity2Postion = new Cesium.Cartesian3.fromDegrees(entity2.longitude, entity2.latitude, 10)
  const line = {
    name: 'Line',
    polyline: {
      positions: [entity1Postion, entity2Postion], // 直线的起点和终点
      width: 5, // 线宽
      material: Cesium.Color.GREEN, // 线的颜色
    },
  }
  viewer.entities.add(line)
  let middlePosition = Cesium.Cartesian3.lerp(
    entity1Postion,
    entity2Postion,
    0.5,
    new Cesium.Cartesian3(),
  )
  let length = Cesium.Cartesian3.distance(entity1Postion, entity2Postion).toFixed(2)
  if (length < 1000) {
    length = length + '米'
  } else {
    length = (length / 1000).toFixed(2) + '千米'
  }
  let label = {
    position: middlePosition, // 标签的位置
    label: {
      text: `${entity1.name}到${entity2.name}的距离:${length}`,
      font: '16px sans-serif', // 字体样式
      style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 标签样式
    },
  }
  viewer.entities.add(label)
}

const flyTo = (val) => {
  if (val == 0) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 5000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 3,
    })
  }
  if (val == 1) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 1000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 3,
    })
  }
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
  // // 天地图卫星影像服务
  // const satelliteProvider = new Cesium.WebMapTileServiceImageryProvider({
  //   url: 'https://t{s}.tianditu.gov.cn/img_w/wmts?tk=你的密钥&service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}',
  //   layer: 'img',
  //   style: 'default',
  //   format: 'image/jpeg',
  //   tileMatrixSetID: 'w',
  //   subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  //   maximumLevel: 18,
  //   credit: new Cesium.Credit('天地图卫星影像'),
  // })
  // viewer.imageryLayers.addImageryProvider(satelliteProvider)

  var token = 'e8563e4a3ddaf13f3eb7cc96e2b67a36'
  // 服务域名
  var tdtUrl = 'https://t{s}.tianditu.gov.cn/'
  // 服务负载子域
  var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']

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
  // 取消默认的双击事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  )

  // 叠加影像服务
  var imgMap = new Cesium.UrlTemplateImageryProvider({
    url: tdtUrl + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + token,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    maximumLevel: 18,
  })
  viewer.imageryLayers.addImageryProvider(imgMap)

  // 叠加国界服务
  var iboMap = new Cesium.UrlTemplateImageryProvider({
    url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + token,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    maximumLevel: 10,
  })
  viewer.imageryLayers.addImageryProvider(iboMap)

  // 叠加地形服务
  var terrainUrls = new Array()

  for (var i = 0; i < subdomains.length; i++) {
    var url = tdtUrl.replace('{s}', subdomains[i]) + 'mapservice/swdx?T=elv_c&tk=' + token
    terrainUrls.push(url)
  }

  // 添加天地图地名
  const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
    url: 'https://t{s}.tianditu.gov.cn/cia_w/wmts?tk=e8563e4a3ddaf13f3eb7cc96e2b67a36',
    layer: 'cia',
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: 'w',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 18,
    credit: new Cesium.Credit('天地图注记'),
  })
  viewer.imageryLayers.addImageryProvider(labelProvider)

  // 隐藏地球表面
  //   viewer.scene.globe.show = false;

  // 修改相机交互行为，左键为移动，右键为俯仰角
  // 确保相机控制器启用
  viewer.scene.screenSpaceCameraController.enableInputs = true

  // 设置右键拖动俯仰操作
  viewer.scene.screenSpaceCameraController.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG]

  // 设置放大缩小的最大最小值
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100 // 最小缩放距离
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 5000000 // 最大缩放距离

  // 成都的经纬度和高度（单位：米）
  const chengduPosition = Cesium.Cartesian3.fromDegrees(104.08868521039491, 30.705575276418518, 10)
  // 大连的经纬度
  const daLianPosition = Cesium.Cartesian3.fromDegrees(121.51286327283768, 38.850599019545704, 10)

  // 计算大连到成都的距离
  const distance = Cesium.Cartesian3.distance(daLianPosition, chengduPosition)
  console.log(`大连到成都的距离: ${distance} 米`)

  // 大连和成都的中间距离
  const middlePosition = Cesium.Cartesian3.lerp(
    daLianPosition,
    chengduPosition,
    0.5,
    new Cesium.Cartesian3(),
  )

  // 成都的经纬度和高度（单位：米）

  let label = {
    position: middlePosition, // 标签的位置
    label: {
      text: '大连到成都的距离: ' + distance.toFixed(2) + ' 米', // 标签的文本内容
      font: '16px sans-serif', // 字体样式
      style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 标签样式
    },
  }
  const line = {
    name: 'Line',
    polyline: {
      positions: [daLianPosition, chengduPosition], // 直线的起点和终点
      width: 5, // 线宽
      material: Cesium.Color.GREEN, // 线的颜色
    },
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
      roll: Cesium.Math.toRadians(0), // 翻滚角
    },
  })

  // 添加地图双击事件，打印点击点的经纬度，并在该位置添加一个立方体
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((movement) => {
    const cartesian = viewer.scene.globe.pick(
      viewer.camera.getPickRay(movement.position),
      viewer.scene,
    )
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      cube = {
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10), // 经纬度和高度（北京坐标）
        ellipsoid: {
          radii: new Cesium.Cartesian3(5, 5, 5), // X/Y/Z轴半径（相等时为球体）
          material: Cesium.Color.RED.withAlpha(0.8), // 材质（颜色+透明度）
          outlineColor: Cesium.Color.BLACK, // 轮廓线颜色
          outlineWidth: 2, // 轮廓线宽度
        },
      }
      console.log('点击位置：' + longitude + ', ' + latitude)

      dialogVisible.value = true
      cubeEntity = {
        longitude: longitude,
        latitude: latitude,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000),
      }
      cubeLabel = {
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 20),
        label: {
          text: '盒子',
          font: '16px sans-serif', // 字体样式
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 标签样式
        },
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
})

const flyToCube = (item) => {
  viewer.camera.flyTo({
    destination: item.position,
    orientation: {
      heading: Cesium.Math.toRadians(0), // 偏航角，水平旋转角度
      roll: Cesium.Math.toRadians(0), // 翻滚角
    },
    duration: 3, // 飞行动画时长，单位：秒
  })
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
.operate {
  background-color: #fff;
  width: 20%;
  position: fixed;
  top: 0px;
  left: 20px;
  z-index: 1000;
  padding: 10px 20px;
  cursor: pointer;
}
.flyBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}
.el-button + .el-button {
  margin: 5px 0;
}
.destanceBox {
  margin-top: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}
.connection {
  margin-top: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}
</style>
