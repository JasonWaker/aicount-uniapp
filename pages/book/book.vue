<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-content" :style="navContentStyle">
      <text class="nav-title">&#x5012;&#x6570;&#x672c;</text>
    </view>
  </view>

  <scroll-view class="content" :scroll-y="!dragging" enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="welcome">
      <text class="welcome-title">&#x7ba1;&#x7406;&#x5206;&#x7c7b;</text>
      <text class="welcome-subtitle">&#x7ec4;&#x7ec7;&#x60a8;&#x7684;&#x73cd;&#x8d35;&#x65f6;&#x523b;</text>
    </view>

    <view class="category-grid">
      <view
        :class="'category-card ' + (item.coverClass) + ' ' + (dragging ? (dragIndex === index ? 'category-card-dragging' : '') : '')"
       
       
        :data-id="item.id"
        :data-index="index"
        @tap="handleOpenCategory"
        @longpress="handleCardLongPress"
        @touchmove="handleCardTouchMove"
        @touchend="handleCardTouchEnd"
        @touchcancel="handleCardTouchEnd"
        :hover-class="dragging ? '' : 'category-card-active'"
        hover-stay-time="80"
        :style="item.coverStyle"
       v-for="(item, index) in categories" :key="item.id">
        <view class="card-top">
          <view :class="'category-icon icon-' + (item.tone)">
            <image class="icon-img" :src="item.iconSrc" mode="aspectFit"></image>
          </view>
          <text class="count-badge">{{item.count}}</text>
        </view>
        <view class="category-copy">
          <text class="category-title">{{item.title}}</text>
          <text class="category-desc">{{item.desc}}</text>
        </view>
      </view>

      <view class="add-card" @tap="handleAddCategory" hover-class="add-card-active">
        <image class="add-icon-img" src="/static/assets/icons/add-circle.svg" mode="aspectFit"></image>
        <text class="add-text">&#x65b0;&#x589e;&#x5206;&#x7c7b;</text>
      </view>
    </view>

    <view class="stats-card">
      <view class="stats-head">
        <image class="stats-icon" src="/static/assets/icons/query-stats.svg" mode="aspectFit"></image>
        <text class="stats-title">&#x65f6;&#x95f4;&#x5206;&#x5e03;</text>
      </view>

      <view class="progress-row">
        <text class="progress-label">&#x672c;&#x6708;&#x5df2;&#x5ea6;&#x8fc7;</text>
        <text class="progress-value">{{monthProgress}}%</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="monthProgressStyle"></view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </scroll-view>

  <view class="tabbar">
    <view class="tab-item" @tap="handleTabHome" hover-class="tab-press">
      <image class="tab-icon-img" src="/static/assets/icons/home.svg" mode="aspectFit"></image>
      <text>&#x9996;&#x9875;</text>
    </view>
    <view class="tab-item tab-active">
      <view class="tab-indicator"></view>
      <image class="tab-icon-img" src="/static/assets/icons/import-contacts-active.svg" mode="aspectFit"></image>
      <text>&#x5012;&#x6570;&#x672c;</text>
    </view>
    <view class="tab-item" @tap="handleTabMine" hover-class="tab-press">
      <image class="tab-icon-img" src="/static/assets/icons/person.svg" mode="aspectFit"></image>
      <text>&#x6211;&#x7684;</text>
    </view>
  </view>
</view>
</template>

<script>
const { getBookSummary } = require("../../utils/book-events")
const { defaultCountdownBooks, getCountdownBooks, isDefaultCountdownBook, refreshCountdownBooksFromCloud, saveCountdownBookOrder } = require("../../utils/countdown-books")

function calculateMonthProgress(date = new Date()) {
  const year = date.getFullYear()
  const monthIndex = date.getMonth()
  const day = date.getDate()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const progress = Math.round((day / daysInMonth) * 100)

  return Math.max(0, Math.min(100, progress))
}

