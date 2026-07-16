<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>订阅成功</text></view>
    <view class="nav-spacer" :style="navActionStyle"></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="success-hero">
      <view class="success-icon">
        <image src="/static/assets/icons/check-circle-white.svg" mode="aspectFit"></image>
      </view>
      <text class="success-title">恭喜，您已成为 Pro 会员</text>
      <text class="success-copy">已为您解锁全部高级权益，开启智能倒数新时代。</text>
      <image class="sparkle sparkle-a" src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
      <image class="sparkle sparkle-b" src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
    </view>

    <view class="benefit-card">
      <text class="benefit-head">已激活的 Pro 权益</text>
      <view class="benefit-row" v-for="(item, index) in benefits" :key="item.id">
        <view class="benefit-icon">
          <image :src="item.icon" mode="aspectFit"></image>
        </view>
        <view class="benefit-copy">
          <view>
            <text>{{item.title}}</text>
            <text>已激活</text>
          </view>
          <text>{{item.copy}}</text>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </scroll-view>

  <view class="fixed-footer">
    <button class="done-button" @tap="handleBack" hover-class="button-press">立即体验</button>
  </view>
</view>
</template>

<script>
const { getWindowMetrics } = require("../../utils/system-info")

export default {
  data() {
    return {
    benefits: [
      { id: "ai", copy: "智能创建与生成", icon: "/static/assets/icons/auto-awesome-primary.svg", title: "AI 无限次数" },
      { id: "storage", copy: "记录每个瞬间", icon: "/static/assets/icons/cloud-done.svg", title: "无限存储" },
      { id: "icons", copy: "100+ 精致图标", icon: "/static/assets/icons/palette.svg", title: "个性图标" },
      { id: "effect", copy: "专属背景特效", icon: "/static/assets/icons/brush.svg", title: "动态特效" },
      { id: "ad", copy: "专注记录不打扰", icon: "/static/assets/icons/block.svg", title: "无广告" },
      { id: "sync", copy: "随时随地查看", icon: "/static/assets/icons/devices.svg", title: "多端同步" }
    ],
    contentTop: 96,
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
      contentTop: navHeight
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/mine/mine" })
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
  background: rgba(252, 248, 251, 0.78);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title,
.nav-spacer {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 31rpx;
  width: 84rpx;
}

.nav-back image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 124rpx;
  right: 124rpx;
  justify-content: center;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.nav-spacer {
  right: 31rpx;
  width: 84rpx;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

.success-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 76rpx 31rpx 62rpx;
  background: linear-gradient(180deg, rgba(255, 140, 0, 0.14) 0%, #fcf8fb 100%);
  text-align: center;
}

.success-icon {
  width: 154rpx;
  height: 154rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26rpx;
  border-radius: 50%;
  background: #ff8c00;
  box-shadow: 0 18rpx 42rpx rgba(255, 140, 0, 0.22);
}

.success-icon image {
  width: 92rpx;
  height: 92rpx;
}

.success-title {
  color: #1b1b1d;
  font-size: 46rpx;
  line-height: 62rpx;
  font-weight: 900;
}

.success-copy {
  max-width: 560rpx;
  margin-top: 12rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 29rpx;
  line-height: 42rpx;
}

.sparkle {
  position: absolute;
  width: 34rpx;
  height: 34rpx;
  opacity: 0.34;
}

.sparkle-a {
  top: 86rpx;
  left: 180rpx;
}

.sparkle-b {
  right: 164rpx;
  bottom: 74rpx;
}

.benefit-card {
  margin: 31rpx;
  padding: 46rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 46rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(27, 27, 29, 0.035);
}

.benefit-head {
  display: block;
  margin-bottom: 34rpx;
  color: rgba(86, 67, 52, 0.48);
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.benefit-row {
  display: flex;
  align-items: center;
  margin-bottom: 46rpx;
}

.benefit-row:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  width: 76rpx;
  height: 76rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 31rpx;
  border-radius: 24rpx;
  background: rgba(255, 140, 0, 0.1);
}

.benefit-icon image {
  width: 42rpx;
  height: 42rpx;
}

.benefit-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.benefit-copy view {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.benefit-copy view text:first-child {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.benefit-copy view text:last-child {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 140, 0, 0.1);
  color: #904d00;
  font-size: 18rpx;
  line-height: 26rpx;
  font-weight: 800;
}

.benefit-copy > text {
  margin-top: 4rpx;
  color: rgba(86, 67, 52, 0.5);
  font-size: 23rpx;
  line-height: 32rpx;
}

.bottom-spacer {
  height: 90rpx;
}

.fixed-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  padding: 24rpx 31rpx calc(28rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(221, 193, 174, 0.14);
  background: rgba(252, 248, 251, 0.88);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.done-button {
  width: 100%;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
  box-shadow: 0 18rpx 38rpx rgba(255, 140, 0, 0.22);
}

.done-button::after {
  border: 0;
}

.tap-press,
.button-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
