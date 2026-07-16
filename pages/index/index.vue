<template>
<view class="page">
  <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="nav-shell" :style="navShellStyle">
      <view class="nav-content" :style="navContentStyle">
        <view class="brand">
          <image class="brand-icon-img" src="/static/assets/icons/calendar-today.svg" mode="aspectFit"></image>
          <text class="brand-title">AI倒数日</text>
        </view>
      </view>
      <view class="nav-subtitle" :style="navSubtitleStyle">
        <text>记录重要时刻，让等待更有意义</text>
      </view>
    </view>

    <block v-if="!isLoggedIn">
      <view class="guest-hero-card">
        <image class="guest-hero-image" src="/static/assets/lantern.jpg" mode="aspectFill"></image>
        <view class="guest-hero-shade"></view>
        <view class="guest-hero-body">
          <view class="guest-hero-top">
            <text class="guest-pin-chip">置顶</text>
            <image class="guest-star-icon-img" src="/static/assets/icons/star-filled.svg" mode="aspectFit"></image>
          </view>

          <view class="guest-hero-main">
            <text class="guest-hero-title">{{guestHeroTitle}}</text>
            <view class="guest-hero-count">
              <text class="guest-hero-number">{{guestDaysLeft}}</text>
              <text class="guest-hero-unit">天后</text>
            </view>
            <view class="guest-hero-date">
              <image class="guest-date-icon-img" src="/static/assets/icons/event-white.svg" mode="aspectFit"></image>
              <text>{{guestDateText}}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-head">
        <text class="section-title">近期重要节日</text>
        <view v-if="showViewAll" class="section-link tap-target" @tap="handleViewAll">
          <text>查看全部</text>
          <image class="chevron-icon-img" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
        </view>
      </view>

      <view class="guest-event-list">
        <view class="guest-event-card" :data-id="item.id" :data-system="true" @tap="handleOpenDetail" hover-class="guest-event-card-active" hover-stay-time="80" v-for="(item, index) in events" :key="item.id">
          <view class="guest-event-main">
            <view :class="'guest-event-icon ' + (item.featured ? 'guest-event-icon-featured' : '')">
              <image class="guest-event-icon-img" :src="item.iconSrc" mode="aspectFit"></image>
            </view>
            <view class="guest-event-copy">
              <text class="guest-event-title">{{item.title}}</text>
              <text class="guest-event-date">{{item.dateText}}</text>
            </view>
          </view>
          <view class="guest-event-count">
            <text :class="'guest-event-number ' + (item.featured ? 'guest-event-number-featured' : '')">{{item.daysLeft}}</text>
            <text class="guest-event-unit">天</text>
          </view>
        </view>
      </view>
    </block>

    <block v-else>
      <view class="hero-card" :data-id="mainPlan.id" :data-saved="mainPlan.saved" @tap="handleOpenDetail" hover-class="hero-card-active">
      <image class="hero-image" :src="mainPlan.image" mode="aspectFill"></image>
      <view class="hero-dark"></view>
      <view class="hero-glass">
        <view class="hero-top">
          <view>
            <view class="pin-chip">
              <image class="pin-icon-img" src="/static/assets/icons/push-pin-white.svg" mode="aspectFit"></image>
              <text>置顶</text>
            </view>
            <text class="hero-title">{{mainPlan.title}}</text>
          </view>
          <image class="hero-favorite" :src="mainPlan.iconSrc" mode="aspectFit"></image>
        </view>

        <view class="hero-count">
          <text class="hero-number">{{mainDaysLeft}}</text>
          <text class="hero-unit">天后</text>
        </view>

        <view class="hero-date">
          <image class="hero-date-icon" src="/static/assets/icons/calendar-today.svg" mode="aspectFit"></image>
          <text>{{mainDateText}}</text>
        </view>

        <view class="hero-quote">
          <image class="quote-icon-img" src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
          <text class="hero-quote-text">“{{mainPlan.quote}}”</text>
        </view>
      </view>
      </view>

      <view class="section-head">
        <text class="section-title">所有计划</text>
        <view v-if="showViewAll" class="section-link tap-target" @tap="handleViewAll">
          <text>查看全部</text>
          <image class="chevron-icon-img" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
        </view>
      </view>

      <view class="plan-list">
        <view class="plan-card" :data-id="item.id" :data-saved="item.saved" :data-system="item.system" @tap="handleOpenDetail" hover-class="plan-card-active" hover-stay-time="80" v-for="(item, index) in plans" :key="item.id">
          <view v-if="item.image" class="plan-thumb">
            <image class="plan-image" :src="item.image" mode="aspectFill"></image>
            <view class="thumb-shade"></view>
          </view>
          <view v-else class="plan-thumb plan-thumb-empty">
            <image class="plan-placeholder-icon" :src="item.iconSrc" mode="aspectFit"></image>
          </view>

          <view class="plan-main">
            <view class="plan-top">
              <text :class="'plan-category ' + (item.featured ? 'plan-category-featured' : '')">{{item.category}}</text>
              <view class="plan-right">
                <view class="plan-count">
                  <text :class="'plan-number ' + (item.featured ? 'plan-number-featured' : '')">{{item.daysLeft}}</text>
                  <text class="plan-unit">天后</text>
                </view>
                <view class="progress-track">
                  <view class="progress-fill" :style="'width: ' + (item.progress) + '%;'"></view>
                </view>
              </view>
            </view>
            <text class="plan-title">{{item.title}}</text>
            <text class="plan-quote">{{item.quote}}</text>
          </view>
        </view>
      </view>
    </block>

  </view>

  <view class="fab" @tap="handleAddCountdown" hover-class="fab-active">
    <image class="fab-icon-img" src="/static/assets/icons/add-white.svg" mode="aspectFit"></image>
  </view>

  <view class="tabbar">
    <view class="tab-item tab-active">
      <image class="tab-icon-img" src="/static/assets/icons/home-active.svg" mode="aspectFit"></image>
      <text>首页</text>
    </view>
    <view class="tab-item" @tap="handleTabBook" hover-class="tab-item-active">
      <image class="tab-icon-img" src="/static/assets/icons/book.svg" mode="aspectFit"></image>
      <text>倒数本</text>
    </view>
    <view class="tab-item" @tap="handleTabMine" hover-class="tab-item-active">
      <image class="tab-icon-img" src="/static/assets/icons/person.svg" mode="aspectFit"></image>
      <text>我的</text>
    </view>
  </view>
