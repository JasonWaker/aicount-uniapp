<template>
<view class="page" v-if="event">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">
      <text>倒数日 · 保存图片</text>
    </view>
  </view>

  <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view :class="'poster-preview ' + (selectedTemplate.tone ? 'poster-tone-' + selectedTemplate.tone : '')">
      <image v-if="selectedTemplate.image" class="poster-image" :src="selectedTemplate.image" mode="aspectFill"></image>
      <view class="poster-shade"></view>
      <view class="poster-copy">
        <text class="poster-kicker">距离{{event.title}}还有</text>
        <text class="poster-number">{{daysLeft}}</text>
        <text class="poster-unit">天</text>
        <view class="poster-divider"></view>
        <text class="poster-date">目标日：{{targetDateText}}</text>
      </view>
      <text class="poster-quote" v-if="posterQuote">“{{posterQuote}}”</text>
      <view class="poster-brand">
        <image src="/static/assets/icons/calendar-today.svg" mode="aspectFit"></image>
        <text>AI倒数日</text>
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x enhanced :show-scrollbar="false">
      <view class="category-row">
        <view
          :class="'category-chip ' + (activeCategory === item.id ? 'category-chip-active' : '')"
         
         
          :data-id="item.id"
          @tap="handleCategory"
         v-for="(item, index) in categories" :key="item.id">{{item.label}}</view>
      </view>
    </scroll-view>

    <view class="template-grid">
      <view
        :class="'template-card ' + (selectedTemplate.id === item.id ? 'template-card-active' : '') + ' ' + (item.tone ? 'template-tone-' + item.tone : '')"
       
       
        :data-id="item.id"
        @tap="handleSelectTemplate"
        hover-class="tap-press"
       v-for="(item, index) in library.templates" :key="item.id">
        <image v-if="item.image" class="template-image" :src="item.image" mode="aspectFill"></image>
        <view class="template-shade" v-if="item.image"></view>
        <view class="template-center">
          <text>{{item.id === 'popular-modern' ? item.subtitle : daysLeft}}</text>
        </view>
        <view class="pro-tag" v-if="item.pro">
          <image src="/static/assets/icons/star-filled.svg" mode="aspectFit"></image>
          <text>Pro</text>
        </view>
        <text class="template-name">{{item.title}}</text>
        <image v-if="selectedTemplate.id === item.id" class="selected-icon" src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="quote-box">
      <image src="/static/assets/icons/edit-note.svg" mode="aspectFit"></image>
      <textarea
        :value="posterQuote"
        maxlength="60"
        placeholder="写一点关于这个日子的寄语吧..."
        placeholder-class="quote-placeholder"
        @input="handleQuoteInput"
      ></textarea>
    </view>
  </view>

  <view class="bottom-actions">
    <view class="save-button" @tap="handleSave" hover-class="tap-press">
      <image src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
      <text>{{isSaving ? '生成中' : '保存'}}</text>
    </view>
    <button class="share-button" open-type="share" hover-class="tap-press">
      <image src="/static/assets/icons/share.svg" mode="aspectFit"></image>
      <text>分享</text>
    </button>
  </view>

  <canvas class="poster-canvas" type="2d" id="posterCanvas" canvas-id="posterCanvas"></canvas>
</view>
</template>

<script>
const { categories, getLibrary } = require("../../utils/template-library")
const { getEventById, updateEvent } = require("../../utils/event-store")

const DAY_MS = 86400000
const POSTER_WIDTH = 600
const POSTER_HEIGHT = 750

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getDaysLeft(target) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const targetTime = new Date(target.year, target.month - 1, target.day).getTime()
  return Math.max(0, Math.ceil((targetTime - today) / DAY_MS))
}

function getTargetDateText(target) {
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
  const date = new Date(target.year, target.month - 1, target.day)
  return `${target.year}年${target.month}月${target.day}日 ${weekdays[date.getDay()]}`
}

function getTemplate(library, templateId) {
  return library.templates.find((item) => item.id === templateId) || library.templates[0]
}

