<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">
      <text>{{title}}</text>
    </view>
    <view class="nav-spacer" :style="navActionStyle"></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="search-wrap">
      <image src="/static/assets/icons/search-outline.svg" mode="aspectFit"></image>
      <input
        class="search-input"
        confirm-type="search"
        :value="query"
        :placeholder="searchPlaceholder"
        placeholder-class="search-placeholder"
        @input="handleSearchInput"
      />
      <view class="clear-button" v-if="query" @tap="handleClearSearch" hover-class="tap-press">
        <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="count-row">
      <text>{{countText}}</text>
    </view>

    <view v-if="events.length" class="event-list">
      <view
        :class="'moment-card ' + (status === 'completed' ? 'moment-card-completed' : '')"
       
       
        :data-id="item.id"
        @tap="handleOpenEvent"
        hover-class="tap-press"
       v-for="(item, index) in events" :key="item.id">
        <image class="moment-image" :src="item.image || '/static/assets/create/preview-bg.jpg'" mode="aspectFill"></image>
        <view class="moment-overlay"></view>
        <view class="moment-content">
          <view class="moment-top">
            <view :class="status === 'completed' ? 'status-badge completed-badge' : 'status-badge'">
              <image v-if="status === 'completed'" src="/static/assets/icons/check-circle-white.svg" mode="aspectFit"></image>
              <text>{{status === 'completed' ? '已完成' : item.statusLabel}}</text>
            </view>
            <view class="icon-chip" v-if="status !== 'completed'">
              <image :src="item.bookIcon || '/static/assets/icons/book.svg'" mode="aspectFit"></image>
            </view>
            <image v-else class="pin-icon" src="/static/assets/icons/push-pin-white.svg" mode="aspectFit"></image>
          </view>

          <view class="moment-bottom">
            <view class="moment-copy">
              <text class="moment-title">{{item.title}}</text>
              <view class="completed-date" v-if="status === 'completed'">
                <image src="/static/assets/icons/calendar-white.svg" mode="aspectFit"></image>
                <text>{{item.completedDateText}}</text>
              </view>
              <block v-else>
                <text class="moment-date">{{item.targetDateCompact}}</text>
                <view class="mini-progress" v-if="item.progressText">
                  <view class="mini-progress-fill" :style="'width: ' + (item.progress) + '%;'"></view>
                </view>
                <text class="moment-date" v-if="item.progressText">{{item.progressText}}</text>
              </block>
            </view>

            <view class="days-panel" v-if="status !== 'completed'">
              <text>{{item.daysLeft}}</text>
              <text>天 剩余</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <view class="empty-icon">
        <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
      </view>
      <text class="empty-title">{{emptyTitle}}</text>
      <text class="empty-copy">{{query ? '没有找到匹配的时刻，换个关键词试试。' : emptyCopy}}</text>
    </view>

    <view class="bottom-hint" v-if="events.length">
      <text>{{bottomHint}}</text>
    </view>

    <view class="bottom-spacer"></view>
  </scroll-view>
</view>
</template>

<script>
const { getBookSummary } = require("../../utils/book-events")
const { getEvents, refreshEventsFromCloud } = require("../../utils/event-store")
const { getWindowMetrics } = require("../../utils/system-info")

const DAY_MS = 86400000

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase()
}

function getTodayTime() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function pad(value) {
  return String(value).padStart(2, "0")
}

function getTargetTime(target) {
  if (!target) {
    return getTodayTime()
  }

  return new Date(target.year, target.month - 1, target.day).getTime()
}

function formatCompactDate(target) {
  if (!target) {
    return "未设置日期"
  }

  return `${target.year}.${pad(target.month)}.${pad(target.day)}`
}

function getDaysLeft(target) {
  return Math.max(0, Math.ceil((getTargetTime(target) - getTodayTime()) / DAY_MS))
}

function getInitialDays(event) {
  if (Number.isFinite(Number(event.initialDays))) {
    return Math.max(0, Number(event.initialDays))
  }

  const createdAt = new Date(event.createdAt || Date.now())
  const startTime = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime()
  return Math.max(0, Math.ceil((getTargetTime(event.target) - startTime) / DAY_MS))
}

function getProgress(event, daysLeft) {
  if (event.completed) {
    return 100
  }

  const initialDays = getInitialDays(event)

  if (initialDays <= 0) {
    return daysLeft <= 0 ? 100 : 0
  }

  return Math.min(100, Math.max(0, Math.round(((initialDays - daysLeft) / initialDays) * 100)))
}

