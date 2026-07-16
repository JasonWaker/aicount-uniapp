<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle"></view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="profile" @tap="handleProfileTap" :hover-class="isLoggedIn ? '' : 'tap-press'">
      <view :class="'avatar ' + (isLoggedIn ? 'avatar-user' : '')">
        <image
          v-if="isLoggedIn"
          class="avatar-photo"
          src="/static/assets/icons/mine-avatar-user.svg"
          mode="aspectFill"
        ></image>
        <image
          v-else
          class="avatar-icon"
          src="/static/assets/icons/account-circle.svg"
          mode="aspectFit"
        ></image>
        <view v-if="isLoggedIn ? isVip : false" class="vip-badge">
          <image src="/static/assets/icons/workspace-premium.svg" mode="aspectFit"></image>
          <text>Pro</text>
        </view>
      </view>

      <view class="profile-copy">
        <view v-if="isLoggedIn" class="user-line">
          <text class="user-phone">{{displayName}}</text>
          <view class="edit-name-button" @tap.stop="handleEditName" hover-class="tap-press">
            <image class="edit-mini" src="/static/assets/icons/edit.svg" mode="aspectFit"></image>
          </view>
        </view>
        <block v-else>
          <text class="login-title">登录/注册</text>
          <text class="login-subtitle">记录每个珍贵时刻</text>
        </block>
        <text v-if="isLoggedIn" class="login-subtitle">让每一刻都有迹可循</text>
      </view>
    </view>

    <view class="stats-card">
      <block v-for="(item, index) in stats" :key="item.id">
        <view class="stat-item" :data-id="item.id" @tap="handleStatTap" hover-class="tap-press">
          <text :class="'stat-value ' + (item.primary ? 'stat-primary' : '')">{{item.value}}</text>
          <text class="stat-label">{{item.label}}</text>
        </view>
        <view v-if="index < stats.length - 1" class="stat-divider"></view>
      </block>
    </view>

    <view class="pro-card" @tap="handleProTap" hover-class="card-press" hover-stay-time="80">
      <view class="pro-copy">
        <text class="pro-title">Pro会员中心</text>
        <text class="pro-subtitle">{{isVip ? '会员有效中，查看订阅权益' : '解锁无限倒计时与AI智能分类'}}</text>
      </view>
      <view class="pro-icon-wrap">
        <image class="pro-icon" src="/static/assets/icons/workspace-premium.svg" mode="aspectFit"></image>
      </view>
      <view class="pro-glow"></view>
    </view>

    <view class="menu-card">
      <block v-for="(item, index) in menus" :key="item.id">
        <view class="menu-item" :data-id="item.id" @tap="handleMenuTap" hover-class="menu-press">
          <view class="menu-left">
            <view class="menu-icon-wrap">
              <image class="menu-icon" :src="item.icon" mode="aspectFit"></image>
            </view>
            <view class="menu-title-wrap">
              <text class="menu-title">{{item.title}}</text>
              <image
                v-if="item.id == 'messages' ? hasUnreadMessages : false"
                class="menu-unread-dot"
                src="/static/assets/icons/unread-dot.svg"
                mode="aspectFit"
              ></image>
            </view>
          </view>
          <image class="chevron" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
        </view>
        <view v-if="index < menus.length - 1" class="menu-divider"></view>
      </block>
    </view>

    <view class="version">
      <text>AI 倒数日 v2.4.0</text>
    </view>

    <view class="bottom-spacer"></view>
  </scroll-view>

  <view class="tabbar">
    <view class="tab-item" @tap="handleTabHome" hover-class="tab-press">
      <image class="tab-icon-img" src="/static/assets/icons/home.svg" mode="aspectFit"></image>
      <text>&#x9996;&#x9875;</text>
    </view>
    <view class="tab-item" @tap="handleTabBook" hover-class="tab-press">
      <image class="tab-icon-img" src="/static/assets/icons/menu-book.svg" mode="aspectFit"></image>
      <text>&#x5012;&#x6570;&#x672c;</text>
    </view>
    <view class="tab-item tab-active">
      <image class="tab-icon-img" src="/static/assets/icons/person-active.svg" mode="aspectFit"></image>
      <text>&#x6211;&#x7684;</text>
    </view>
  </view>

  <view v-if="authModalVisible" class="auth-mask" @tap="handleCloseAuthModal">
    <view class="auth-sheet" @tap.stop="handleModalTap">
      <view class="auth-icon-wrap">
        <image src="/static/assets/icons/account-circle.svg" mode="aspectFit"></image>
      </view>
      <text class="auth-title">&#x767b;&#x5f55;&#x540e;&#x7ee7;&#x7eed;</text>
      <text class="auth-copy">&#x6388;&#x6743;&#x624b;&#x673a;&#x53f7;&#x540e;&#xff0c;&#x53ef;&#x540c;&#x6b65;&#x7ba1;&#x7406;&#x4f60;&#x7684;&#x5012;&#x6570;&#x65e5;&#x3001;&#x5012;&#x6570;&#x672c;&#x4e0e; Pro &#x6743;&#x76ca;&#x3002;</text>
      <button
        class="auth-button"
        @tap="handleMockPhoneLogin"
        :loading="loginLoading"
        hover-class="button-press"
      >&#x624b;&#x673a;&#x53f7;&#x6388;&#x6743;&#x767b;&#x5f55;</button>
      <view class="auth-cancel" @tap="handleCloseAuthModal">&#x7a0d;&#x540e;&#x518d;&#x8bf4;</view>
    </view>
  </view>

  <view v-if="nicknameModalVisible" class="modal-mask" @tap="handleCloseNickname">
    <view class="nickname-modal" @tap.stop="handleModalTap">
      <view class="modal-head">
        <text>修改昵称</text>
        <image src="/static/assets/icons/close.svg" mode="aspectFit" @tap="handleCloseNickname"></image>
      </view>
      <view class="nickname-avatar">
        <image src="/static/assets/icons/mine-avatar-user.svg" mode="aspectFill"></image>
      </view>
      <input
        class="nickname-input"
        :value="nicknameDraft"
        maxlength="16"
        placeholder="输入你的昵称"
        placeholder-class="input-placeholder"
        @input="handleNicknameInput"
      />
      <view class="modal-actions">
        <view class="modal-secondary" @tap="handleCloseNickname" hover-class="tap-press">鍙栨秷</view>
        <view class="modal-primary" @tap="handleSaveNickname" hover-class="tap-press">保存</view>
      </view>
    </view>
  </view>

  <view v-if="proModalVisible" class="modal-mask" @tap="handleCloseProModal">
    <view class="pro-modal" @tap.stop="handleModalTap">
      <view class="pro-nav">
        <view class="pro-nav-back" @tap="handleCloseProModal" hover-class="tap-press">
          <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
        </view>
        <text>会员中心</text>
        <image src="/static/assets/icons/close.svg" mode="aspectFit" @tap="handleCloseProModal"></image>
      </view>

      <scroll-view class="pro-scroll" scroll-y enhanced :show-scrollbar="false">
        <view class="pro-hero">
          <view class="pro-chip">
            <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
            <text>AI 倒数日 Pro</text>
          </view>
          <text class="pro-hero-title">解锁 AI 智能时刻体验</text>
          <text class="pro-hero-copy">让每个重要日子都有专属规划</text>
          <view class="pro-orbits">
            <view class="orbit-card orbit-left">
              <image src="/static/assets/icons/menu-book.svg" mode="aspectFit"></image>
            </view>
            <view class="orbit-card orbit-main">
              <image src="/static/assets/icons/rocket-launch.svg" mode="aspectFit"></image>
            </view>
            <view class="orbit-card orbit-right">
              <image src="/static/assets/icons/cloud-done.svg" mode="aspectFit"></image>
            </view>
          </view>
        </view>

        <view class="pro-feature-grid">
          <view class="pro-feature">
            <view><image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image></view>
            <text>AI 智能分析</text>
            <text>生成提醒与任务</text>
          </view>
          <view class="pro-feature">
            <view><image src="/static/assets/icons/cloud-done.svg" mode="aspectFit"></image></view>
            <text>无限记录</text>
            <text>珍藏更多时刻</text>
          </view>
          <view class="pro-feature">
            <view><image src="/static/assets/icons/palette.svg" mode="aspectFit"></image></view>
            <text>专属图标</text>
            <text>100+ 精致图标</text>
          </view>
          <view class="pro-feature">
            <view><image src="/static/assets/icons/brush.svg" mode="aspectFit"></image></view>
            <text>卡片特效</text>
            <text>更多背景模板</text>
          </view>
          <view class="pro-feature">
            <view><image src="/static/assets/icons/block.svg" mode="aspectFit"></image></view>
            <text>无广告</text>
            <text>专注倒数体验</text>
          </view>
          <view class="pro-feature">
            <view><image src="/static/assets/icons/devices.svg" mode="aspectFit"></image></view>
            <text>云端同步</text>
            <text>多端安全备份</text>
          </view>
        </view>

        <view class="plan-section">
          <text class="plan-title">閫夋嫨鎮ㄧ殑鏂规</text>
          <view class="plan-grid">
            <view class="plan-card plan-active">
              <text>杩炵画鍖呮湀</text>
              <view><text>2.99</text><text>鍏</text></view>
            </view>
            <view class="plan-card">
              <view class="best-tag">鏈€瓒呭€</view>
              <text>缁堣韩涔版柇</text>
              <view><text>19.99</text><text>鍏</text></view>
            </view>
          </view>
        </view>

        <view class="pro-bottom-spacer"></view>
      </scroll-view>

      <view class="pro-footer">
        <button class="pro-open-button" :loading="isPaying" @tap="handleStartPro" hover-class="button-press">
          <image src="/static/assets/icons/security.svg" mode="aspectFit"></image>
          <text>绔嬪嵆鍗囩骇 Pro</text>
        </button>
        <text>璁㈤槄鍗充唬琛ㄦ偍鍚屾剰銆婁細鍛樻湇鍔″崗璁€嬪拰銆婇殣绉佹斂绛栥€</text>
      </view>
    </view>
  </view>