</view>
</template>

<script>
const { getEvents, getLatestPinnedEvent, getListEvents, refreshEventsFromCloud } = require("../../utils/event-store")
const { getWindowMetrics } = require("../../utils/system-info")
const { getSystemHolidays } = require("../../utils/system-holidays")

const guestEvents = getSystemHolidays()

const defaultPinnedPlan = {
  id: "default-pinned",
  title: "结婚纪念日",
  image: "/static/assets/home/hero-anniversary.jpg",
  iconSrc: "/static/assets/icons/favorite.svg",
  target: { year: 2026, month: 10, day: 22 },
  quote: "愿此时光如酒，待相拥时已至醇香。"
}
function getNextNewYearHoliday(date = new Date()) {
  const nextYear = date.getFullYear() + 1

  return {
    title: `${nextYear}年元旦`,
    target: { year: nextYear, month: 1, day: 1 }
  }
}

function toDate({ year, month, day }) {
  return new Date(year, month - 1, day)
}

function getDaysLeft(target) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const targetDate = toDate(target).getTime()
  const diff = Math.ceil((targetDate - today) / 86400000)
  return diff > 0 ? diff : 0
}

function formatDateText({ year, month, day }) {
  return `${year}年${month}月${day}日`
}

function toHomePlan(event) {
  const book = event.countdownBook || {}

  return {
    id: event.id,
    title: event.title,
    category: book.title || "倒数本",
    quote: event.aiReminder,
    image: event.background && event.background.image,
    iconSrc: book.iconSrc || "/static/assets/icons/book.svg",
    target: event.target,
    progress: 65,
    saved: true
  }
}

function toHolidayPlan(event) {
  return {
    id: event.id,
    title: event.title,
    category: "节日",
    quote: "AI提醒：把日历上的光，变成心里可期待的远方。",
    iconSrc: event.iconSrc || "/static/assets/icons/calendar-today.svg",
    target: event.target,
    progress: 0,
    featured: !!event.featured,
    saved: false,
    system: true
  }
}

function toPinnedPlan(event) {
  if (!event) {
    return defaultPinnedPlan
  }

  return {
    id: event.id,
    title: event.title,
    image: (event.background && event.background.image) || defaultPinnedPlan.image,
    iconSrc: (event.countdownBook && event.countdownBook.iconSrc) || defaultPinnedPlan.iconSrc,
    target: event.target,
    quote: (event.aiReminder || defaultPinnedPlan.quote).replace(/^AI提醒：/, ""),
    saved: true
  }
}

