<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>中心设置</text></view>
    <view class="nav-spacer" :style="navActionStyle"></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="section" v-for="(item, index) in sections" :key="item.title">
      <view class="section-title">{{item.title}}</view>
      <view class="inset-list">
        <block v-for="(row, index) in item.rows" :key="row.id">
          <view class="settings-row" :data-id="row.id" @tap="handleRowTap" hover-class="tap-press">
            <view class="row-left">
              <view :class="'row-icon ' + (row.tone)">
                <image :src="row.icon" mode="aspectFit"></image>
              </view>
              <text>{{row.title}}</text>
            </view>
            <view class="row-right">
              <text v-if="row.value">{{row.value}}</text>
              <image src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
            </view>
          </view>
          <view v-if="index < item.rows.length - 1" class="hairline"></view>
        </block>
      </view>
    </view>

    <view class="logout-wrap">
      <view class="logout-button" @tap="handleLogout" hover-class="tap-press">退出登录</view>
      <text>AI 倒计时 v2.4.0</text>
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
    sections: [
      {
        title: "账户与安全",
        rows: [
          { id: "security", title: "账号安全", icon: "/static/assets/icons/security.svg", tone: "primary" },
          { id: "notice", title: "通知设置", icon: "/static/assets/icons/notifications-active.svg", tone: "secondary" },
          { id: "privacy", title: "隐私管理", icon: "/static/assets/icons/lock.svg", tone: "tertiary" }
        ]
      },
      {
        title: "关于",
        rows: [
          { id: "about", title: "关于 AI 倒数日", value: "v2.4.0", icon: "/static/assets/icons/info.svg", tone: "secondary" },
          { id: "feedback", title: "意见反馈", icon: "/static/assets/icons/rate-review.svg", tone: "tertiary" }
        ]
      }
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
      contentTop: navHeight + 32
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/mine/mine" })
  },
    handleRowTap(event) {
    const id = event.currentTarget.dataset.id
    const routeMap = {
      security: "/pages/account-security/account-security",
      notice: "/pages/notification-settings/notification-settings",
      privacy: "/pages/privacy-management/privacy-management",
      about: "/pages/product-intro/product-intro",
      feedback: "/pages/feedback/feedback"
    }

    if (routeMap[id]) {
      uni.navigateTo({ url: routeMap[id] })
    }
  },
    handleLogout() {
    uni.showModal({
      cancelColor: "#897362",
      cancelText: "取消",
      confirmColor: "#c43d31",
      confirmText: "退出",
      content: "退出后，需要重新授权手机号才能继续使用个人中心。",
      title: "退出登录",
      success: (result) => {
        if (result.confirm) {
          getApp().clearAuthState()
          uni.redirectTo({ url: "/pages/mine/mine" })
        }
      }
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
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.2);
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
  left: 38rpx;
  width: 72rpx;
}

.nav-back image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 128rpx;
  right: 128rpx;
  justify-content: center;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.nav-spacer {
  right: 38rpx;
  width: 72rpx;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 0 31rpx calc(72rpx + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: 54rpx;
}

.section-title {
  padding: 15rpx 31rpx;
  color: rgba(86, 67, 52, 0.58);
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.inset-list {
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.26);
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 22rpx rgba(27, 27, 29, 0.03);
}

.settings-row {
  min-height: 123rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 31rpx;
  box-sizing: border-box;
}

.row-left,
.row-right {
  display: flex;
  align-items: center;
}

.row-icon {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 23rpx;
  border-radius: 16rpx;
}

.row-icon image {
  width: 38rpx;
  height: 38rpx;
}

.row-icon.primary {
  background: rgba(144, 77, 0, 0.08);
}

.row-icon.secondary {
  background: rgba(137, 115, 98, 0.14);
}

.row-icon.tertiary {
  background: rgba(255, 140, 0, 0.1);
}

.row-left text {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.row-right text {
  margin-right: 8rpx;
  color: rgba(86, 67, 52, 0.46);
  font-size: 23rpx;
  line-height: 32rpx;
}

.row-right image {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.42;
}

.hairline {
  height: 1rpx;
  margin-left: 116rpx;
  background: rgba(221, 193, 174, 0.16);
}

.logout-wrap {
  margin-top: 92rpx;
  padding-bottom: 40rpx;
  text-align: center;
}

.logout-button {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(196, 61, 49, 0.22);
  border-radius: 24rpx;
  background: #ffffff;
  color: #c43d31;
  font-size: 31rpx;
  line-height: 44rpx;
  font-weight: 700;
  box-shadow: 0 6rpx 18rpx rgba(27, 27, 29, 0.025);
}

.logout-wrap > text {
  display: block;
  margin-top: 46rpx;
  color: rgba(86, 67, 52, 0.28);
  font-size: 21rpx;
  line-height: 30rpx;
  letter-spacing: 1rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