function getAiTip(event) {
  const text = String(event.aiReminder || event.note || "").replace(/^AI提醒[:：]\s*/, "").trim()

  if (text) {
    return text
  }

  return "适合继续推进一个小步骤，把期待稳稳接住。"
}

function normalizeGlobalEvent(event) {
  const daysLeft = getDaysLeft(event.target)
  const completed = !!event.completed || daysLeft <= 0
  const progress = getProgress({ ...event, completed }, daysLeft)
  const book = event.countdownBook || {}

  return {
    ...event,
    aiTip: getAiTip(event),
    bookIcon: book.iconSrc || "/static/assets/icons/book.svg",
    bookTitle: book.title || "倒数本",
    completed,
    completedDateText: `${formatCompactDate(event.target)} 完成`,
    daysLeft,
    image: (event.background && event.background.image) || "/static/assets/create/preview-bg.jpg",
    progress,
    progressText: progress > 0 && !completed ? `第 ${progress} / 100 天` : "",
    statusLabel: event.statusLabel || (progress >= 50 ? "挑战中" : "进行中"),
    targetDateCompact: formatCompactDate(event.target)
  }
}

function eventMatches(event, query) {
  if (!query) {
    return true
  }

  return [
    event.title,
    event.bookTitle,
    event.aiTip,
    event.note,
    event.statusLabel,
    event.targetDateCompact,
    event.completedDateText
  ].some((value) => String(value || "").toLowerCase().includes(query))
}

