### data.js

是three.js和cesium创建三维模型的数据

### public/pkg

文件内为使用wasm将点坐标转化为经纬度的方法，有两个方法
xy_2_lonlat_utm: 将一个点坐标转换为经纬度。返回数据为经纬度的数组

xy_2_lonlat_utm_many: 批量将一个点数组转换为经纬度，返回数据为所有的的经纬度的数组，第一个为第一个点的经度，第二个为第二个点的维度以此类推

_使用方法_

```js
import init, * as wasm from '/public/pck/js_tools'

await init()
// 第三个参数不知道就传48
let lonlat = wasm.xy_2_lonlat_utm(1, 2, 48) //返回点[1,2] 的经纬度
// 最后一个参数和单个求一样,前面的参数为点坐标数组
let lonlats = wasm.xy_2_lonlat_utm_many([1, 2], [3, 4], 48) // 返回点[1,2],[3,4]的经纬度集合
```

### 3Dcesium

cesium使用PolylineVolumeGeometry创建三维模型并添加到相应位置,这个组件如果不该逻辑,绘图数据必须是相应格式,这个是直接创建三维模型,不是分段创建,这样可以避免分段创建是每段之间的误差产生,但是在最后相连时会存在一个小缝隙目前未解决

```js
//data.js中的数据
// 轨迹数据
let lineData = [
  {
    startPoint: [4299133.2269, 599224.0401],
    endPoint: [4298892.0205, 599136.2336],
    type: 1,
  },
  {
    startPoint: [4298892.0205, 599136.2336],
    endPoint: [4298823.002, 599033.8977],
    center: [4298927.9379, 599037.5678],
    radius: 105,
    type: 2,
    clockwise: false,
  },
]
// 截面数据
const section = [
  [-15, -10],
  [-10, -5],
  [-5, -5],
  [0, 0],
]

export default {
  lines: lineData,
  section,
}
```

![cesium整体创建三维模型](https://github.com/nameyhl/READMEPng/blob/master/%E6%95%B4%E4%BD%93%E5%88%9B%E5%BB%BA%E5%8D%95%E4%BD%8D%E6%A8%A1%E5%9E%8B.png)

### 3DGame

three.js的一些方法,比如:双击添加小球,计算两个小球的距离

![threejs的一些方法](https://github.com/nameyhl/READMEPng/blob/master/threejs.png)

### 2048

2048小游戏

![2048小游戏](https://github.com/nameyhl/READMEPng/blob/master/2048%E5%B0%8F%E6%B8%B8%E6%88%8F.png)

### cesium

cesium的一些方法,比如:双击添加位置,计算两个点之间的距离,视角飞跃,两点连线

![cesium的一些方法](https://github.com/nameyhl/READMEPng/blob/master/%E5%A4%A9%E5%9C%B0%E5%9B%BE.png)

### cesiumWithThreeJs

cesium集合threejs的模型,使用threejs创建模型,放入cesium中,这个方法时最差的一个创建三维模型的方法,应为三维模型的坐标没有和cesium可以使用的坐标绑定,会导致三维模型跟随视角的移动而移动

![cesium集合threejs](https://github.com/nameyhl/READMEPng/blob/master/cesium%E7%BB%93%E5%90%88cesium%E5%88%9B%E5%BB%BA%E6%A8%A1%E5%9E%8B.png)

### coorSys

自行封装的二维的网格,可以缩放,移动更具传进来的一些数据来绘制

![自定义coorsys](https://github.com/nameyhl/READMEPng/blob/master/%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BD%91%E6%A0%BC%E7%BB%84%E4%BB%B6.png)

### create3D

threejs创建三维模型,根据点坐标创建的,需要统一坐标系,不能放入cesium中使用,因为threejs和cesium的坐标系不同,cesium是一个球形的,threejs是正常三维的

![threejs创建模型](https://github.com/nameyhl/READMEPng/blob/master/threejs%E5%88%9B%E5%BB%BA%E6%A8%A1%E5%9E%8B.png)

### greedySnake

贪吃蛇游戏,canvas实现

![贪吃蛇小游戏](https://github.com/nameyhl/READMEPng/blob/master/%E8%B4%AA%E5%90%83%E8%9B%87%E5%B0%8F%E6%B8%B8%E6%88%8F.png)

### markDown

markDown文件预览

![预览markdown](https://github.com/nameyhl/READMEPng/blob/master/%E9%A2%84%E8%A7%88markdown%E6%96%87%E4%BB%B6.png)

### segmentation3DCesium

分段创建三维模型然后放入cesium中,相比一次性创建会存在一个问题:

每段之间会存在误差,包括第一次转换成经纬度和转换成cesium需要的数据,误差集成后每段之间就会存在缝隙

![分段创建三维模型](https://github.com/nameyhl/READMEPng/blob/master/cesium%E5%88%86%E6%AE%B5%E5%88%9B%E5%BB%BA%E6%A8%A1%E5%9E%8B.png)

### shout

射击小游戏

![射击小游戏](https://github.com/nameyhl/READMEPng/blob/master/%E5%B0%84%E5%87%BB%E5%B0%8F%E6%B8%B8%E6%88%8F.png)