export default {
  data() {
    return {
    categories: [],
    contentTop: 112,
    dragging: false,
    dragIndex: -1,
    dragReady: false,
    monthProgress: 0,
    monthProgressStyle: "width: 0%;",
    navShellStyle: "",
    navContentStyle: ""
  }
  },
  onLoad() {
    this.loadCategories()
    this.updateMonthProgress()
    this.setupNavigation()
  },
  async onShow() {
    if (getApp().getAuthState().isLoggedIn) {
      await refreshCountdownBooksFromCloud()
    }
    this.loadCategories()
    this.updateMonthProgress()
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
    loadCategories() {
    const auth = getApp().getAuthState()
    const isLoggedIn = !!auth.isLoggedIn
    const sourceBooks = isLoggedIn ? getCountdownBooks() : defaultCountdownBooks
    const categories = sourceBooks.map((book) => {
      const summary = isLoggedIn ? getBookSummary(book.id) : { events: [] }
      const isSystemDefault = book.isDefault || isDefaultCountdownBook(book.id)

      return {
        ...book,
        coverClass: !isSystemDefault && book.coverColor ? "category-card-cover" : "",
        coverStyle: !isSystemDefault && book.coverColor ? `background: ${book.coverColor};` : "",
        count: isLoggedIn ? (summary.events.length || book.count || 0) : (book.count || 0)
      }
    })

    this.setData({ categories })
  },
    cacheCardRects(callback) {
    uni.createSelectorQuery()
      .in(this)
      .selectAll(".category-card")
      .boundingClientRect((rects) => {
        this.cardRects = Array.isArray(rects) ? rects : []

        if (typeof callback === "function") {
          callback(this.cardRects)
        }
      })
      .exec()
  },
    handleCardLongPress(event) {
    const index = Number(event.currentTarget.dataset.index)

    if (Number.isNaN(index)) {
      return
    }

    uni.vibrateShort({ type: "light" })
    this.cacheCardRects(() => {
      this.setData({
        dragging: true,
        dragIndex: index,
        dragReady: true
      })
    })
  },
    handleCardTouchMove(event) {
    if (!this.dragging || !this.dragReady) {
      return
    }

    const touch = event.touches && event.touches[0]

    if (!touch || !this.cardRects || !this.cardRects.length) {
      return
    }

    const targetIndex = this.getDragTargetIndex(touch.clientX, touch.clientY)

    if (targetIndex < 0 || targetIndex === this.dragIndex) {
      return
    }

    const categories = this.reorderCategories(this.categories, this.dragIndex, targetIndex)

    this.setData({
      categories,
      dragIndex: targetIndex
    }, () => {
      this.cacheCardRects()
    })
  },
    handleCardTouchEnd() {
    if (!this.dragging) {
      return
    }

    saveCountdownBookOrder(this.categories.map((item) => item.id))
    this.ignoreNextTap = true
    this.setData({
      dragging: false,
      dragIndex: -1,
      dragReady: false
    })

    setTimeout(() => {
      this.ignoreNextTap = false
    }, 250)
  },
    getDragTargetIndex(clientX, clientY) {
    let targetIndex = -1
    let nearestDistance = Infinity

    this.cardRects.forEach((rect, index) => {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.abs(clientX - centerX) + Math.abs(clientY - centerY)
      const inRect = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

      if (inRect || distance < nearestDistance) {
        nearestDistance = distance
        targetIndex = index
      }
    })

    return targetIndex
  },
    reorderCategories(categories, fromIndex, toIndex) {
    const nextCategories = categories.slice()
    const moving = nextCategories.splice(fromIndex, 1)[0]

    nextCategories.splice(toIndex, 0, moving)
    return nextCategories
  },
    updateMonthProgress() {
    const monthProgress = calculateMonthProgress()

    this.setData({
      monthProgress,
      monthProgressStyle: `width: ${monthProgress}%;`
    })
  },
    setupNavigation() {
    const system = uni.getSystemInfoSync()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const menuRight = system.windowWidth && menu.left ? system.windowWidth - menu.left : 88
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navShellStyle: `height:${navHeight}px;`,
      navContentStyle: `top:${menuTop}px;height:${menuHeight}px;right:${menuRight + menu.width + 12}px;`,
      contentTop: navHeight + 18
    })
  },
    handleOpenCategory(event) {
    if (this.ignoreNextTap || this.dragging) {
      return
    }

    const id = event.currentTarget.dataset.id

    if (!id) {
      return
    }

    if (!getApp().getAuthState().isLoggedIn) {
      this.requestPhoneLogin(() => {
        this.loadCategories()
        this.navigateToCategory(id)
      })
      return
    }

    this.navigateToCategory(id)
  },
    navigateToCategory(id) {
    uni.navigateTo({
      url: `/pages/book-detail/book-detail?id=${encodeURIComponent(id)}`
    })
  },
    completeMockPhoneLogin(loginCode = "") {
    getApp().setAuthState({
      isLoggedIn: true,
      loginCode,
      nickname: "",
      phoneCode: "mock-phone-auth",
      phoneLabel: "138****8888"
    })

    uni.showToast({ title: "\u767b\u5f55\u6210\u529f", icon: "success" })
  },
    requestPhoneLogin(onSuccess) {
    uni.showModal({
      title: "\u624b\u673a\u53f7\u6388\u6743",
      content: "\u6388\u6743\u624b\u673a\u53f7\u540e\uff0c\u53ef\u67e5\u770b\u5012\u6570\u672c\u8be6\u60c5\u5e76\u540c\u6b65\u7ba1\u7406\u4f60\u7684\u73cd\u8d35\u65f6\u523b\u3002",
      confirmText: "\u6388\u6743\u767b\u5f55",
      cancelText: "\u6682\u4e0d\u767b\u5f55",
      success: ({ confirm }) => {
        if (!confirm) {
          return
        }

        uni.login({
          success: ({ code }) => {
            this.completeMockPhoneLogin(code || "mock-login-code")
            if (typeof onSuccess === "function") {
              onSuccess()
            }
          },
          fail: () => {
            this.completeMockPhoneLogin("mock-login-code")
            if (typeof onSuccess === "function") {
              onSuccess()
            }
          }
        })
      }
    })
  },
    handleAddCategory() {
    uni.navigateTo({ url: "/pages/book-category-create/book-category-create" })
  },
    handleTabHome() {
    uni.redirectTo({ url: "/pages/index/index" })
  },
    handleTabMine() {
    uni.redirectTo({ url: "/pages/mine/mine" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f8f8f9;
  color: #1b1b1d;
  overflow: hidden;
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  border-bottom: 1rpx solid #f0edef;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-content {
  position: absolute;
  left: 40rpx;
  display: flex;
  align-items: center;
}

.nav-title {
  color: #904d00;
  font-size: 36rpx;
  line-height: 48rpx;
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(116rpx + env(safe-area-inset-bottom));
  overflow-x: hidden;
}

.welcome {
  display: flex;
  flex-direction: column;
  margin-bottom: 28rpx;
}

.welcome-title {
  color: #1b1b1d;
  font-size: 42rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.welcome-subtitle {
  margin-top: 2rpx;
  color: rgba(86, 67, 52, 0.6);
  font-size: 29rpx;
  line-height: 42rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 29rpx;
}

.category-card,
.add-card,
.stats-card {
  box-sizing: border-box;
  border: 1rpx solid #ededef;
  border-radius: 24rpx;
  background: #ffffff;
}

.category-card {
  position: relative;
  min-height: 224rpx;
  display: flex;
  flex-direction: column;
  padding: 28rpx;
  transition: transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
  will-change: transform;
}

.category-card-cover {
  border-color: rgba(255, 255, 255, 0.42);
  box-shadow: 0 16rpx 42rpx rgba(144, 77, 0, 0.12);
}

.category-card-active,
.add-card-active,
.tab-press {
  transform: scale(0.98);
}

.category-card-dragging {
  z-index: 5;
  transform: scale(1.035);
  box-shadow: 0 24rpx 54rpx rgba(27, 28, 28, 0.14);
  opacity: 0.96;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.category-icon {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #904d00;
}

.icon-img {
  width: 42rpx;
  height: 42rpx;
}

.icon-warm {
  background: rgba(255, 220, 195, 0.42);
  color: #904d00;
}

.icon-blue {
  background: #eff6ff;
  color: #3b82f6;
}

.icon-red {
  background: #fef2f2;
  color: #ef4444;
}

.icon-purple {
  background: #faf5ff;
  color: #a855f7;
}

.icon-green {
  background: #f0fdf4;
  color: #22c55e;
}

.category-card-cover .category-icon {
  background: rgba(255, 255, 255, 0.34);
}

.category-card-cover .count-badge {
  background: rgba(255, 255, 255, 0.48);
  color: #1b1b1d;
}

.category-card-cover .category-title {
  color: #ffffff;
  text-shadow: 0 4rpx 12rpx rgba(27, 27, 29, 0.18);
}

.category-card-cover .category-desc {
  color: rgba(255, 255, 255, 0.86);
  text-shadow: 0 3rpx 10rpx rgba(27, 27, 29, 0.12);
}

.count-badge {
  min-width: 40rpx;
  height: 30rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: #eae7ea;
  color: #564334;
  font-size: 24rpx;
  line-height: 30rpx;
  font-weight: 500;
  text-align: center;
}

.category-copy {
  min-height: 82rpx;
  margin-top: auto;
  display: flex;
  flex-direction: column;
}

.category-title {
  color: #1b1b1d;
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 600;
}

.category-desc {
  margin-top: 4rpx;
  color: rgba(86, 67, 52, 0.52);
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-card {
  min-height: 224rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(221, 193, 174, 0.38);
  background: transparent;
  transition: transform 160ms ease, background-color 160ms ease;
}

.add-icon-img {
  width: 58rpx;
  height: 58rpx;
  margin-bottom: 15rpx;
}

.add-text {
  color: #564334;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.stats-card {
  margin-top: 28rpx;
  padding: 30rpx;
}

.stats-head {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.stats-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 15rpx;
}

.stats-title {
  color: #1b1b1d;
  font-size: 35rpx;
  line-height: 48rpx;
  font-weight: 600;
}

.progress-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.progress-label {
  color: #564334;
  font-size: 29rpx;
  line-height: 42rpx;
}

.progress-value {
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
}

.progress-track {
  width: 100%;
  height: 15rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #f0edef;
}

.progress-fill {
  width: 0;
  height: 100%;
  border-radius: 999rpx;
  background: #904d00;
  box-shadow: 0 8rpx 23rpx rgba(255, 140, 0, 0.15);
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
  justify-content: space-around;
  padding: 9rpx 31rpx calc(9rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0edef;
  background: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.tab-item {
  position: relative;
  min-width: 132rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #564334;
  font-size: 21rpx;
  line-height: 27rpx;
  transition: transform 120ms ease;
}

.tab-active {
  color: #904d00;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  top: -9rpx;
  width: 92rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #904d00;
}

.tab-icon-img {
  width: 34rpx;
  height: 34rpx;
  margin-bottom: 4rpx;
}
</style>
