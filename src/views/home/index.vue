<script setup>
import { ref } from 'vue'

import greedSnake from '@/assets/gameLogo/greedySnake.png'
import logo2048 from '@/assets/gameLogo/2048.png'
import shoutLogo from '@/assets/gameLogo/shout.png'
import cesiumLogo from '@/assets/gameLogo/cesium.png'
import ThreeJS from '@/assets/gameLogo/ThreeJS.png'
import cesium3D from '@/assets/gameLogo/3Dcesium.png'
import cesiumWithThreeJs from '@/assets/gameLogo/cesiumWithThreeJs.png'
import create3D from '@/assets/gameLogo/create3D.png'
import segmentation3DCesium from '@/assets/gameLogo/segmentation3DCesium.png'
import coorSys from '@/assets/gameLogo/coorSys.png'
import lookMarckDown from '@/assets/gameLogo/lookMarkDown.png'

const gameList = ref([
  {
    name: '像素贪吃蛇',
    logo: greedSnake,
    url: '/greedySnake',
  },
  {
    name: '2048',
    logo: logo2048,
    url: '/2048',
  },
  {
    name: '射击小游戏',
    logo: shoutLogo,
    url: '/shout',
  },
  {
    name: '天地图',
    logo: cesiumLogo,
    url: '/cesium',
  },
  {
    name: '腾讯地图',
    logo: cesiumLogo,
    url: '/moveHouse',
  },
  {
    name: '3D',
    logo: ThreeJS,
    url: '/3DRouble',
  },
  {
    name: 'cesium整段创建三维模型',
    logo: cesium3D,
    url: '/3Dcesium',
  },
  {
    name: 'cesium与ThreeJS结合创建三维模型',
    logo: cesiumWithThreeJs,
    url: '/cesiumWithThreeJs',
  },
  {
    name: 'cesium分段创建三维模型',
    logo: segmentation3DCesium,
    url: '/segmentation3DCesium',
  },
  {
    name: 'ThreeJs创建3D模型',
    logo: create3D,
    url: '/create3D',
  },
  {
    name: 'canvas自定义创建的网格表',
    logo: coorSys,
    url: '/coorSys',
  },
  {
    name: '预览markDown文件',
    logo: lookMarckDown,
    url: '/markDown',
  },
])
</script>
<template>
  <div class="main">
    <div class="container" style="background-color: #fff; height: 100vh">
      <div class="title"></div>
      <div class="body">
        <div
          v-hover
          class="box"
          v-for="item in gameList"
          :key="item.url"
          @click="$router.push(item.url)"
        >
          <div class="imgBox">
            <img
              :src="item.logo"
              :alt="item.name"
              style="width: 80px; height: 80px; border-radius: 40px"
            />
          </div>
          <el-tooltip :content="item.name" placement="top">
            <div class="textBox">{{ item.name }}</div>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.main {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
.container {
  width: 1000px;
  margin: 0 auto;
  height: 100vh;
  background-color: #fff;
}
.body {
  width: 960px;
  display: flex;
  flex-wrap: wrap;
  margin: 0 20px;
}
.box {
  width: 80px;
  height: 150px;
  margin: 10px;
}
.imgBox {
  width: 80px;
  height: 80px;
  border-radius: 40px;
}
.textBox {
  height: 40px;
  line-height: 40px;
  margin-top: 30px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
