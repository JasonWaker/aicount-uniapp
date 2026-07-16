<template>
<view class="page">
  <view class="mock-page">
    <view class="nav-shell" :style="navShellStyle">
      <view class="nav-action nav-back" :style="navActionStyle">
        <image class="nav-icon" src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
      </view>
      <view class="nav-title" :style="navActionStyle">
        <text>新建时刻</text>
      </view>
    </view>

    <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
      <view class="ai-card">
        <view class="ai-icon-wrap">
          <image class="ai-icon" src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
        </view>
        <view class="ai-copy">
          <text class="ai-title">AI 智能创建</text>
          <text class="ai-subtitle">描述您的时刻，让 AI 为您打理一切</text>
        </view>
        <image class="row-chevron" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
      </view>

      <view class="section">
        <text class="section-label">第 1 步：基本信息</text>
        <view class="list-card">
          <view class="form-row">
            <text class="row-label fixed-label">事件名称</text>
            <text class="placeholder">例如：我的生日</text>
          </view>
          <view class="category-block">
            <text class="row-label">分类选择</text>
            <view class="category-grid">
              <view class="category-item category-active">
                <image class="category-icon" src="/static/assets/icons/favorite-white.svg" mode="aspectFit"></image>
                <text>生活</text>
              </view>
              <view class="category-item">
                <image class="category-icon" src="/static/assets/icons/flight.svg" mode="aspectFit"></image>
                <text>旅行</text>
              </view>
              <view class="category-item">
                <image class="category-icon" src="/static/assets/icons/work.svg" mode="aspectFit"></image>
                <text>工作</text>
              </view>
              <view class="category-item">
                <image class="category-icon" src="/static/assets/icons/more-horiz.svg" mode="aspectFit"></image>
                <text>其他</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-label">第 2 步：时间与备注</text>
        <view class="list-card">
          <view class="form-row row-between">
            <text class="row-label">目标日期</text>
            <view class="row-value">
              <text class="primary-value">2024年12月25日</text>
              <image class="small-icon" src="/static/assets/icons/calendar-month.svg" mode="aspectFit"></image>
            </view>
          </view>
          <view class="note-row">
            <text class="row-label">备注</text>
            <text class="note-placeholder">记录下这一刻的期待...</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="overlay" @tap="handleBack"></view>

  <view class="bottom-sheet">
    <view class="sheet-head">
      <text class="sheet-title">选择倒数本</text>
      <view class="close-button" @tap="handleBack" hover-class="tap-press">
        <image class="close-icon" src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="book-list">
      <view :class="'book-row ' + (item.selected ? 'book-row-active' : '')" :data-id="item.id" @tap="handleSelect" hover-class="row-press" v-for="(item, index) in books" :key="item.id">
        <view class="book-main">
          <image class="book-icon" :src="item.icon" mode="aspectFit"></image>
          <text class="book-label">{{item.label}}</text>
        </view>
        <image class="radio-icon" :src="item.selected ? '/static/assets/icons/radio-button-checked.svg' : '/static/assets/icons/radio-button-unchecked.svg'" mode="aspectFit"></image>
      </view>
    </view>

    <view class="sheet-footer">
      <button class="confirm-button" @tap="handleConfirm" hover-class="button-press">确定</button>
    </view>
  </view>
</view>
</template>

<script>
const { getCountdownBooks, getSelectedCountdownBook, refreshCountdownBooksFromCloud } = require("../../utils/countdown-books")

