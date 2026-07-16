<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>通知设置</text></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="master-card">
      <view class="master-copy">
        <text>允许推送通知</text>
        <text>接收来自 AI Countdown 的即时提醒</text>
      </view>
      <view :class="'switch ' + (masterEnabled ? 'switch-on' : '')" @tap="toggleMaster" hover-class="tap-press">
        <view></view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">分项提醒</text>
      <view class="list-card">
        <block v-for="(item, index) in items" :key="item.id">
          <view class="notice-row">
            <view class="row-left">
              <view class="icon-wrap">
                <image :src="item.icon" mode="aspectFit"></image>
              </view>
              <view class="row-copy">
                <text>{{item.title}}</text>
                <text v-if="item.subtitle">{{item.subtitle}}</text>
              </view>
            </view>
            <view :class="'switch ' + (item.enabled ? 'switch-on' : '')" :data-id="item.id" @tap="toggleItem" hover-class="tap-press">
              <view></view>
            </view>
          </view>
          <view v-if="index < items.length - 1" class="hairline"></view>
        </block>
      </view>
    </view>

    <view class="ai-note">
      <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
      <text>AI 正在根据您的生活节奏优化通知频率，确保在最重要的时刻给予提醒而不产生打扰。</text>
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
    items: [
      { id: "event", icon: "/static/assets/icons/event.svg", title: "事件到期提醒", enabled: true },
      { id: "ai", icon: "/static/assets/icons/psychology.svg", title: "AI洞察更新提醒", enabled: true },
      { id: "daily", icon: "/static/assets/icons/calendar-today.svg", title: "每日回顾提醒", enabled: false },
      { id: "night", icon: "/static/assets/icons/bedtime.svg", title: "夜间勿扰模式", subtitle: "22:00 - 07:00", enabled: true }
    ],
    masterEnabled: true,
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
      contentTop: navHeight + 42
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/center-settings/center-settings" })
  },
    toggleMaster() {
    this.setData({ masterEnabled: !this.masterEnabled })
  },
    toggleItem(event) {
    const id = event.currentTarget.dataset.id
    const items = this.items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)
    this.setData({ items })
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
  width: 78rpx;
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
  font-weight: 900;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 0 31rpx calc(96rpx + env(safe-area-inset-bottom));
}

.master-card {
  min-height: 154rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 31rpx;
  box-sizing: border-box;
  border-radius: 31rpx;
  background: #ffffff;
  border: 1rpx solid rgba(221, 193, 174, 0.24);
  box-shadow: 0 8rpx 24rpx rgba(27, 27, 29, 0.035);
}

.master-copy,
.row-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.master-copy text:first-child {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 800;
}

.master-copy text:last-child,
.row-copy text:last-child {
  margin-top: 5rpx;
  color: rgba(86, 67, 52, 0.58);
  font-size: 23rpx;
  line-height: 32rpx;
}

.switch {
  width: 92rpx;
  height: 46rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 4rpx;
  box-sizing: border-box;
  border-radius: 999rpx;
  background: #e3e2e2;
  transition: background 160ms ease;
}

.switch view {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
  transition: transform 160ms ease;
}

.switch-on {
  background: #ff8c00;
}

.switch-on view {
  transform: translateX(46rpx);
}

.section {
  margin-top: 46rpx;
}

.section-title {
  display: block;
  padding: 0 4rpx 23rpx;
  color: #897362;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 800;
  letter-spacing: 3rpx;
}

.list-card {
  overflow: hidden;
  border-radius: 31rpx;
  background: #ffffff;
  border: 1rpx solid rgba(221, 193, 174, 0.24);
}

.notice-row {
  min-height: 124rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 31rpx;
  box-sizing: border-box;
}

.row-left {
  min-width: 0;
  display: flex;
  align-items: center;
}

.icon-wrap {
  width: 70rpx;
  height: 70rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 23rpx;
  border-radius: 22rpx;
  background: rgba(255, 140, 0, 0.1);
}

.icon-wrap image {
  width: 40rpx;
  height: 40rpx;
}

.row-copy text:first-child {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.hairline {
  height: 1rpx;
  margin-left: 124rpx;
  background: rgba(221, 193, 174, 0.16);
}

.ai-note {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 62rpx;
  padding: 0 54rpx;
  text-align: center;
}

.ai-note image {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 18rpx;
  opacity: 0.8;
}

.ai-note text {
  color: rgba(86, 67, 52, 0.56);
  font-size: 25rpx;
  line-height: 38rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
