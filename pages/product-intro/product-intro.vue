<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>产品介绍</text></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="hero">
      <view class="app-icon">
        <image src="/static/assets/icons/hourglass-top.svg" mode="aspectFit"></image>
      </view>
      <text class="app-title">AI 倒数日</text>
      <text class="version">v2.4.0</text>
    </view>

    <view class="value-section">
      <text>用 AI 记录每一个值得期待的瞬间</text>
      <text>时间不只是数字的跳动，更是情感的积淀。AI 倒数日通过深度学习与美学算法，重新定义时间管理工具。我们不仅帮您记录刻度，更在每一个重要时刻为您编织独特的数字仪式。</text>
    </view>

    <view class="feature-grid">
      <view class="feature-card" v-for="(item, index) in features" :key="item.title">
        <view>
          <image :src="item.icon" mode="aspectFit"></image>
        </view>
        <text>{{item.title}}</text>
        <text>{{item.copy}}</text>
      </view>
    </view>

    <view class="preview-card">
      <image src="/static/assets/home/hero-anniversary.jpg" mode="aspectFill"></image>
      <view class="preview-overlay"></view>
      <view class="preview-copy">
        <text>Exclusive Design</text>
        <text>触手可及的极简美学</text>
      </view>
    </view>

    <view class="crafted">
      <view></view>
      <text>CRAFTED WITH INTELLIGENCE</text>
      <view></view>
    </view>
  </scroll-view>
</view>
</template>

<script>
const { getWindowMetrics } = require("../../utils/system-info")

export default {
  data() {
    return {
    contentTop: 96,
    features: [
      {
        copy: "输入主题，AI 自动为您匹配背景图与寄语，开启极简记录新方式。",
        icon: "/static/assets/icons/auto-awesome-primary.svg",
        title: "AI 智能创建"
      },
      {
        copy: "提供海量 Pro 级背景模板与动态特效，让每一个倒数瞬间都充满仪式感。",
        icon: "/static/assets/icons/palette.svg",
        title: "美学模板"
      },
      {
        copy: "AI 深度洞察您的生活节奏，精准预测重要里程碑，确保温暖提醒如约而至。",
        icon: "/static/assets/icons/notifications-active.svg",
        title: "温暖提醒"
      }
    ],
    navActionStyle: "",
    navShellStyle: ""
  }
  },
  onLoad() {
    this.setupNavigation()
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
    const system = getWindowMetrics()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navActionStyle: `top:${menuTop}px;height:${menuHeight}px;`,
      navShellStyle: `height:${navHeight}px;`,
      contentTop: navHeight + 48
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/center-settings/center-settings" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: #fcf8fb;
  color: #1b1b1d;
}

.nav-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  background: rgba(252, 248, 251, 0.82);
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
  left: 31rpx;
  width: 76rpx;
  justify-content: center;
  border-radius: 50%;
}

.nav-back image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 114rpx;
  right: 31rpx;
  color: #904d00;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 0 46rpx calc(92rpx + env(safe-area-inset-bottom));
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 92rpx;
  text-align: center;
}

.app-icon {
  position: relative;
  width: 123rpx;
  height: 123rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #ffb257, #ff8c00);
  box-shadow: 0 20rpx 50rpx rgba(255, 140, 0, 0.2);
}

.app-icon image {
  width: 74rpx;
  height: 74rpx;
  filter: brightness(0) invert(1);
}

.app-title {
  margin-top: 31rpx;
  color: #1b1b1d;
  font-size: 64rpx;
  line-height: 78rpx;
  font-weight: 900;
}

.version {
  margin-top: 12rpx;
  padding: 8rpx 22rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 999rpx;
  background: #f0edef;
  color: #897362;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.value-section {
  margin-bottom: 92rpx;
  text-align: center;
}

.value-section text:first-child {
  display: block;
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 900;
}

.value-section text:last-child {
  display: block;
  margin-top: 31rpx;
  color: rgba(86, 67, 52, 0.66);
  font-size: 27rpx;
  line-height: 44rpx;
}

.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 31rpx;
  margin-bottom: 92rpx;
}

.feature-card {
  min-height: 250rpx;
  padding: 46rpx;
  box-sizing: border-box;
  border-radius: 31rpx;
  background: #ffffff;
  border: 1rpx solid rgba(221, 193, 174, 0.24);
  box-shadow: 0 12rpx 34rpx rgba(27, 27, 29, 0.035);
}

.feature-card view {
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 34rpx;
  border-radius: 31rpx;
  background: rgba(255, 140, 0, 0.1);
}

.feature-card image {
  width: 52rpx;
  height: 52rpx;
}

.feature-card text:nth-child(2) {
  display: block;
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 900;
}

.feature-card text:nth-child(3) {
  display: block;
  margin-top: 18rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 25rpx;
  line-height: 38rpx;
}

.preview-card {
  position: relative;
  height: 360rpx;
  overflow: hidden;
  margin-bottom: 64rpx;
  border-radius: 46rpx;
  background: #e3e2e2;
}

.preview-card image,
.preview-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.preview-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.52));
}

.preview-copy {
  position: absolute;
  left: 38rpx;
  right: 38rpx;
  bottom: 38rpx;
  color: #ffffff;
}

.preview-copy text:first-child {
  display: block;
  margin-bottom: 8rpx;
  color: #ff8c00;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 900;
  letter-spacing: 3rpx;
  text-transform: uppercase;
}

.preview-copy text:last-child {
  display: block;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 900;
}

.crafted {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  padding-bottom: 30rpx;
}

.crafted view {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ff8c00;
}

.crafted text {
  color: rgba(86, 67, 52, 0.62);
  font-size: 19rpx;
  line-height: 28rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
