<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>累计记录</text></view>
    <view class="nav-search" :style="navActionStyle">
      <image src="/static/assets/icons/search-outline.svg" mode="aspectFit"></image>
    </view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="search-wrap">
      <image src="/static/assets/icons/search-outline.svg" mode="aspectFit"></image>
      <input
        class="search-input"
        :value="query"
        placeholder="搜索累计的重要时刻..."
        placeholder-class="search-placeholder"
        @input="handleSearchInput"
      />
      <view v-if="query" class="clear-button" @tap="handleClearSearch" hover-class="tap-press">
        <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view v-if="records.length" class="record-list">
      <view
        class="record-card"
       
       
        :data-id="item.eventId"
        @tap="handleOpenRecord"
        hover-class="tap-press"
       v-for="(item, index) in records" :key="item.id">
        <image class="record-image" :src="item.image" mode="aspectFill"></image>
        <view class="record-overlay"></view>
        <view class="record-copy">
          <text>{{item.title}}</text>
          <text>{{item.dateText}}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <image src="/static/assets/icons/search-outline.svg" mode="aspectFit"></image>
      <text>暂无相关记录</text>
      <text>换个关键词试试，寻找你的珍贵瞬间</text>
    </view>
  </scroll-view>
</view>
</template>

<script>
const { getEvents, refreshEventsFromCloud } = require("../../utils/event-store")
const { getWindowMetrics } = require("../../utils/system-info")

function formatCompletedDate(target, createdAt) {
  const date = target
    ? new Date(target.year, target.month - 1, target.day)
    : new Date(createdAt || Date.now())
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `完成日期 · ${date.getFullYear()}.${month}.${day}`
}

function isCompleted(event) {
  if (event.completed) {
    return true
  }

  const target = event.target

  if (!target) {
    return false
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return new Date(target.year, target.month - 1, target.day).getTime() <= today
}

function normalizeRecord(event) {
  return {
    id: event.id,
    eventId: event.id,
    dateText: formatCompletedDate(event.target, event.createdAt),
    image: (event.background && event.background.image) || "/static/assets/create/preview-bg.jpg",
    title: event.title || "未命名时刻"
  }
}

export default {
  data() {
    return {
    allRecords: [],
    contentTop: 96,
    navActionStyle: "",
    navShellStyle: "",
    query: "",
    records: []
  }
  },
  onLoad() {
    this.setupNavigation()
  },
  async onShow() {
    await refreshEventsFromCloud()
    this.loadRecords()
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
      contentTop: navHeight + 28
    })
  },
    loadRecords() {
    const allRecords = getEvents().filter(isCompleted).map(normalizeRecord)
    this.setData({ allRecords })
    this.applySearch(this.query, allRecords)
  },
    applySearch(queryValue, source = this.allRecords) {
    const query = String(queryValue || "").trim().toLowerCase()
    const records = query
      ? source.filter((item) => item.title.toLowerCase().includes(query) || item.dateText.toLowerCase().includes(query))
      : source

    this.setData({ query, records })
  },
    handleSearchInput(event) {
    this.applySearch(event.detail.value)
  },
    handleClearSearch() {
    this.applySearch("")
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/mine/mine" })
  },
    handleOpenRecord(event) {
    const id = event.currentTarget.dataset.id

    if (id) {
      uni.navigateTo({ url: `/pages/event-detail/event-detail?id=${encodeURIComponent(id)}` })
    }
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
.nav-title,
.nav-search {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 31rpx;
  width: 84rpx;
}

.nav-back image,
.nav-search image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 124rpx;
  right: 124rpx;
  justify-content: center;
  color: #1b1b1d;
  font-size: 36rpx;
  line-height: 50rpx;
  font-weight: 800;
}

.nav-search {
  right: 31rpx;
  width: 84rpx;
  justify-content: flex-end;
  opacity: 0.72;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 31rpx;
  padding-right: 31rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.search-wrap {
  position: relative;
  height: 92rpx;
  display: flex;
  align-items: center;
  margin-bottom: 31rpx;
  padding: 0 31rpx;
  box-sizing: border-box;
  border-radius: 31rpx;
  background: #f0edef;
}

.search-wrap > image {
  width: 38rpx;
  height: 38rpx;
  flex: 0 0 auto;
}

.search-input {
  flex: 1;
  height: 92rpx;
  margin-left: 18rpx;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.search-placeholder {
  color: rgba(86, 67, 52, 0.45);
}

.clear-button {
  width: 46rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.clear-button image {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.46;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 31rpx;
}

.record-card {
  position: relative;
  height: 369rpx;
  overflow: hidden;
  border-radius: 46rpx;
  background: #e4e2e4;
  box-shadow: 0 18rpx 44rpx rgba(27, 27, 29, 0.08);
}

.record-image,
.record-overlay,
.record-copy {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.record-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.58) 100%);
}

.record-copy {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 42rpx;
}

.record-copy text:first-child {
  color: #ffffff;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.record-copy text:last-child {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 600;
}

.empty-state {
  min-height: 620rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-state image {
  width: 78rpx;
  height: 78rpx;
  margin-bottom: 22rpx;
  opacity: 0.28;
}

.empty-state text:nth-child(2) {
  color: rgba(86, 67, 52, 0.72);
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 800;
}

.empty-state text:nth-child(3) {
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.52);
  font-size: 27rpx;
  line-height: 38rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
