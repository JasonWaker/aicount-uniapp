<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>账号安全</text></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="section" v-for="(item, index) in sections" :key="item.title">
      <text class="section-title">{{item.title}}</text>
      <view class="flat-card">
        <block v-for="(row, index) in item.rows" :key="row.id">
          <view class="flat-row" :data-id="row.id" @tap="handleRowTap" hover-class="tap-press">
            <view class="row-left">
              <image :src="row.icon" mode="aspectFit"></image>
              <text>{{row.title}}</text>
            </view>
            <view class="row-right">
              <text :class="row.primary ? 'primary-value' : ''">{{row.value}}</text>
              <image v-if="row.primary" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
            </view>
          </view>
          <view v-if="index < item.rows.length - 1" class="hairline"></view>
        </block>
      </view>
    </view>

    <view class="danger-card" @tap="handleCancelAccount" hover-class="tap-press">注销账号</view>
    <text class="danger-copy">注销后，您的所有定时任务、AI预测数据及历史记录将被永久删除且无法恢复。</text>
  </scroll-view>
</view>
</template>

<script>
const { getWindowMetrics } = require("../../utils/system-info")

function getPhoneValue(auth) {
  if (auth.phoneLabel) {
    return auth.phoneLabel
  }

  if (auth.phoneCode) {
    return "已授权"
  }

  return "未授权"
}

function buildSections(auth) {
  const phoneBound = !!(auth.phoneCode || auth.phoneLabel)
  const wechatBound = !!auth.loginCode

  return [
    {
      title: "账号绑定",
      rows: [
        {
          id: "phone",
          title: "手机号",
          value: getPhoneValue(auth),
          icon: "/static/assets/icons/smartphone.svg",
          primary: !phoneBound
        }
      ]
    },
    {
      title: "第三方账号",
      rows: [
        {
          id: "wechat",
          title: "微信",
          value: wechatBound ? "已授权" : "未授权",
          icon: "/static/assets/icons/wechat.svg",
          primary: !wechatBound
        }
      ]
    }
  ]
}

export default {
  data() {
    return {
    contentTop: 96,
    navActionStyle: "",
    navShellStyle: "",
    sections: []
  }
  },
  onLoad() {
    this.setupNavigation()
    this.syncAccountState()
  },
  onShow() {
    this.syncAccountState()
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
      contentTop: navHeight + 34
    })
  },
    syncAccountState() {
    const auth = getApp().getAuthState()

    this.setData({
      sections: buildSections(auth)
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/center-settings/center-settings" })
  },
    handleRowTap(event) {
    const id = event.currentTarget.dataset.id
    const auth = getApp().getAuthState()

    if (id === "phone") {
      uni.showToast({ title: auth.phoneCode || auth.phoneLabel ? "手机号已授权" : "暂未授权手机号", icon: "none" })
      return
    }

    if (id === "wechat") {
      uni.showToast({ title: auth.loginCode ? "微信已授权" : "暂未完成微信授权", icon: "none" })
    }
  },
    handleCancelAccount() {
    uni.showModal({
      cancelColor: "#897362",
      confirmColor: "#c43d31",
      content: "注销后，你的所有倒数日、倒数本、AI 数据和历史记录将被永久删除且无法恢复。",
      title: "注销账号",
      success: (result) => {
        if (result.confirm) {
          uni.showToast({ title: "当前为演示流程", icon: "none" })
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
  background: rgba(252, 248, 251, 0.8);
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
  padding: 0 31rpx calc(90rpx + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: 34rpx;
}

.section-title {
  display: block;
  padding: 0 4rpx 16rpx;
  color: #897362;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 800;
  letter-spacing: 3rpx;
}

.flat-card {
  overflow: hidden;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(221, 193, 174, 0.25);
  box-shadow: 0 8rpx 22rpx rgba(27, 27, 29, 0.025);
}

.flat-row {
  min-height: 108rpx;
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

.row-left image {
  width: 42rpx;
  height: 42rpx;
  margin-right: 24rpx;
}

.row-left text {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 600;
}

.row-right text {
  color: rgba(86, 67, 52, 0.62);
  font-size: 26rpx;
  line-height: 36rpx;
}

.row-right .primary-value {
  color: #ff8c00;
  font-weight: 700;
}

.row-right image {
  width: 38rpx;
  height: 38rpx;
  margin-left: 8rpx;
  opacity: 0.42;
}

.hairline {
  height: 1rpx;
  margin-left: 96rpx;
  background: rgba(221, 193, 174, 0.16);
}

.danger-card {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 62rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(196, 61, 49, 0.18);
  color: #c43d31;
  font-size: 31rpx;
  line-height: 44rpx;
  font-weight: 800;
}

.danger-copy {
  display: block;
  margin: 22rpx 24rpx 0;
  color: rgba(137, 115, 98, 0.74);
  font-size: 23rpx;
  line-height: 36rpx;
  text-align: center;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