</view>
</template>

<script>
const { getEvents } = require("../../utils/event-store")
const { hasUnreadMessages } = require("../../utils/message-notifications")
const cloudApi = require("../../services/cloud-api")
const { getWindowMetrics } = require("../../utils/system-info")

const menus = [
  { id: "messages", title: "\u6d88\u606f\u4e2d\u5fc3", icon: "/static/assets/icons/notifications.svg" },
  { id: "settings", title: "\u4e2d\u5fc3\u8bbe\u7f6e", icon: "/static/assets/icons/center-focus-strong.svg" },
  { id: "help", title: "\u5e2e\u52a9\u4e0e\u53cd\u9988", icon: "/static/assets/icons/contact-support.svg" }
]

const proPlan = {
  id: "pro-yearly",
  amount: 1990,
  price: "\u00a519.9"
}

function getTodayTime() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function getEventTargetTime(event) {
  const target = event && event.target

  if (!target) {
    return getTodayTime()
  }

  return new Date(target.year, target.month - 1, target.day).getTime()
}

function getStats(isLoggedIn) {
  if (!isLoggedIn) {
    return [
      { id: "active", label: "\u6b63\u5728\u8fdb\u884c", value: 0, primary: true },
      { id: "done", label: "\u5df2\u5b8c\u6210", value: 0 },
      { id: "total", label: "\u7d2f\u8ba1\u8bb0\u5f55", value: 0 }
    ]
  }

  const todayTime = getTodayTime()
  const events = getEvents()
  const done = events.filter((event) => event.completed || getEventTargetTime(event) <= todayTime).length
  const active = Math.max(0, events.length - done)

  return [
    { id: "active", label: "\u6b63\u5728\u8fdb\u884c", value: active, primary: true },
    { id: "done", label: "\u5df2\u5b8c\u6210", value: done },
    { id: "total", label: "\u7d2f\u8ba1\u8bb0\u5f55", value: events.length }
  ]
}