export default {
  data() {
    return {
    books: [],
    contentTop: 88,
    navActionStyle: "",
    navShellStyle: "",
    selectedBook: "life"
  }
  },
  onLoad() {
    this.loadBooks()
    this.setupNavigation()
  },
  async onShow() {
    await refreshCountdownBooksFromCloud()
    this.loadBooks()
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
    loadBooks() {
    const selected = getSelectedCountdownBook()
    const books = getCountdownBooks().map((book) => ({
      ...book,
      label: book.title,
      icon: book.iconSrc,
      selected: book.id === selected.id
    }))

    this.setData({
      books,
      selectedBook: selected.id
    })
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
      contentTop: navHeight + 36
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/create/create" })
  },
    handleSelect(event) {
    const selectedBook = event.currentTarget.dataset.id

    this.setData({
      selectedBook,
      books: this.books.map((item) => ({
        ...item,
        selected: item.id === selectedBook
      }))
    })
  },
    handleConfirm() {
    const selected = this.books.find((item) => item.id === this.selectedBook)

    if (!selected) {
      this.handleBack()
      return
    }

    uni.setStorageSync("selectedCountdownBook", selected)
    uni.navigateBack()
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: #f5f5f7;
  color: #1b1b1d;
}

.mock-page {
  min-height: 100vh;
  background: #f5f5f7;
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.3);
  background: rgba(252, 248, 251, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-action,
.nav-title {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 30rpx;
  width: 58rpx;
  justify-content: flex-start;
}

.nav-title {
  left: 50%;
  width: 180rpx;
  justify-content: center;
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
  transform: translateX(-50%);
}

.nav-icon {
  width: 46rpx;
  height: 46rpx;
}

.content {
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 170rpx;
}

.ai-card {
  position: relative;
  min-height: 184rpx;
  display: flex;
  align-items: center;
  gap: 29rpx;
  margin-bottom: 46rpx;
  padding: 39rpx 38rpx;
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 31rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.ai-card::after {
  content: "";
  position: absolute;
  top: -31rpx;
  right: -31rpx;
  width: 184rpx;
  height: 184rpx;
  border-radius: 50%;
  background: rgba(144, 77, 0, 0.05);
  filter: blur(18rpx);
}

.ai-icon-wrap {
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(255, 140, 0, 0.1);
}

.ai-icon {
  width: 54rpx;
  height: 54rpx;
}

.ai-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.ai-title {
  color: #1b1b1d;
  font-size: 33rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.ai-subtitle {
  margin-top: 2rpx;
  color: rgba(93, 94, 96, 0.8);
  font-size: 25rpx;
  line-height: 34rpx;
}

.row-chevron {
  position: relative;
  z-index: 1;
  width: 38rpx;
  height: 38rpx;
  opacity: 0.32;
}

.section {
  margin-bottom: 46rpx;
}

.section-label {
  display: block;
  margin: 0 31rpx 15rpx;
  color: #5d5e60;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
}

.list-card {
  overflow: hidden;
  border-radius: 23rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.form-row {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  padding: 23rpx 31rpx;
  border-bottom: 1rpx solid rgba(229, 229, 231, 0.9);
}

.row-between {
  justify-content: space-between;
}

.row-label {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.fixed-label {
  width: 184rpx;
  flex: 0 0 auto;
}

.placeholder,
.note-placeholder {
  color: rgba(137, 115, 98, 0.42);
  font-size: 29rpx;
  line-height: 42rpx;
}

.category-block {
  padding: 28rpx 31rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22rpx;
  margin-top: 27rpx;
}

.category-item {
  min-height: 112rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 21rpx;
  background: #f6f3f5;
  color: #5d5e60;
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 500;
}

.category-active {
  background: #ff8c00;
  color: #ffffff;
}

.category-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 7rpx;
}

.row-value {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.primary-value {
  color: #904d00;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 500;
}

.small-icon {
  width: 35rpx;
  height: 35rpx;
}

.note-row {
  min-height: 165rpx;
  padding: 31rpx;
}

.note-placeholder {
  display: block;
  margin-top: 15rpx;
}

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.39);
  -webkit-backdrop-filter: blur(4rpx);
  backdrop-filter: blur(4rpx);
}

.bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  box-sizing: border-box;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 46rpx 46rpx 0 0;
  background: #ffffff;
  box-shadow: 0 -24rpx 70rpx rgba(0, 0, 0, 0.22);
}

.sheet-head {
  min-height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 38rpx 0 56rpx;
}

.sheet-title {
  color: #1b1b1d;
  font-size: 35rpx;
  line-height: 48rpx;
  font-weight: 700;
}

.close-button {
  width: 68rpx;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.78;
}

.book-list {
  flex: 1 1 auto;
  box-sizing: border-box;
  padding: 24rpx 42rpx 10rpx;
  overflow-y: auto;
}

.book-row {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  margin-bottom: 10rpx;
  padding: 0 30rpx;
  border: 1rpx solid transparent;
  border-radius: 23rpx;
}

.book-row:last-child {
  margin-bottom: 0;
}

.book-row-active {
  border-color: rgba(144, 77, 0, 0.16);
  background: rgba(144, 77, 0, 0.045);
}

.book-main {
  display: flex;
  align-items: center;
  gap: 21rpx;
  min-width: 0;
}

.book-icon {
  width: 40rpx;
  height: 40rpx;
  flex: 0 0 auto;
}

.book-label {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 500;
}

.radio-icon {
  width: 40rpx;
  height: 40rpx;
  flex: 0 0 auto;
}

.sheet-footer {
  padding: 22rpx 56rpx calc(36rpx + env(safe-area-inset-bottom));
}

.confirm-button {
  box-sizing: border-box;
  width: 100%;
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  border-radius: 27rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 700;
  box-shadow: 0 18rpx 38rpx rgba(255, 140, 0, 0.24);
}

.confirm-button::after {
  border: 0;
}

.tap-press,
.row-press,
.button-press {
  transform: scale(0.98);
}
</style>