export default {
  data() {
    return {
    events: [],
    guestDateText: "",
    guestDaysLeft: 0,
    guestHeroTitle: getNextNewYearHoliday().title,
    isLoggedIn: false,
    navShellStyle: "",
    navContentStyle: "",
    navSubtitleStyle: "",
    contentTop: 96,
    mainDaysLeft: 0,
    mainDateText: "",
    mainPlan: defaultPinnedPlan,
    plans: [],
    showViewAll: false
  }
  },
  onLoad() {
    this.setupNavigation()
    this.syncAuthState()
    this.refreshCountdowns()
  },
  async onShow() {
    this.syncAuthState()
    if (this.isLoggedIn) {
      await refreshEventsFromCloud()
    }
    this.refreshCountdowns()
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
    syncAuthState() {
    const app = getApp()
    const auth = app.getAuthState()

    this.setData({
      isLoggedIn: !!auth.isLoggedIn
    })
  },
    setupNavigation() {
    const system = getWindowMetrics()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const menuRight = system.windowWidth && menu.left ? system.windowWidth - menu.left : 88
    const navHeight = menuTop + menuHeight + 30
    const contentTop = navHeight + 6

    this.setData({
      navShellStyle: `height:${navHeight}px;`,
      navContentStyle: `top:${menuTop}px;height:${menuHeight}px;right:${menuRight + 4}px;`,
      navSubtitleStyle: `top:${menuTop + menuHeight + 2}px;`,
      contentTop
    })
  },
    refreshCountdowns() {
    const auth = getApp().getAuthState()
    const isLoggedIn = !!auth.isLoggedIn
    const savedEvents = isLoggedIn ? getEvents() : []
    const mainPlan = toPinnedPlan(getLatestPinnedEvent(savedEvents))
    const savedPlans = getListEvents(savedEvents).map(toHomePlan)
    const holidayPlans = guestEvents.map(toHolidayPlan)
    const visiblePlans = isLoggedIn
      ? savedPlans.concat(holidayPlans)
      : holidayPlans
    const featuredGuestHoliday = getNextNewYearHoliday()

    this.setData({
      events: guestEvents.map((item) => ({
        ...item,
        daysLeft: getDaysLeft(item.target)
      })),
      guestDateText: formatDateText(featuredGuestHoliday.target),
      guestDaysLeft: getDaysLeft(featuredGuestHoliday.target),
      guestHeroTitle: featuredGuestHoliday.title,
      mainDaysLeft: getDaysLeft(mainPlan.target),
      mainDateText: formatDateText(mainPlan.target),
      mainPlan,
      plans: visiblePlans.slice(0, 3).map((item) => ({
        ...item,
        daysLeft: getDaysLeft(item.target)
      })),
      showViewAll: isLoggedIn && savedEvents.length > 3
    })
  },
    performFakeLogin() {
    const app = getApp()

    app.setAuthState({
      isLoggedIn: true,
      phoneCode: "mock_phone_code",
      phoneLabel: "微信用户"
    })

    this.syncAuthState()
    this.refreshCountdowns()

    uni.showToast({
      title: "登录成功",
      icon: "success"
    })

    setTimeout(() => {
      uni.navigateTo({
        url: "/pages/create/create"
      })
    }, 250)
  },
    handleAddCountdown() {
    if (!this.isLoggedIn) {
      uni.showModal({
        title: "手机号授权",
        content: "这里先走一个演示授权流程，确认后将默认登录成功。",
        confirmText: "确认授权",
        cancelText: "暂不登录",
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }

          this.performFakeLogin()
        }
      })

      return
    }

    uni.navigateTo({
      url: "/pages/create/create"
    })
  },
    handleViewAll() {
    if (!this.isLoggedIn) {
      uni.showToast({
        title: "登录后查看全部",
        icon: "none"
      })
      return
    }

    uni.navigateTo({
      url: "/pages/plans/plans"
    })
  },
    handleOpenDetail(event) {
    const { id, saved, system } = event.currentTarget.dataset

    if (system && id) {
      uni.navigateTo({
        url: `/pages/event-detail/event-detail?id=${encodeURIComponent(id)}&system=1`
      })
      return
    }

    if (!saved || !id) {
      uni.showToast({
        title: "请先创建自己的倒数事件",
        icon: "none"
      })
      return
    }

    uni.navigateTo({
      url: `/pages/event-detail/event-detail?id=${encodeURIComponent(id)}`
    })
  },
    handleTabBook() {
    uni.redirectTo({
      url: "/pages/book/book"
    })
  },
    handleTabMine() {
    uni.redirectTo({
      url: "/pages/mine/mine"
    })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #fcf8fb;
  overflow-x: hidden;
}

