<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>隐私管理</text></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <text class="intro">我们致力于保护您的个人隐私，并为您提供完全透明的控制选项。</text>

    <view class="personal-card">
      <view class="personal-copy">
        <text>个性化推荐</text>
        <text>允许 AI 根据您的倒数日类型、使用习惯与偏好，提供更贴合的提醒、模板和洞察。</text>
      </view>
      <view :class="'switch ' + (personalized ? 'switch-on' : '')" @tap="togglePersonalized" hover-class="tap-press">
        <view></view>
      </view>
    </view>

    <view class="card-section">
      <view class="section-head">
        <image src="/static/assets/icons/security.svg" mode="aspectFit"></image>
        <text>系统权限管理</text>
      </view>
      <view class="permission-card">
        <block v-for="(item, index) in permissions" :key="item.id">
          <view class="permission-row">
            <view class="row-left">
              <view class="row-icon">
                <image :src="item.icon" mode="aspectFit"></image>
              </view>
              <view class="row-copy">
                <text>{{item.title}}</text>
                <text>{{item.copy}}</text>
              </view>
            </view>
            <view :class="'switch ' + (item.enabled ? 'switch-on' : '')" :data-id="item.id" @tap="togglePermission" hover-class="tap-press">
              <view></view>
            </view>
          </view>
          <view v-if="index < permissions.length - 1" class="hairline"></view>
        </block>
      </view>
    </view>

    <view class="card-section">
      <view class="section-head">
        <image src="/static/assets/icons/description.svg" mode="aspectFit"></image>
        <text>法律协议与条款</text>
      </view>
      <view class="agreement-card">
        <block v-for="(item, index) in agreements" :key="item.id">
          <view class="agreement-row" :data-id="item.id" @tap="handleAgreementTap" hover-class="tap-press">
            <text>{{item.title}}</text>
            <image src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
          </view>
          <view v-if="index < agreements.length - 1" class="hairline agreement-line"></view>
        </block>
      </view>
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
    navActionStyle: "",
    navShellStyle: "",
    personalized: true,
    permissions: [
      { id: "camera", icon: "/static/assets/icons/photo-camera.svg", title: "相机权限", copy: "用于拍摄或自定义倒数日背景。", enabled: true },
      { id: "album", icon: "/static/assets/icons/image.svg", title: "相册权限", copy: "用于上传本地图片作为倒计时背景。", enabled: true },
      { id: "notice", icon: "/static/assets/icons/notifications-active.svg", title: "通知权限", copy: "用于倒计时结束时的实时提醒。", enabled: false }
    ],
    agreements: [
      { id: "privacy", title: "隐私政策协议" },
      { id: "service", title: "用户服务协议" }
    ]
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
    togglePersonalized() {
    this.setData({ personalized: !this.personalized })
  },
    togglePermission(event) {
    const id = event.currentTarget.dataset.id
    const permissions = this.permissions.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item)
    this.setData({ permissions })
  },
    handleAgreementTap(event) {
    const type = event.currentTarget.dataset.id || "privacy"

    uni.navigateTo({
      url: `/pages/legal-detail/legal-detail?type=${encodeURIComponent(type)}`
    })
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
  font-weight: 800;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 0 31rpx calc(100rpx + env(safe-area-inset-bottom));
}

.intro {
  display: block;
  margin-bottom: 30rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 29rpx;
  line-height: 44rpx;
}

.personal-card,
.permission-card,
.agreement-card {
  border: 1rpx solid rgba(221, 193, 174, 0.25);
  border-radius: 31rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(27, 27, 29, 0.03);
}

.personal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 178rpx;
  padding: 31rpx;
  box-sizing: border-box;
}

.personal-copy,
.row-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.personal-copy text:first-child {
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.personal-copy text:last-child {
  max-width: 500rpx;
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 24rpx;
  line-height: 36rpx;
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

.card-section {
  margin-top: 46rpx;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 23rpx;
}

.section-head image {
  width: 38rpx;
  height: 38rpx;
  margin-right: 12rpx;
}

.section-head text {
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.permission-card,
.agreement-card {
  overflow: hidden;
}

.permission-row {
  min-height: 132rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 31rpx;
  box-sizing: border-box;
}

.row-left {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
}

.row-icon {
  width: 70rpx;
  height: 70rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 23rpx;
  border-radius: 22rpx;
  background: rgba(137, 115, 98, 0.12);
}

.row-icon image {
  width: 40rpx;
  height: 40rpx;
}

.row-copy text:first-child {
  color: #1b1b1d;
  font-size: 27rpx;
  line-height: 38rpx;
  font-weight: 800;
}

.row-copy text:last-child {
  max-width: 430rpx;
  margin-top: 4rpx;
  color: rgba(86, 67, 52, 0.55);
  font-size: 21rpx;
  line-height: 31rpx;
}

.hairline {
  height: 1rpx;
  margin-left: 124rpx;
  background: rgba(221, 193, 174, 0.16);
}

.agreement-row {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 31rpx;
}

.agreement-row text {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 650;
}

.agreement-row image {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.5;
}

.agreement-line {
  margin-left: 31rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