function getDisplayPhoneLabel(auth) {
  const phoneLabel = auth.phoneLabel || ""

  if (!phoneLabel || phoneLabel === "微信用户") {
    return "138****8888"
  }

  return phoneLabel
}

export default {
  data() {
    return {
    authModalVisible: false,
    contentTop: 96,
    displayName: "",
    isLoggedIn: false,
    isPaying: false,
    isVip: false,
    hasUnreadMessages: false,
    loginLoading: false,
    menus,
    navShellStyle: "",
    nicknameDraft: "",
    nicknameModalVisible: false,
    phoneLabel: "",
    proModalVisible: false,
    stats: getStats(false)
  }
  },
  onLoad() {
    this.setupNavigation()
    this.syncState()
  },
  async onShow() {
    await this.syncState()
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
      navShellStyle: `height:${navHeight}px;`,
      contentTop: Math.max(navHeight + 4, 80)
    })
  },
    async syncState() {
    const app = getApp()
    const auth = app.getAuthState()
    const isLoggedIn = !!auth.isLoggedIn
    const displayName = auth.nickname || getDisplayPhoneLabel(auth)
    let unread = hasUnreadMessages(isLoggedIn)

    if (isLoggedIn) {
      try {
        const res = await cloudApi.message().list()
        unread = (res && res.data ? res.data : []).some((item) => item.unread)
      } catch (error) {}
    }

    this.setData({
      displayName,
      hasUnreadMessages: unread,
      isLoggedIn,
      isVip: app.getVipState(),
      nicknameDraft: displayName,
      phoneLabel: getDisplayPhoneLabel(auth),
      stats: getStats(isLoggedIn)
    })
  },
    requireLogin() {
    if (this.isLoggedIn) {
      return true
    }

    this.setData({ authModalVisible: true })
    return false
  },
    handleProfileTap() {
    this.requireLogin()
  },
    handleEditName() {
    if (!this.requireLogin()) {
      return
    }

    this.setData({
      nicknameDraft: this.displayName,
      nicknameModalVisible: true
    })
  },
    handleNicknameInput(event) {
    this.setData({ nicknameDraft: event.detail.value })
  },
    handleCloseNickname() {
    this.setData({ nicknameModalVisible: false })
  },
    handleSaveNickname() {
    const nickname = this.nicknameDraft.trim()

    if (!nickname) {
      uni.showToast({ title: "\u8bf7\u8f93\u5165\u6635\u79f0", icon: "none" })
      return
    }

    const app = getApp()
    const auth = app.getAuthState()

    app.setAuthState({
      ...auth,
      isLoggedIn: true,
      nickname
    })

    this.setData({
      displayName: nickname,
      nicknameModalVisible: false
    })
    uni.showToast({ title: "\u5df2\u4fdd\u5b58", icon: "success" })
  },
    handleStatTap(event) {
    if (!this.requireLogin()) {
      return
    }

    const id = event.currentTarget.dataset.id
    const routeMap = {
      active: "/pages/book-status-list/book-status-list?status=ongoing&scope=all",
      done: "/pages/book-status-list/book-status-list?status=completed&scope=all",
      total: "/pages/mine-records/mine-records"
    }

    if (routeMap[id]) {
      uni.navigateTo({ url: routeMap[id] })
    }
  },
    handleProTap() {
    if (!this.requireLogin()) {
      return
    }

    if (this.isVip) {
      uni.navigateTo({ url: "/pages/subscription-success/subscription-success" })
      return
    }

    this.setData({ proModalVisible: true })
  },
    handleCloseProModal() {
    if (this.isPaying) {
      return
    }

    this.setData({ proModalVisible: false })
  },
    handleModalTap() {},
    async handleStartPro() {
    if (this.isPaying) {
      return
    }

    this.setData({ isPaying: true })

    try {
      const app = getApp()
      const auth = app.getAuthState()
      await app.getPaymentService().purchasePro(proPlan, auth)
      app.setVipState(true, Date.now() + 365 * 24 * 60 * 60 * 1000)
      this.setData({
        isPaying: false,
        isVip: true,
        proModalVisible: false
      })
      uni.navigateTo({ url: "/pages/subscription-success/subscription-success" })
    } catch (error) {
      this.setData({ isPaying: false })
      uni.showToast({ title: "开通未完成", icon: "none" })
    }
  },
    handleMenuTap(event) {
    if (!this.requireLogin()) {
      return
    }

    const routeMap = {
      messages: "/pages/message-center/message-center",
      settings: "/pages/center-settings/center-settings",
      help: "/pages/feedback/feedback"
    }
    const id = event.currentTarget.dataset.id

    if (routeMap[id]) {
      uni.navigateTo({ url: routeMap[id] })
    }
  },
    handleCloseAuthModal() {
    if (this.loginLoading) {
      return
    }

    this.setData({ authModalVisible: false })
  },
    completeMockPhoneLogin(loginCode = "") {
    getApp().setAuthState({
      isLoggedIn: true,
      loginCode,
      nickname: "",
      phoneCode: "mock-phone-auth",
      phoneLabel: "138****8888"
    })

    this.setData({
      authModalVisible: false,
      loginLoading: false
    })
    this.syncState()
    uni.showToast({ title: "登录成功", icon: "success" })
  },
    handleMockPhoneLogin() {
    if (this.loginLoading) {
      return
    }

    this.setData({ loginLoading: true })

    uni.login({
      success: ({ code }) => {
        this.completeMockPhoneLogin(code || "mock-login-code")
      },
      fail: () => {
        this.completeMockPhoneLogin("mock-login-code")
      }
    })
  },
    handleGetPhoneNumber(event) {
    const detail = event.detail || {}
    const phoneCode = detail.code || detail.encryptedData || detail.phoneNumber

    if (!phoneCode) {
      this.handleMockPhoneLogin()
      return
    }

    this.setData({ loginLoading: true })

    uni.login({
      success: ({ code }) => {
        const phoneLabel = detail.phoneNumber
          ? detail.phoneNumber.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2")
          : "138****8888"

        getApp().setAuthState({
          isLoggedIn: true,
          loginCode: code || "",
          nickname: "",
          phoneCode: detail.code || "",
          phoneLabel
        })

        this.setData({
          authModalVisible: false,
          loginLoading: false
        })
        this.syncState()
        uni.showToast({ title: "登录成功", icon: "success" })
      },
      fail: () => {
        this.completeMockPhoneLogin("mock-login-code")
      }
    })
  },
    handleTabHome() {
    uni.redirectTo({ url: "/pages/index/index" })
  },
    handleTabBook() {
    uni.redirectTo({ url: "/pages/book/book" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #fcf8fb;
  color: #1b1b1d;
  overflow: hidden;
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(252, 248, 251, 0.78);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 38rpx;
  padding-right: 38rpx;
  padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
  overflow-x: hidden;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 46rpx;
}

.avatar {
  position: relative;
  width: 184rpx;
  height: 184rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8rpx solid #e4e2e4;
  border-radius: 50%;
  background: #eae7ea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.avatar-user {
  border-color: #ffffff;
  background: #ffffff;
  box-shadow: 0 8rpx 26rpx rgba(27, 28, 28, 0.08);
}

.avatar-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-icon {
  width: 92rpx;
  height: 92rpx;
  opacity: 0.78;
}

.vip-badge {
  position: absolute;
  right: -2rpx;
  bottom: 0;
  min-width: 70rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
  border: 2rpx solid #ffffff;
  border-radius: 999rpx;
  background: #ffd73e;
  color: #6e3900;
  font-size: 16rpx;
  line-height: 22rpx;
  font-weight: 700;
}

.vip-badge image {
  width: 21rpx;
  height: 21rpx;
}

.profile-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 31rpx;
}

.user-line {
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-name-button {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6rpx;
  border-radius: 50%;
}

.user-phone,
.login-title {
  color: #1b1b1d;
  font-size: 46rpx;
  line-height: 62rpx;
  font-weight: 600;
}

.edit-mini {
  width: 35rpx;
  height: 35rpx;
  margin-left: 15rpx;
  opacity: 0.72;
}

.login-subtitle {
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.56);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 138rpx;
  padding: 46rpx 0;
  box-sizing: border-box;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 8rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.stat-item {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.stat-primary {
  color: #904d00;
}

.stat-label {
  color: #564334;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
}

.stat-divider {
  width: 1rpx;
  height: 62rpx;
  background: rgba(221, 193, 174, 0.18);
}

.pro-card {
  position: relative;
  min-height: 138rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 46rpx;
  padding: 38rpx;
  overflow: hidden;
  border: 1rpx solid rgba(144, 77, 0, 0.1);
  border-radius: 8rpx;
  background: linear-gradient(135deg, rgba(144, 77, 0, 0.08), rgba(144, 77, 0, 0.026));
  transition: transform 120ms ease;
}

.pro-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pro-title {
  color: #904d00;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.pro-subtitle {
  color: #6e3900;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.pro-icon-wrap {
  position: relative;
  z-index: 1;
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pro-icon {
  width: 58rpx;
  height: 58rpx;
}

.pro-glow {
  position: absolute;
  right: -38rpx;
  bottom: -46rpx;
  width: 138rpx;
  height: 138rpx;
  border-radius: 50%;
  background: rgba(144, 77, 0, 0.028);
}

.menu-card {
  margin-top: 46rpx;
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 8rpx;
  background: #ffffff;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 138rpx;
  padding: 31rpx;
  box-sizing: border-box;
  transition: transform 120ms ease, background-color 120ms ease;
}

.menu-left {
  min-width: 0;
  display: flex;
  align-items: center;
}

.menu-icon-wrap {
  width: 77rpx;
  height: 77rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 31rpx;
  border-radius: 50%;
  background: rgba(144, 77, 0, 0.045);
}

.menu-icon {
  width: 46rpx;
  height: 46rpx;
}

.menu-title {
  color: #1b1b1d;
  font-size: 33rpx;
  line-height: 50rpx;
}

.menu-title-wrap {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
}

.menu-unread-dot {
  width: 20rpx;
  height: 20rpx;
  margin-left: 10rpx;
  flex: 0 0 auto;
}

.chevron {
  width: 46rpx;
  height: 46rpx;
  opacity: 0.58;
}

.menu-divider {
  height: 1rpx;
  margin-left: 31rpx;
  margin-right: 31rpx;
  background: rgba(221, 193, 174, 0.12);
}

.version {
  padding: 31rpx 0;
  color: rgba(86, 67, 52, 0.28);
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
  text-align: center;
}

.bottom-spacer {
  height: 36rpx;
}

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
  min-height: 123rpx;
  padding: 8rpx 31rpx calc(8rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(221, 193, 174, 0.3);
  background: rgba(252, 248, 251, 0.86);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.tab-item {
  min-width: 132rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #454749;
  font-size: 25rpx;
  line-height: 35rpx;
  transition: transform 120ms ease;
}

.tab-active {
  color: #904d00;
  font-weight: 600;
}

.tab-icon-img {
  width: 46rpx;
  height: 46rpx;
  margin-bottom: 2rpx;
}

.auth-mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(27, 28, 28, 0.38);
}

.auth-sheet {
  width: 100%;
  box-sizing: border-box;
  padding: 42rpx 40rpx calc(42rpx + env(safe-area-inset-bottom));
  border-radius: 38rpx 38rpx 0 0;
  background: #ffffff;
  text-align: center;
}

.auth-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18rpx;
  border-radius: 50%;
  background: #f6f3f5;
}

.auth-icon-wrap image {
  width: 58rpx;
  height: 58rpx;
}

.auth-title {
  display: block;
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 46rpx;
  font-weight: 700;
}

.auth-copy {
  display: block;
  max-width: 560rpx;
  margin: 10rpx auto 30rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 24rpx;
  line-height: 36rpx;
}

.auth-button {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 30rpx;
  line-height: 42rpx;
  font-weight: 700;
  box-shadow: 0 18rpx 38rpx rgba(255, 140, 0, 0.24);
}

.auth-button::after {
  border: 0;
}

.auth-cancel {
  margin-top: 28rpx;
  color: rgba(86, 67, 52, 0.64);
  font-size: 26rpx;
  line-height: 36rpx;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(27, 28, 28, 0.4);
  -webkit-backdrop-filter: blur(8rpx);
  backdrop-filter: blur(8rpx);
}

.nickname-modal {
  width: 614rpx;
  box-sizing: border-box;
  padding: 46rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 24rpx 64rpx rgba(27, 28, 28, 0.16);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.modal-head image {
  width: 42rpx;
  height: 42rpx;
  opacity: 0.62;
}

.nickname-avatar {
  display: none;
}

.nickname-avatar image {
  width: 100%;
  height: 100%;
}

.nickname-input {
  height: 92rpx;
  box-sizing: border-box;
  margin-top: 30rpx;
  padding: 0 31rpx;
  border: 0;
  border-radius: 16rpx;
  background: #f0edef;
  color: #1b1b1d;
  font-size: 30rpx;
  line-height: 42rpx;
  text-align: center;
}

.input-placeholder {
  color: rgba(137, 115, 98, 0.46);
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 23rpx;
  margin-top: 31rpx;
}

.modal-secondary,
.modal-primary {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  font-size: 30rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.modal-secondary {
  background: #f6f3f5;
  color: rgba(86, 67, 52, 0.72);
}

.modal-primary {
  background: #ff8c00;
  color: #ffffff;
  box-shadow: 0 16rpx 34rpx rgba(255, 140, 0, 0.22);
}

.pro-modal {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fcf8fb;
}

.pro-nav {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: env(safe-area-inset-top) 31rpx 0;
  box-sizing: content-box;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.28);
  background: rgba(252, 248, 251, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.pro-nav > text {
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.pro-nav > image,
.pro-nav-back {
  position: absolute;
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pro-nav-back {
  left: 23rpx;
}

.pro-nav > image {
  right: 23rpx;
  opacity: 0.55;
}

.pro-nav image {
  width: 42rpx;
  height: 42rpx;
}

.pro-scroll {
  height: calc(100vh - 108rpx - env(safe-area-inset-top));
}

.pro-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 78rpx 31rpx 92rpx;
  background: linear-gradient(180deg, rgba(255, 140, 0, 0.12) 0%, #fcf8fb 100%);
  text-align: center;
}

.pro-chip {
  display: flex;
  align-items: center;
  padding: 8rpx 23rpx;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.pro-chip image {
  width: 30rpx;
  height: 30rpx;
  margin-right: 8rpx;
  filter: brightness(0) invert(1);
}

.pro-hero-title {
  max-width: 640rpx;
  margin-top: 31rpx;
  color: #1b1b1d;
  font-size: 54rpx;
  line-height: 68rpx;
  font-weight: 900;
}

.pro-hero-copy {
  margin-top: 16rpx;
  color: rgba(86, 67, 52, 0.62);
  font-size: 29rpx;
  line-height: 42rpx;
}

.pro-orbits {
  display: flex;
  align-items: center;
  gap: 46rpx;
  margin-top: 62rpx;
  opacity: 0.88;
}

.orbit-card {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 31rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12rpx 34rpx rgba(27, 27, 29, 0.06);
}

.orbit-card image {
  width: 62rpx;
  height: 62rpx;
}

.orbit-left,
.orbit-right {
  width: 108rpx;
  height: 108rpx;
}

.orbit-main {
  width: 123rpx;
  height: 123rpx;
}

.pro-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 23rpx;
  padding: 31rpx;
}

.pro-feature {
  min-height: 184rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 46rpx;
  background: rgba(255, 255, 255, 0.76);
  text-align: center;
}

.pro-feature view {
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
  border-radius: 50%;
  background: rgba(255, 140, 0, 0.1);
}

.pro-feature image {
  width: 46rpx;
  height: 46rpx;
}

.pro-feature text:nth-child(2) {
  color: #1b1b1d;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 800;
}

.pro-feature text:nth-child(3) {
  margin-top: 4rpx;
  color: rgba(86, 67, 52, 0.52);
  font-size: 19rpx;
  line-height: 27rpx;
}

.plan-section {
  padding: 12rpx 31rpx 0;
}

.plan-title {
  display: block;
  margin-bottom: 23rpx;
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 23rpx;
}

.plan-card {
  position: relative;
  min-height: 154rpx;
  padding: 31rpx;
  border: 4rpx solid rgba(221, 193, 174, 0.55);
  border-radius: 46rpx;
  background: #ffffff;
}

.plan-active {
  border-color: #ff8c00;
  background: rgba(255, 140, 0, 0.05);
}

.plan-card > text {
  color: rgba(86, 67, 52, 0.68);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 700;
}

.plan-card view:not(.best-tag) {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.plan-card view text:first-child {
  color: #1b1b1d;
  font-size: 42rpx;
  line-height: 54rpx;
  font-weight: 900;
}

.plan-card view text:last-child {
  margin-left: 6rpx;
  color: rgba(86, 67, 52, 0.55);
  font-size: 21rpx;
}

.best-tag {
  position: absolute;
  top: -18rpx;
  right: 24rpx;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 18rpx;
  line-height: 24rpx;
  font-weight: 800;
}

.pro-bottom-spacer {
  height: 230rpx;
}

.pro-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 24rpx 31rpx calc(30rpx + env(safe-area-inset-bottom));
  background: rgba(252, 248, 251, 0.88);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.pro-open-button {
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
  box-shadow: 0 20rpx 42rpx rgba(255, 140, 0, 0.2);
}

.pro-open-button image {
  width: 38rpx;
  height: 38rpx;
  margin-right: 10rpx;
  filter: brightness(0) invert(1);
}

.pro-open-button::after {
  border: 0;
}

.pro-footer > text {
  display: block;
  margin-top: 18rpx;
  color: rgba(86, 67, 52, 0.45);
  font-size: 21rpx;
  line-height: 30rpx;
  text-align: center;
}

.card-press,
.menu-press,
.tab-press,
.tap-press,
.button-press {
  transform: scale(0.98);
}
</style>


