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
  {
    startPoint: [4298823.002, 599033.8977],
    endPoint: [4298831.9741, 598777.3631],
    type: 1,
  },
  {
    startPoint: [4298831.9741, 598777.3631],
    endPoint: [4298907.9834, 598680.0991],
    center: [4298936.91, 598781.0331],
    radius: 105,
    type: 2,
    clockwise: false,
  },
  {
    startPoint: [4298907.9834, 598680.0991],
    endPoint: [4299154.7249, 598609.3585],
    type: 1,
  },
  {
    startPoint: [4299154.7249, 598609.3585],
    endPoint: [4299270.7135, 598651.582],
    center: [4299183.6615, 598710.2926],
    radius: 105,
    type: 2,
    clockwise: false,
  },
  {
    startPoint: [4299270.7135, 598651.582],
    endPoint: [4299414.2422, 598864.3965],
    type: 1,
  },
  {
    startPoint: [4299414.2422, 598864.3965],
    endPoint: [4299409.9278, 598987.765],
    center: [4299327.1901, 598923.1071],
    radius: 105,
    type: 2,
    clockwise: false,
  },
  {
    startPoint: [4299409.9278, 598987.765],
    endPoint: [4299251.8819, 599190.0232],
    type: 1,
  },
  {
    startPoint: [4299251.8819, 599190.0232],
    endPoint: [4299133.2269, 599224.0401],
    center: [4299169.1443, 599125.3743],
    radius: 105,
    type: 2,
    clockwise: false,
  },
]
// 1. 定义运动轨迹数据
let lines = []

lineData.forEach((item) => {
  if (item.lineType === 1) {
    lines.push({
      startPoint: [Number(item.startDropX), Number(item.startDropY)], // 起点
      endPoint: [Number(item.endDropX), Number(item.endDropY)], // 终点
      type: 1, // 直线
    })
  }
  if (item.lineType === 2) {
    lines.push({
      startPoint: [Number(item.startDropX), Number(item.startDropY)], // 起点
      endPoint: [Number(item.endDropX), Number(item.endDropY)], // 终点
      center: [Number(item.centerDropX), Number(item.centerDropY)], // 圆心
      radius: Number(item.radius), // 半径
      type: 2, // 圆弧
      clockwise: item.direction === 2 ? true : false, // 顺时针
    })
  }
})

// 2. 定义截面形状
const section = [
  [-10, -10],
  [-5, -5],
  [0, 0],
  [5, 0],
  [10, -5],
  [15, -5],
  [20, -10],
]

const hle = [
  {
    mileage: 0,
    height: 2314.44,
  },
  {
    mileage: 256.69,
    height: 2311.08,
  },
  {
    mileage: 388.64,
    height: 2307.2,
  },
  {
    mileage: 645.33,
    height: 2307.51,
  },
  {
    mileage: 777.28,
    height: 2308.73,
  },
  {
    mileage: 1033.97,
    height: 2299.96,
  },
  {
    mileage: 1165.92,
    height: 2305.97,
  },
  {
    mileage: 1422.61,
    height: 2308.9,
  },
  {
    mileage: 1554.56,
    height: 2302.43,
  },
  {
    mileage: 1811.25,
    height: 2306.32,
  },
  {
    mileage: 1943.19,
    height: 2314.44,
  },
]

export default {
  lines: lineData,
  section,
  hle,
}