function getPosterCanvas(page) {
  return new Promise((resolve, reject) => {
    uni.createSelectorQuery()
      .in(page)
      .select("#posterCanvas")
      .fields({ node: true, size: true })
      .exec((result) => {
        const canvas = result && result[0] && result[0].node
        if (!canvas) {
          reject(new Error("Poster canvas is unavailable"))
          return
        }
        resolve(canvas)
      })
  })
}

function getCanvasImageCandidates(src) {
  if (!src) {
    return []
  }

  if (/^(https?:|wxfile:|data:|blob:)/.test(src)) {
    return [src]
  }

  return src.indexOf("/") === 0 ? [src] : [`/${src}`]
}

function loadCanvasImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage()
    const timer = setTimeout(() => {
      image.onload = null
      image.onerror = null
      reject(new Error(`Template image load timeout: ${src}`))
    }, 5000)

    image.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Unable to draw template image: ${src}`))
    }
    image.onload = () => {
      clearTimeout(timer)
      resolve({
        image,
        width: image.naturalWidth || image.width || POSTER_WIDTH,
        height: image.naturalHeight || image.height || POSTER_HEIGHT
      })
    }
    image.src = src
  })
}

async function createCanvasImage(canvas, src) {
  const candidates = getCanvasImageCandidates(src)
  let lastError = null

  for (let index = 0; index < candidates.length; index += 1) {
    try {
      return await loadCanvasImage(canvas, candidates[index])
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error(`Unable to draw template image: ${src}`)
}

function drawToneTemplateBackground(context, template, width, height) {
  const gradient = context.createLinearGradient(0, 0, width, height)

  if (template.tone === "love") {
    gradient.addColorStop(0, "#ffd1dc")
    gradient.addColorStop(1, "#f7a8ba")
  } else if (template.tone === "month") {
    gradient.addColorStop(0, "#343437")
    gradient.addColorStop(1, "#1f1f22")
  } else {
    gradient.addColorStop(0, "#28576b")
    gradient.addColorStop(0.48, "#f0b16a")
    gradient.addColorStop(1, "#22232d")
  }

  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

function drawCoverImage(context, source, width, height) {
  const scale = Math.max(width / source.width, height / source.height)
  const drawWidth = source.width * scale
  const drawHeight = source.height * scale
  context.drawImage(
    source.image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  )
}

function drawCenteredLines(context, text, centerX, startY, maxWidth, lineHeight) {
  const chars = Array.from(text || "")
  const lines = []
  let line = ""

  chars.forEach((char) => {
    const nextLine = line + char
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line)
      line = char
      return
    }
    line = nextLine
  })

  if (line) {
    lines.push(line)
  }

  lines.slice(0, 2).forEach((item, index) => {
    context.fillText(item, centerX, startY + index * lineHeight)
  })
}

function exportPosterCanvas(canvas, page) {
  const options = {
    x: 0,
    y: 0,
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    destWidth: canvas.width,
    destHeight: canvas.height,
    fileType: "jpg",
    quality: 0.96
  }

  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      ...options,
      canvas,
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: (error) => {
        console.warn("Poster 2d canvas export failed, retry with canvas-id", error)
        uni.canvasToTempFilePath({
          ...options,
          canvasId: "posterCanvas",
          success: ({ tempFilePath }) => resolve(tempFilePath),
          fail: reject
        }, page)
      }
    }, page)
  })
}

export default {
  data() {
    return {
    activeCategory: "popular",
    categories,
    contentTop: 88,
    daysLeft: 0,
    event: null,
    eventId: "",
    isSaving: false,
    isVip: false,
    library: getLibrary("popular"),
    navActionStyle: "",
    navShellStyle: "",
    posterQuote: "",
    selectedTemplate: null,
    targetDateText: ""
  }
  },
  onLoad(options) {
    this.eventId = decodeURIComponent(options.id || "")
    this.setupNavigation()
    this.loadPoster()
  },
  onShow() {
    this.setData({ isVip: getApp().getVipState() })
  },
  onShareAppMessage() {
    return {
      title: `${this.event.title}，还有 ${this.daysLeft} 天`,
      path: `/pages/event-detail/event-detail?id=${encodeURIComponent(this.eventId)}`,
      imageUrl: this.selectedTemplate && this.selectedTemplate.image
    }
  },
  methods: {
    setData(patch = {}, callback) {
      const nextData = patch || {}
      Object.keys(nextData).forEach((key) => {
        this[key] = nextData[key]
      })
      if (typeof callback === "function") {
        if (typeof this.$nextTick === "function") {
          this.$nextTick(() => callback.call(this))
        } else {
          callback.call(this)
        }
      }
    },
    setupNavigation() {
    const system = uni.getSystemInfoSync()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navShellStyle: `height:${navHeight}px;`,
      navActionStyle: `top:${menuTop}px;height:${menuHeight}px;`,
      contentTop: navHeight + 28
    })
  },
    loadPoster() {
    const event = getEventById(this.eventId)
    if (!event) {
      uni.showToast({ title: "事件不存在", icon: "none" })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }

    const storedPoster = event.poster || {}
    const activeCategory = storedPoster.category || "popular"
    const library = getLibrary(activeCategory)
    const selectedTemplate = getTemplate(library, storedPoster.templateId)

    this.setData({
      activeCategory,
      daysLeft: getDaysLeft(event.target),
      event,
      eventId: event.id,
      isVip: getApp().getVipState(),
      library,
      posterQuote: storedPoster.quote || event.note || "",
      selectedTemplate,
      targetDateText: getTargetDateText(event.target)
    })
  },
    handleBack() {
    uni.navigateBack()
  },
    handleCategory(event) {
    const activeCategory = event.currentTarget.dataset.id
    const library = getLibrary(activeCategory)

    this.setData({
      activeCategory,
      library,
      selectedTemplate: library.templates[0]
    })
  },
    handleSelectTemplate(event) {
    const selectedTemplate = getTemplate(this.library, event.currentTarget.dataset.id)

    if (selectedTemplate.pro && !this.isVip) {
      uni.showModal({
        title: "Pro 专属模板",
        content: "开通 Pro 后即可使用该模板及全部高级功能。",
        confirmText: "返回开通",
        success: ({ confirm }) => {
          if (confirm) {
            uni.navigateBack()
          }
        }
      })
      return
    }

    this.setData({ selectedTemplate })
  },
    handleQuoteInput(event) {
    this.setData({
      posterQuote: event.detail.value
    })
  },
    async handleSave() {
    if (this.isSaving || !this.selectedTemplate) {
      return
    }

    this.setData({ isSaving: true })
    uni.showLoading({ title: "正在生成海报" })

    try {
      const posterConfig = {
        category: this.activeCategory,
        templateId: this.selectedTemplate.id,
        quote: this.posterQuote.trim()
      }
      updateEvent(this.eventId, { poster: posterConfig })
      const posterPath = await this.renderPoster()
      await this.savePosterToAlbum(posterPath)

      uni.hideLoading()
      uni.showToast({
        title: "海报已保存",
        icon: "success"
      })
    } catch (error) {
      uni.hideLoading()
      console.error("Poster save failed", error)
      this.handleSaveFailure(error)
    } finally {
      this.setData({ isSaving: false })
    }
  },
    async renderPoster() {
    const template = this.selectedTemplate
    const canvas = await getPosterCanvas(this)
    const pixelRatio = 2
    canvas.width = POSTER_WIDTH * pixelRatio
    canvas.height = POSTER_HEIGHT * pixelRatio
    const context = canvas.getContext("2d")
    if (context.setTransform) {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    } else {
      context.scale(pixelRatio, pixelRatio)
    }
    context.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

    if (template.image) {
      const image = await createCanvasImage(canvas, template.image)
      drawCoverImage(context, image, POSTER_WIDTH, POSTER_HEIGHT)
    } else {
      drawToneTemplateBackground(context, template, POSTER_WIDTH, POSTER_HEIGHT)
    }

    const shade = context.createLinearGradient(0, 0, 0, POSTER_HEIGHT)
    shade.addColorStop(0, "rgba(0,0,0,0.18)")
    shade.addColorStop(0.55, "rgba(0,0,0,0.08)")
    shade.addColorStop(1, "rgba(0,0,0,0.52)")
    context.fillStyle = shade
    context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

    context.textAlign = "center"
    context.fillStyle = "#ffffff"
    context.font = "28px sans-serif"
    context.fillText(`距离${this.event.title}还有`, POSTER_WIDTH / 2, 230)
    context.font = "bold 144px sans-serif"
    context.fillText(String(this.daysLeft), POSTER_WIDTH / 2, 385)
    context.font = "26px sans-serif"
    context.fillText("天", POSTER_WIDTH / 2, 435)

    context.strokeStyle = "rgba(255,255,255,0.55)"
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(270, 470)
    context.lineTo(330, 470)
    context.stroke()

    context.font = "20px sans-serif"
    context.fillText(`目标日：${this.targetDateText}`, POSTER_WIDTH / 2, 525)

    const quote = this.posterQuote.trim()
    if (quote) {
      context.fillStyle = "rgba(255,255,255,0.9)"
      context.font = "23px sans-serif"
      drawCenteredLines(context, `“${quote}”`, POSTER_WIDTH / 2, 635, 460, 34)
    }

    context.textAlign = "right"
    context.fillStyle = "rgba(255,255,255,0.65)"
    context.font = "17px sans-serif"
    context.fillText("AI倒数日", 558, 714)

    await wait(120)

    return exportPosterCanvas(canvas, this)
  },
    savePosterToAlbum(filePath) {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: resolve,
        fail: reject
      })
    })
  },
    handleSaveFailure(error) {
    const message = String((error && (error.errMsg || error.message)) || "")
    const permissionDenied = /auth deny|authorize:fail|permission/i.test(message)

    if (!permissionDenied) {
      uni.showToast({
        title: "海报生成失败，请重试",
        icon: "none"
      })
      return
    }

    uni.showModal({
      title: "需要相册权限",
      content: "请在设置中允许保存图片到相册。",
      confirmText: "去设置",
      success: ({ confirm }) => {
        if (!confirm) {
          return
        }

        uni.openSetting({
          success: ({ authSetting }) => {
            if (authSetting["scope.writePhotosAlbum"]) {
              uni.showToast({
                title: "权限已开启，请再次保存",
                icon: "none"
              })
            }
          }
        })
      }
    })
  }
  }
}
</script>

<style>
.page {
  position: relative;
  min-height: 100vh;
  background: #fcf8fb;
  color: #1b1b1d;
}

.tap-press {
  opacity: 0.76;
  transform: scale(0.98);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(252, 248, 251, 0.86);
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.2);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 22rpx;
  width: 64rpx;
  justify-content: center;
}

.nav-back image {
  width: 38rpx;
  height: 38rpx;
}

.nav-title {
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: 600;
  white-space: nowrap;
}

.content {
  box-sizing: border-box;
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: calc(190rpx + env(safe-area-inset-bottom));
}

.poster-preview {
  position: relative;
  width: 100%;
  height: 858rpx;
  overflow: hidden;
  border-radius: 46rpx;
  background: #303033;
  box-shadow: 0 22rpx 60rpx rgba(27, 27, 29, 0.16);
}

.poster-image,
.poster-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.poster-shade {
  background: linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.52));
}

.poster-copy {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  top: 190rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.22);
}

.poster-kicker {
  max-width: 580rpx;
  font-size: 31rpx;
  line-height: 44rpx;
  font-weight: 500;
}

.poster-number {
  margin-top: 12rpx;
  font-size: 200rpx;
  line-height: 210rpx;
  font-weight: 700;
}

.poster-unit {
  font-size: 27rpx;
  line-height: 38rpx;
}

.poster-divider {
  width: 58rpx;
  height: 5rpx;
  margin: 25rpx 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.52);
}

.poster-date {
  padding: 13rpx 23rpx;
  border: 1rpx solid rgba(255,255,255,0.3);
  border-radius: 999rpx;
  background: rgba(255,255,255,0.18);
  font-size: 21rpx;
  line-height: 30rpx;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.poster-quote {
  position: absolute;
  left: 62rpx;
  right: 62rpx;
  bottom: 94rpx;
  color: rgba(255,255,255,0.9);
  font-size: 24rpx;
  line-height: 38rpx;
  text-align: center;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.poster-brand {
  position: absolute;
  right: 31rpx;
  bottom: 27rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: rgba(255,255,255,0.62);
  font-size: 18rpx;
}

.poster-brand image {
  width: 25rpx;
  height: 25rpx;
  filter: brightness(0) invert(1);
}

.poster-tone-love {
  background: #ffd1dc;
}

.poster-tone-month {
  background: #303033;
}

.category-scroll {
  width: calc(100% + 64rpx);
  margin: 34rpx -32rpx 0;
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  gap: 18rpx;
  padding: 0 32rpx;
}

.category-chip {
  height: 58rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: #f0edef;
  color: #564334;
  font-size: 23rpx;
  line-height: 32rpx;
}

.category-chip-active {
  background: #ff8c00;
  color: #ffffff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: 26rpx;
}

.template-card {
  position: relative;
  height: 316rpx;
  overflow: hidden;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  border-radius: 25rpx;
  background: #303033;
}

.template-card-active {
  border-color: #ff8c00;
  box-shadow: 0 0 0 5rpx rgba(255,140,0,0.12);
}

.template-image,
.template-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.template-shade {
  background: rgba(0,0,0,0.12);
}

.template-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 46rpx;
  font-weight: 600;
  text-shadow: 0 3rpx 10rpx rgba(0,0,0,0.22);
}

.template-tone-love .template-center {
  color: #ff5e78;
}

.template-name {
  position: absolute;
  left: 16rpx;
  bottom: 14rpx;
  color: rgba(255,255,255,0.9);
  font-size: 18rpx;
}

.template-tone-love .template-name {
  color: #ff5e78;
}

.pro-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 9rpx;
  border-radius: 8rpx;
  background: #ffb000;
  color: #ffffff;
  font-size: 16rpx;
}

.pro-tag image {
  width: 17rpx;
  height: 17rpx;
  filter: brightness(0) invert(1);
}

.selected-icon {
  position: absolute;
  right: 13rpx;
  bottom: 12rpx;
  width: 31rpx;
  height: 31rpx;
  filter: brightness(0) invert(1);
}

.quote-box {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  min-height: 134rpx;
  box-sizing: border-box;
  margin-top: 30rpx;
  padding: 27rpx;
  border: 1rpx solid rgba(221,193,174,0.34);
  border-radius: 25rpx;
  background: #ffffff;
}

.quote-box image {
  width: 37rpx;
  height: 37rpx;
  flex: 0 0 auto;
}

.quote-box textarea {
  width: 100%;
  height: 82rpx;
  padding: 0;
  color: #1b1b1d;
  font-size: 25rpx;
  line-height: 37rpx;
}

.quote-placeholder {
  color: rgba(86,67,52,0.42);
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  gap: 20rpx;
  padding: 22rpx 32rpx calc(22rpx + env(safe-area-inset-bottom));
  border-radius: 31rpx 31rpx 0 0;
  background: rgba(252,248,251,0.9);
  border-top: 1rpx solid rgba(221,193,174,0.28);
  -webkit-backdrop-filter: blur(26px);
  backdrop-filter: blur(26px);
}

.save-button,
.share-button {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-sizing: border-box;
  border-radius: 999rpx;
  font-size: 25rpx;
  font-weight: 600;
}

.save-button {
  flex: 1 1 auto;
  background: #ff8c00;
  color: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(255,140,0,0.2);
}

.share-button {
  width: 190rpx;
  margin: 0;
  padding: 0;
  border: 0;
  background: #f0edef;
  color: #564334;
  line-height: normal;
}

.share-button::after {
  border: 0;
}

.save-button image,
.share-button image {
  width: 34rpx;
  height: 34rpx;
}

.save-button image {
  filter: brightness(0) invert(1);
}

.poster-canvas {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 0;
  width: 600px;
  height: 750px;
  opacity: 0;
  pointer-events: none;
}
</style>
