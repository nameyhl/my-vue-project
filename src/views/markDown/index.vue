<template>
  <div>
    <input type="file" accept=".md,.markdown" @change="handleFileUpload" />

    <div class="markdown-container" v-if="renderedContent">
      <!-- 侧边目录 -->
      <div class="toc-container" ref="tocContainer">
        <div class="toc-title">目录</div>
        <div class="toc-content" v-html="tocContent"></div>
      </div>

      <!-- 主内容区 -->
      <div class="markdown-preview" ref="previewContainer" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default {
  setup() {
    const renderedContent = ref('')
    const tocContent = ref('')
    const previewContainer = ref(null)
    const tocContainer = ref(null)

    // 配置marked
    marked.setOptions({
      highlight: function (code, lang) {
        if (hljs.getLanguage(lang)) {
          return hljs.highlight(lang, code).value
        }
        return hljs.highlightAuto(code).value
      },
    })

    // 生成目录的函数
    const generateTOC = (html) => {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let tocHtml = '<ul>'

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1))
        const text = heading.textContent
        const id = heading.id || text.toLowerCase().replace(/[^\w]+/g, '-')
        heading.id = id

        tocHtml += `
          <li style="margin-left: ${(level - 1) * 15}px">
            <a href="#${id}">${text}</a>
          </li>
        `
      })

      tocHtml += '</ul>'
      return tocHtml
    }

    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const mdContent = e.target.result
        const htmlContent = marked.parse(mdContent)
        renderedContent.value = DOMPurify.sanitize(htmlContent)

        // 生成目录
        nextTick(() => {
          tocContent.value = generateTOC(renderedContent.value)
          addAnchorLinks()
          setupSmoothScroll()
          disableAnchorLinks() // 调用禁用a标签的函数
        })
      }
      reader.readAsText(file)
    }

    // 为标题添加锚点链接
    const addAnchorLinks = () => {
      if (!previewContainer.value) return

      const headings = previewContainer.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading) => {
        if (!heading.id) {
          heading.id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-')
        }
      })
    }

    // 设置平滑滚动
    const setupSmoothScroll = () => {
      if (!tocContainer.value) return

      tocContainer.value.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault()

          const targetId = this.getAttribute('href')
          const targetElement = document.querySelector(targetId)

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })

            // 更新URL哈希（可选）
            history.pushState(null, null, targetId)
          }
        })
      })
    }

    // 禁用文档内的a标签
    const disableAnchorLinks = () => {
      if (!previewContainer.value) return
      const anchors = previewContainer.value.querySelectorAll('a')
      anchors.forEach((anchor) => {
        anchor.style.pointerEvents = 'none'
        anchor.style.color = '#999' // 可选：改变颜色以表示禁用状态
      })
    }

    return {
      renderedContent,
      tocContent,
      previewContainer,
      tocContainer,
      handleFileUpload,
    }
  },
}
</script>

<style scoped>
.markdown-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
}

.toc-container {
  width: 250px;
  padding: 20px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  max-height: 90vh;
  overflow-y: auto;
}

.toc-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.toc-content {
  font-size: 14px;
}

.toc-content ul {
  list-style: none;
  padding-left: 15px;
}

.toc-content li {
  margin: 5px 0;
  cursor: pointer;
}

.toc-content li:hover {
  color: #1890ff;
}

.toc-content a {
  color: inherit;
  text-decoration: none;
}

.markdown-preview {
  flex: 1;
  padding: 20px;
  max-width: 800px;
}

/* 为标题添加锚点偏移，避免被固定导航栏遮挡 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  scroll-margin-top: 80px;
  position: relative;
}

/* Markdown内容样式 */
.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-preview pre {
  background: #f6f8fa;
  padding: 1em;
  border-radius: 3px;
  overflow-x: auto;
}

.markdown-preview code {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
}

input[type='file'] {
  margin: 20px 0;
  display: block;
}
</style>
