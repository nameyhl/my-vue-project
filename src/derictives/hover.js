export default {
  mounted(el) {
    // 设置元素的初始样式
    el.style.transition = 'transform 0.3s ease' // 添加过渡效果

    // 鼠标移入时，放大 1.2 倍
    const handleMouseEnter = () => {
      el.style.transform = 'scale(1.1)'
      el.style.cursor = 'pointer' // 鼠标指针样式
    }

    // 鼠标移出时，恢复原始大小
    const handleMouseLeave = () => {
      el.style.cursor = 'normal' // 鼠标指针样式
      el.style.transform = 'scale(1)'
    }

    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)

    // 存储事件处理函数，以便在 unmounted 钩子中移除
    el._handleMouseEnter = handleMouseEnter
    el._handleMouseLeave = handleMouseLeave
  },
  unmounted(el) {
    // 清理事件监听器
    el.removeEventListener('mouseenter', el._handleMouseEnter)
    el.removeEventListener('mouseleave', el._handleMouseLeave)
  },
}