.tap-target {
  min-width: 84rpx;
  min-height: 84rpx;
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(252, 248, 251, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-content {
  position: absolute;
  left: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
}

.brand-icon-img {
  width: 36rpx;
  height: 36rpx;
  flex: 0 0 auto;
  margin-right: 15rpx;
}

.brand-title {
  max-width: 260rpx;
  color: #904d00;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 50rpx;
  white-space: nowrap;
}

.nav-subtitle {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  color: rgba(86, 67, 52, 0.7);
  font-size: 27rpx;
  line-height: 38rpx;
  white-space: nowrap;
}

.content {
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
  overflow: visible;
}

.guest-hero-card {
  position: relative;
  width: 100%;
  height: 492rpx;
  margin-bottom: 46rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #30201a;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.guest-hero-image,
.guest-hero-shade,
.guest-hero-body {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.guest-hero-shade {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.22) 52%, rgba(0, 0, 0, 0.02) 100%);
}

.guest-hero-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 46rpx;
  color: #ffffff;
}

.guest-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.guest-pin-chip {
  padding: 8rpx 23rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.92);
  font-size: 23rpx;
  line-height: 31rpx;
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.guest-star-icon-img {
  width: 42rpx;
  height: 42rpx;
}

.guest-hero-title {
  display: block;
  font-size: 54rpx;
  line-height: 65rpx;
  font-weight: 700;
}

.guest-hero-count {
  display: flex;
  align-items: flex-end;
  margin-top: 8rpx;
}

.guest-hero-number {
  font-size: 112rpx;
  line-height: 108rpx;
  font-weight: 700;
}

.guest-hero-unit {
  margin-left: 15rpx;
  padding-bottom: 8rpx;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.guest-hero-date {
  display: flex;
  align-items: center;
  margin-top: 15rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 25rpx;
  line-height: 35rpx;
}

.guest-date-icon-img {
  width: 29rpx;
  height: 29rpx;
  margin-right: 15rpx;
}

.guest-event-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.guest-event-card {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 154rpx;
  padding: 31rpx;
  border: 1rpx solid #e5e5e7;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  transition: transform 80ms ease;
}

.guest-event-card-active {
  transform: scale(0.98);
}

.guest-event-main {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
}

.guest-event-icon {
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-right: 31rpx;
  border-radius: 16rpx;
  background: #e4e2e4;
}

.guest-event-icon-featured {
  background: #ffdcc3;
}

.guest-event-icon-img {
  width: 46rpx;
  height: 46rpx;
}

.guest-event-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.guest-event-title {
  color: #1b1b1d;
  font-size: 33rpx;
  line-height: 44rpx;
  font-weight: 600;
}

.guest-event-date {
  margin-top: 4rpx;
  color: #564334;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
}

.guest-event-count {
  display: flex;
  align-items: baseline;
  flex: 0 0 auto;
  min-width: 104rpx;
  margin-left: 23rpx;
  justify-content: flex-end;
}

.guest-event-number {
  color: #564334;
  font-size: 46rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.guest-event-number-featured {
  color: #ff8c00;
}

.guest-event-unit {
  margin-left: 8rpx;
  color: #564334;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
}

.hero-card {
  position: relative;
  width: 100%;
  height: 526rpx;
  margin-bottom: 38rpx;
  border-radius: 46rpx;
  overflow: hidden;
  background: #e4e2e4;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: transform 80ms ease;
}

.hero-card-active {
  transform: scale(0.985);
}

.hero-image,
.hero-dark,
.hero-glass {
  position: absolute;
  width: 100%;
  height: 100%;
}

.hero-image,
.hero-dark {
  inset: 0;
}

.hero-dark {
  background: rgba(0, 0, 0, 0.1);
}

.hero-glass {
  left: 31rpx;
  top: 31rpx;
  right: 31rpx;
  bottom: 31rpx;
  width: auto;
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 36rpx 38rpx 42rpx;
  border-radius: 38rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 246, 239, 0.66);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  color: #1b1b1d;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.pin-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 21rpx;
  border-radius: 999rpx;
  background: #904d00;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.pin-icon-img {
  width: 27rpx;
  height: 27rpx;
  margin-right: 8rpx;
}

.hero-favorite {
  width: 46rpx;
  height: 46rpx;
  opacity: 0.58;
}

.hero-title {
  display: block;
  margin-top: 34rpx;
  color: #1b1b1d;
  font-size: 46rpx;
  line-height: 62rpx;
  font-weight: 700;
}

.hero-count {
  display: flex;
  align-items: baseline;
  margin: 12rpx 0 20rpx;
}

.hero-number {
  color: #ff8c00;
  font-size: 92rpx;
  line-height: 108rpx;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-unit {
  margin-left: 15rpx;
  color: rgba(27, 27, 29, 0.82);
  font-size: 38rpx;
  font-weight: 600;
}

.hero-date {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  color: rgba(86, 67, 52, 0.88);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 600;
}

.hero-date-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 12rpx;
  flex: 0 0 auto;
}

.hero-quote {
  display: flex;
  align-items: flex-start;
  padding-top: 0;
  border-top: 0;
  color: rgba(86, 67, 52, 0.78);
  font-size: 27rpx;
  line-height: 38rpx;
  font-style: italic;
}

.hero-quote-text {
  min-width: 0;
  flex: 1 1 auto;
  max-height: 76rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.quote-icon-img {
  width: 35rpx;
  height: 35rpx;
  margin-top: 2rpx;
  margin-right: 15rpx;
  flex: 0 0 auto;
  opacity: 0.95;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 29rpx;
}

.section-title {
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.section-link {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 2rpx;
  color: #904d00;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.chevron-icon-img {
  width: 27rpx;
  height: 27rpx;
  margin-left: 4rpx;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.plan-card {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 27rpx;
  min-height: 170rpx;
  padding: 25rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 31rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: transform 80ms ease;
}

.plan-card-active {
  transform: scale(0.98);
}

.plan-thumb {
  position: relative;
  width: 148rpx;
  height: 148rpx;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 23rpx;
  background: #e4e2e4;
}

.plan-image,
.thumb-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.thumb-shade {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), transparent);
}

.plan-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-placeholder-icon {
  width: 46rpx;
  height: 46rpx;
}

.plan-main {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.plan-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
  margin-bottom: 4rpx;
}

.plan-category {
  color: #904d00;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-category-featured {
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: #ffdcc3;
  color: #ff8c00;
}

.plan-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 0 0 128rpx;
  margin-left: 15rpx;
}

.plan-count {
  display: flex;
  align-items: baseline;
}

.plan-number {
  color: #904d00;
  font-size: 38rpx;
  line-height: 42rpx;
  font-weight: 600;
}

.plan-number-featured {
  color: #ff8c00;
}

.plan-unit {
  margin-left: 8rpx;
  color: #564334;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 600;
}

.progress-track {
  width: 128rpx;
  height: 8rpx;
  margin-top: 8rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e4e2e4;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #ff8c00;
}

.plan-title {
  color: #1b1b1d;
  font-size: 33rpx;
  line-height: 52rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-quote {
  margin-top: 6rpx;
  color: #5d5e60;
  font-size: 25rpx;
  line-height: 35rpx;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fab {
  position: fixed;
  right: 46rpx;
  bottom: calc(118rpx + env(safe-area-inset-bottom));
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: #ff8c00;
  color: #ffffff;
  box-shadow: 0 14rpx 38rpx rgba(255, 140, 0, 0.24);
}

.fab-active {
  transform: scale(0.92);
}

.fab-icon-img {
  width: 62rpx;
  height: 62rpx;
}

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 88rpx;
  padding: 4rpx 31rpx calc(4rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(221, 193, 174, 0.3);
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  min-width: 120rpx;
  min-height: 62rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5d5e60;
  font-size: 23rpx;
  line-height: 31rpx;
  font-weight: 500;
}

.tab-active {
  color: #904d00;
  font-weight: 600;
}

.tab-item-active {
  transform: scale(0.96);
}

.tab-icon-img {
  width: 38rpx;
  height: 38rpx;
  margin-bottom: 4rpx;
}
</style>