export default {
  data() {
    return {
    allEvents: [],
    book: null,
    bookId: "",
    bottomHint: "每个时刻都值得被珍藏",
    contentTop: 88,
    countText: "",
    emptyCopy: "",
    emptyTitle: "",
    events: [],
    navActionStyle: "",
    navShellStyle: "",
    query: "",
    searchPlaceholder: "",
    status: "ongoing",
    title: "正在进行"
  }
  },
  onLoad(options) {
    this.bookId = decodeURIComponent(options.bookId || "")
    this.scope = options.scope === "all" ? "all" : "book"
    this.status = options.status === "completed" ? "completed" : "ongoing"
    this.setupNavigation()
  },
  async onShow() {
    await refreshEventsFromCloud()
    this.loadEvents()
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
      contentTop: navHeight + 31
    })
  },
    loadEvents() {
    const isCompletedList = this.status === "completed"
    const title = isCompletedList ? "已完成" : "正在进行"
    let allEvents = []
    let book = null

    if (this.scope === "all") {
      const events = getEvents().map(normalizeGlobalEvent)
      allEvents = events.filter((event) => event.completed === isCompletedList)
    } else {
      const summary = getBookSummary(this.bookId)
      allEvents = isCompletedList ? summary.completed : summary.ongoing
      book = summary.book
    }

    this.setData({
      allEvents,
      book,
      bottomHint: "每个时刻都值得被珍藏",
      emptyCopy: isCompletedList
        ? "尚未发现已完成的时刻，继续向前，创造更多美好吧。"
        : "每个时刻都值得被珍藏，新的倒数会在这里继续发光。",
      emptyTitle: isCompletedList ? "记录属于你的圆满" : "暂无进行中的时刻",
      searchPlaceholder: isCompletedList ? "搜索已完成的重要时刻" : "搜索正在进行的时刻...",
      status: this.status,
      title
    })

    this.applySearch(this.query, allEvents)
  },
    applySearch(queryValue, sourceEvents = this.allEvents) {
    const query = normalizeQuery(queryValue)
    const events = sourceEvents.filter((event) => eventMatches(event, query))

    this.setData({
      countText: query ? `找到 ${events.length} 个时刻` : `共 ${sourceEvents.length} 个时刻`,
      events,
      query
    })
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

    uni.redirectTo({ url: this.scope === "all" ? "/pages/mine/mine" : "/pages/book/book" })
  },
    handleOpenEvent(event) {
    const id = event.currentTarget.dataset.id

    if (!id) {
      return
    }

    uni.navigateTo({
      url: `/pages/event-detail/event-detail?id=${encodeURIComponent(id)}`
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

.tap-press {
  opacity: 0.8;
  transform: scale(0.98);
}

.nav-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 38rpx;
  background: rgba(252, 248, 251, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title,
.nav-spacer {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-back,
.nav-spacer {
  width: 85rpx;
  justify-content: flex-start;
}

.nav-back image {
  width: 46rpx;
  height: 46rpx;
}

.nav-title {
  flex: 1;
  justify-content: center;
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 38rpx;
  padding-right: 38rpx;
  padding-bottom: calc(72rpx + env(safe-area-inset-bottom));
}

.search-wrap {
  height: 92rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 46rpx;
  padding: 0 31rpx;
  border-radius: 31rpx;
  background: #f6f3f5;
  box-shadow: 0 8rpx 22rpx rgba(27, 27, 29, 0.025);
}

.search-wrap > image {
  width: 38rpx;
  height: 38rpx;
  flex: 0 0 auto;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 92rpx;
  margin-left: 20rpx;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.search-placeholder {
  color: rgba(137, 115, 98, 0.72);
}

.clear-button {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.clear-button image {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.52;
}

.count-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: -18rpx 0 28rpx;
  color: rgba(86, 67, 52, 0.56);
  font-size: 22rpx;
  line-height: 32rpx;
}

.count-row text {
  color: #904d00;
  font-weight: 700;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 31rpx;
}

.moment-card {
  position: relative;
  height: 422rpx;
  overflow: hidden;
  border-radius: 46rpx;
  background: #e4e2e4;
  box-shadow: 0 19rpx 58rpx rgba(27, 27, 29, 0.05);
}

.moment-card-completed {
  height: 430rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.18);
  box-shadow: 0 10rpx 28rpx rgba(27, 27, 29, 0.04);
}

.moment-image,
.moment-overlay,
.moment-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.moment-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.1) 38%, rgba(0, 0, 0, 0.62) 100%);
}

.moment-card-completed .moment-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.moment-content {
  box-sizing: border-box;
  padding: 46rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.moment-top,
.moment-bottom,
.status-badge,
.icon-chip,
.completed-date {
  display: flex;
  align-items: center;
}

.moment-top,
.moment-bottom {
  justify-content: space-between;
}

.status-badge {
  min-height: 50rpx;
  box-sizing: border-box;
  padding: 8rpx 23rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 21rpx;
  line-height: 28rpx;
  font-weight: 800;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.completed-badge {
  gap: 8rpx;
  border: 0;
  background: #ff8c00;
  color: #623200;
  box-shadow: 0 10rpx 28rpx rgba(27, 27, 29, 0.18);
}

.completed-badge image {
  width: 28rpx;
  height: 28rpx;
}

.icon-chip {
  width: 61rpx;
  height: 61rpx;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.icon-chip image {
  width: 35rpx;
  height: 35rpx;
  filter: brightness(0) invert(1);
  opacity: 0.92;
}

.pin-icon {
  width: 42rpx;
  height: 42rpx;
  opacity: 0.82;
}

.moment-copy {
  flex: 1;
  min-width: 0;
  color: #ffffff;
}

.moment-title {
  display: block;
  max-width: 410rpx;
  color: #ffffff;
  font-size: 46rpx;
  line-height: 61rpx;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.moment-date {
  display: block;
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 600;
}

.completed-date {
  gap: 8rpx;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 600;
}

.completed-date image {
  width: 27rpx;
  height: 27rpx;
  opacity: 0.92;
}

.days-panel {
  width: 154rpx;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.days-panel text:first-child {
  color: #ff8c00;
  font-size: 92rpx;
  line-height: 98rpx;
  font-weight: 900;
}

.days-panel text:last-child {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.92);
  font-size: 21rpx;
  line-height: 28rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.mini-progress {
  width: 246rpx;
  height: 8rpx;
  overflow: hidden;
  margin-top: 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
}

.mini-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #ff8c00;
}

.empty-state {
  min-height: 650rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: 0.92;
}

.empty-icon {
  width: 184rpx;
  height: 184rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border-radius: 50%;
  background: #f0edef;
}

.empty-icon image {
  width: 74rpx;
  height: 74rpx;
  opacity: 0.3;
}

.empty-title {
  color: rgba(86, 67, 52, 0.72);
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.empty-copy {
  max-width: 420rpx;
  margin-top: 12rpx;
  color: rgba(86, 67, 52, 0.5);
  font-size: 29rpx;
  line-height: 42rpx;
}

.bottom-hint {
  min-height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(86, 67, 52, 0.28);
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 600;
}

.bottom-spacer {
  height: 96rpx;
}
</style>
