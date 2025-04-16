<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
const container = ref(null)
let scene, camera, renderer, cube, controls, heart, axesHelper, rotundity
let cameraZValue = ref(20) // 用于控制 camera 的 z 值
let ballList = ref([]) // 用于存储小球的数组
let getLengthForm = ref({
  startBall: null, // 起始小球
  endBall: null, // 结束小球
})
const init = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000)
  cameraZValue.value = camera.position.z
  // 创建渲染器
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(500, 500)
  container.value.appendChild(renderer.domElement)

  // 添加轨道控制器（orbitcontrols）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25

  controls.addEventListener('change', () => {
    cameraZValue.value = camera.position.z
  })

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
  const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
  // 球体的位置
  rotundity = new THREE.Mesh(geometry2, material2)
  rotundity.position.x = randomX
  rotundity.position.y = randomY
  ballList.value.push(rotundity)
  scene.add(rotundity)

  // 添加坐标参考系
  axesHelper = new THREE.AxesHelper(5) // 长度为 5 的坐标轴
  scene.add(axesHelper)

  // 监听双击事件
  renderer.domElement.addEventListener('dblclick', addBallOnClick)
  // 监听单击事件
  renderer.domElement.addEventListener('click', handleBallClick)

  // 开始动画
  anmate()
}
// 计算两个物体之间的距离
const calculateDistance = (obj1, obj2) => {
  ElMessage.success(`两点的距离为: ${obj1.position.distanceTo(obj2.position)}`)
}

// 用于存储点击的小球
let clickedBalls = []

// 添加单击事件监听器，处理小球点击逻辑
const handleBallClick = (event) => {
  // 将鼠标位置归一化为设备坐标，范围从 -1 到 +1
  const mouse = new THREE.Vector2()
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // 创建射线投射器
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // 检测点击位置是否有小球
  const intersects = raycaster.intersectObjects(scene.children, true)
  let ballIntersected = null
  intersects.forEach((intersect) => {
    if (intersect.object.geometry instanceof THREE.SphereGeometry) {
      ballIntersected = intersect.object
    }
  })

  // 如果没有检测到小球，则终止
  if (!ballIntersected) return

  // 记录点击的小球
  clickedBalls.push(ballIntersected)
  if (!getLengthForm.value.startBall) {
    getLengthForm.value.startBall = ballIntersected.id
  } else {
    getLengthForm.value.endBall = ballIntersected.id
  }
  ballIntersected.material.color.set(0xff0000)
  // 当记录到两个点时，计算两点距离
  if (clickedBalls.length === 2) {
    calculateDistance(clickedBalls[0], clickedBalls[1])
    clickedBalls[0].material.color.set(0x00ff00)
    clickedBalls[1].material.color.set(0x00ff00)
    // 清空记录的小球
    clickedBalls = []
    getLengthForm.value.startBall = null
    getLengthForm.value.endBall = null
  }
}

// 添加双击事件监听器，在点击位置添加小球
const addBallOnClick = (event) => {
  // 将鼠标位置归一化为设备坐标，范围从 -1 到 +1
  const mouse = new THREE.Vector2()
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // 创建射线投射器
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // 射线与平面相交检测
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const intersectPoint = new THREE.Vector3()
  raycaster.ray.intersectPlane(plane, intersectPoint)

  // 检测点击位置是否有小球
  const intersects = raycaster.intersectObjects(scene.children, true)
  let hasSphere = false
  intersects.forEach((intersect) => {
    if (intersect.object.geometry instanceof THREE.SphereGeometry) {
      scene.remove(intersect.object)
      hasSphere = true
    }
  })

  // 如果没有检测到小球，则在点击位置添加小球
  if (!hasSphere) {
    const geometry = new THREE.SphereGeometry(1, 32, 32)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
    const ball = new THREE.Mesh(geometry, material)
    ball.position.copy(intersectPoint)
    ballList.value.push(ball)
    scene.add(ball)
  }
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
  ballList.value.push(ball)
  scene.add(ball)
}

watch(
  () => getLengthForm.value.startBall,
  (newBall, oldBall) => {
    ballList.value.forEach((item) => {
      if (item.id === newBall) {
        item.material.color.set(0xff0000)
      }
    })
    ballList.value.forEach((item) => {
      if (item.id === oldBall) {
        item.material.color.set(0x00ff00)
      }
    })
  },
)

watch(
  () => getLengthForm.value.endBall,
  (newBall, oldBall) => {
    ballList.value.forEach((item) => {
      if (item.id === newBall) {
        item.material.color.set(0xff0000)
      }
    })
    ballList.value.forEach((item) => {
      if (item.id === oldBall) {
        item.material.color.set(0x00ff00)
      }
    })
  },
)

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
let HaveAxesHelper = ref(true)

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

const watchBallList = () => {
  console.log('ballList', ballList.value)
}

const getLength = () => {
  const startBall = ballList.value.find((item) => item.id === getLengthForm.value.startBall)
  const endBall = ballList.value.find((item) => item.id === getLengthForm.value.endBall)
  if (startBall && endBall) {
    calculateDistance(startBall, endBall)
  } else {
    console.log('请选择小球')
  }
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
    <el-button type="primary" @click="clearOrAddCube">{{
      HaveCube ? '清除立方体' : '添加立方体'
    }}</el-button>
    <el-button type="primary" @click="clearOrAxesHelper">{{
      HaveAxesHelper ? '清除参考系' : '添加参考系'
    }}</el-button>
    <el-button type="primary" @click="addBall">添加球体</el-button>
    <el-button type="primary" @click="watchBallList">查看小球列表</el-button>
    <el-slider
      v-model="cameraZValue"
      :min="5"
      :max="50"
      @change="updateCameraZ"
      label="Camera Z值"
    />
  </div>
  <div class="getDetenceFormBody">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="起始小球">
        <el-select v-model="getLengthForm.startBall" placeholder="请选择起始小球">
          <el-option
            v-for="item in ballList"
            :key="item.id"
            :label="`球${item.id}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结束小球">
        <el-select v-model="getLengthForm.endBall" placeholder="请选择结束小球">
          <el-option
            v-for="item in ballList"
            :key="item.id"
            :label="`球${item.id}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getLength">计算距离</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div ref="container" class="three_container"></div>
</template>
<style scoped>
.three_container {
  width: 500px;
  height: 500px;
}
</style>
