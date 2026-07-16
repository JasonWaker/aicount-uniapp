<template>
<view class="page" v-if="book">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back glass" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">
      <text>{{book.title}}</text>
    </view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false">
    <view class="hero">
      <image class="hero-image" :src="heroImage" mode="aspectFill"></image>
      <view class="hero-gradient"></view>

      <view class="hero-stats glass">
        <view class="stat-row">
          <view class="stat-item">
            <text class="stat-value">{{summary.events.length}}</text>
            <text class="stat-label">总计</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item" data-status="ongoing" @tap="handleOpenStatus" hover-class="tap-press">
            <text class="stat-value stat-primary">{{summary.ongoing.length}}</text>
            <text class="stat-label">进行中</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item" data-status="completed" @tap="handleOpenStatus" hover-class="tap-press">
            <text class="stat-value">{{summary.completed.length}}</text>
            <text class="stat-label">已完成</text>
          </view>
        </view>
        <view class="ai-updated">
          <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
          <text>{{isVip ? 'AI 洞察已根据最新进展更新' : '开通 Pro 后启用专属 AI 洞察'}}</text>
        </view>
      </view>
    </view>

    <view class="main">
      <view class="insight-card glass">
        <view class="insight-head">
          <view class="section-title-row">
            <image src="/static/assets/icons/insights-primary.svg" mode="aspectFit"></image>
            <text>AI 分类洞察</text>
          </view>
          <text class="pro-badge">PRO</text>
        </view>

        <view :class="'insight-content ' + (!isVip ? 'insight-content-locked' : '')">
          <text class="insight-text">{{isLoadingInsight ? 'AI 正在分析这个倒数本的节奏...' : insightText}}</text>
          <view class="metric-grid">
            <view class="metric-item">
              <text>{{summary.completionRate}}%</text>
              <text>完成率</text>
            </view>
            <view class="metric-item">
              <text>{{summary.averageDays}}天</text>
              <text>平均周期</text>
            </view>
            <view class="metric-item">
              <text>+{{activeTrend}}%</text>
              <text>活跃趋势</text>
            </view>
          </view>

          <view class="analysis-entry" @tap="handleToggleInsightDetail" hover-class="tap-press">
            <text>{{showInsightDetail ? '收起详细分析报告' : '查看详细分析报告'}}</text>
            <image :class="showInsightDetail ? 'entry-icon entry-icon-open' : 'entry-icon'" src="/static/assets/icons/expand-more-primary.svg" mode="aspectFit"></image>
          </view>

          <view class="insight-detail" v-if="showInsightDetail">
            <text class="detail-title">当前重点分布</text>
            <view class="distribution-bar">
              <view class="distribution-main" :style="'width: ' + (distribution.main) + '%;'"></view>
              <view class="distribution-second" :style="'width: ' + (distribution.secondary) + '%;'"></view>
              <view class="distribution-rest" :style="'width: ' + (distribution.rest) + '%;'"></view>
            </view>
            <view class="detail-tip">
              <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
              <text>建议优先关注临近节点，并把长期目标拆成可执行的小阶段。</text>
            </view>
          </view>
          <text class="insight-source">来源：{{insightProvider === 'remote' ? 'AI 接口分析' : '本地兜底分析'}}</text>
        </view>

        <view v-if="!isVip" class="vip-mask" @tap="handleOpenVip">
          <view class="vip-lock">
            <image src="/static/assets/icons/workspace-premium.svg" mode="aspectFit"></image>
          </view>
          <text class="vip-title">解锁 AI 分类洞察</text>
          <text class="vip-desc">开通 Pro 后查看完整分析、节奏建议与分类趋势。</text>
          <view class="vip-button">开通 Pro</view>
        </view>
      </view>

      <view class="event-section">
        <view class="list-head">
          <text>分类下事件</text>
          <view class="sort-pill" data-status="ongoing" @tap="handleOpenStatus" hover-class="tap-press">
            <image src="/static/assets/icons/sort-primary.svg" mode="aspectFit"></image>
            <text>剩余天数</text>
          </view>
        </view>

        <view class="event-list" v-if="summary.events.length">
          <view class="event-card" :data-id="item.id" @tap="handleOpenEvent" hover-class="tap-press" v-for="(item, index) in previewEvents" :key="item.id">
            <image class="event-cover" v-if="item.image" :src="item.image" mode="aspectFill"></image>
            <view class="event-placeholder" v-else>
              <image src="/static/assets/icons/menu-book.svg" mode="aspectFit"></image>
            </view>
            <view class="event-main">
              <view class="event-title-row">
                <text class="event-title">{{item.title}}</text>
                <view class="days-wrap">
                  <text>{{item.completed ? '完成' : item.daysLeft}}</text>
                  <text v-if="!item.completed">Days</text>
                </view>
              </view>
              <view class="event-ai">
                <image src="/static/assets/icons/magic-button.svg" mode="aspectFit"></image>
                <text>{{item.aiTip}}</text>
              </view>
              <view class="event-progress-line">
                <text>完成进度</text>
                <text>{{item.progress}}%</text>
              </view>
              <view class="progress-track">
                <view class="progress-fill" :style="'width: ' + (item.progress) + '%;'"></view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-card" v-else>
          <image src="/static/assets/icons/import-contacts-active.svg" mode="aspectFit"></image>
          <text>还没有倒数日</text>
          <text>新建一个属于{{book.title}}的时刻吧</text>
        </view>
      </view>

      <view class="timeline-section" v-if="timeline.length">
        <view class="list-head">
          <text>人生时间轴</text>
        </view>
        <view class="timeline-card">
          <view class="timeline-item" v-for="(item, index) in timeline" :key="item.id">
            <view class="timeline-rail">
              <view class="timeline-dot"></view>
              <view class="timeline-line" v-if="index < timeline.length - 1"></view>
            </view>
            <view class="timeline-copy">
              <text>{{item.date}}</text>
              <text>{{item.title}}</text>
            </view>
            <text class="timeline-value">{{item.value}}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>

  <view class="floating-actions">
    <view class="fab-edit" @tap="handleEditBook" hover-class="tap-press">
      <image src="/static/assets/icons/event-edit-fab.svg" mode="aspectFit"></image>
    </view>
    <view class="fab" @tap="handleCreateEvent" hover-class="tap-press">
      <image src="/static/assets/icons/add-white.svg" mode="aspectFit"></image>
    </view>
  </view>
</view>
</template>

<script>
const { getBookInsight, getBookSummary } = require("../../utils/book-events")
const { getWindowMetrics } = require("../../utils/system-info")

const DEFAULT_HERO_IMAGE = "/static/assets/create/preview-bg.jpg"

function getHeroImage(summary, isVip) {
  if (isVip && summary.book && summary.book.coverImage) {
    return summary.book.coverImage
  }

  return DEFAULT_HERO_IMAGE
}

function formatTargetDate(event) {
  if (event.targetDateText) {
    return event.targetDateText
  }

  if (!event.target) {
    return "未设置日期"
  }

  return `${event.target.year}年${event.target.month}月${event.target.day}日`
}

function getTimeline(events) {
  return events.slice(0, 4).map((event) => ({
    id: event.id,
    title: event.title,
    date: formatTargetDate(event),
    value: event.completed ? "已结束" : `剩余 ${event.daysLeft} 天`
  }))
}

function getActiveTrend(summary) {
  if (!summary.events.length) {
    return 0
  }

  return Math.min(99, Math.max(0, Math.round((summary.ongoing.length / summary.events.length) * 100) - 45))
}

function getDistribution(summary) {
  const main = summary.completionRate || Math.min(72, Math.max(28, summary.ongoing.length * 12))
  const secondary = Math.min(100 - main, Math.max(12, summary.urgentCount * 8))

  return {
    main,
    secondary,
    rest: Math.max(0, 100 - main - secondary)
  }
}

function buildInsightContext(summary) {
  return {
    book: {
      id: summary.book.id,
      title: summary.book.title,
      desc: summary.book.desc,
      tone: summary.book.tone
    },
    metrics: {
      total: summary.events.length,
      ongoing: summary.ongoing.length,
      completed: summary.completed.length,
      waitingDays: summary.waitingDays,
      averageDays: summary.averageDays,
      completionRate: summary.completionRate,
      urgentCount: summary.urgentCount
    },
    events: summary.events.slice(0, 8).map((event) => ({
      title: event.title,
      category: event.countdownBook && event.countdownBook.title,
      completed: event.completed,
      daysLeft: event.daysLeft
    }))
  }
}

async function requestBookInsight(summary) {
  try {
    const aiService = getApp().getAiService && getApp().getAiService()

    if (!aiService || typeof aiService.requestAi !== "function") {
      throw new Error("AI service is unavailable")
    }

    const response = await aiService.requestAi({
      feature: "book-category-insight",
      context: buildInsightContext(summary)
    })
    const text = response && (response.insight || response.text || response.content || response.message)
    const suggestions = response && Array.isArray(response.suggestions) ? response.suggestions.filter(Boolean) : []
    const highlights = response && Array.isArray(response.highlights) ? response.highlights.filter(Boolean) : []

    if (typeof text === "string" && text.trim()) {
      const extra = suggestions.length ? suggestions.slice(0, 2) : highlights.slice(0, 2)
      return {
        provider: response.provider || "remote",
        text: extra.length ? `${text.trim()}\n${extra.join("；")}` : text.trim()
      }
    }
  } catch (error) {
    // Keep the visual center available when the remote AI interface is unavailable.
  }

  return {
    provider: "local",
    text: getBookInsight(summary)
  }
}

export default {
  data() {
    return {
    activeTrend: 0,
    book: null,
    bookId: "",
    contentTop: 88,
    distribution: { main: 0, secondary: 0, rest: 100 },
    hasVipTemplate: false,
    heroImage: DEFAULT_HERO_IMAGE,
    insightProvider: "local",
    insightText: "",
    isLoadingInsight: false,
    isVip: false,
    navActionStyle: "",
    navShellStyle: "",
    previewEvents: [],
    showInsightDetail: false,
    summary: null,
    timeline: []
  }
  },
  onLoad(options) {
    this.bookId = decodeURIComponent(options.id || "")
    this.setupNavigation()
  },
  async onShow() {
    const { refreshEventsFromCloud } = require("../../utils/event-store")
    const { refreshCountdownBooksFromCloud } = require("../../utils/countdown-books")
    await refreshCountdownBooksFromCloud()
    await refreshEventsFromCloud()
    this.loadBook()
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
      navActionStyle: `top:${menuTop}px;height:${menuHeight}px;`,
      contentTop: navHeight
    })
  },
    loadBook() {
    const summary = getBookSummary(this.bookId)
    const isVip = getApp().getVipState()

    if (!summary.book) {
      uni.showToast({ title: "倒数本不存在", icon: "none" })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }

    this.setData({
      activeTrend: getActiveTrend(summary),
      book: summary.book,
      distribution: getDistribution(summary),
      hasVipTemplate: !!summary.book.coverImage,
      heroImage: getHeroImage(summary, isVip),
      insightProvider: "local",
      insightText: getBookInsight(summary),
      isLoadingInsight: isVip,
      isVip,
      previewEvents: summary.events.slice(0, 3),
      summary,
      timeline: getTimeline(summary.events)
    })

    if (isVip) {
      this.loadInsight(summary)
    }
  },
    async loadInsight(summary) {
    const insight = await requestBookInsight(summary)

    this.setData({
      insightProvider: insight.provider,
      insightText: insight.text,
      isLoadingInsight: false
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/book/book" })
  },
    handleToggleInsightDetail() {
    if (!this.isVip) {
      this.handleOpenVip()
      return
    }

    this.setData({ showInsightDetail: !this.showInsightDetail })
  },
    handleOpenStatus(event) {
    const status = event.currentTarget.dataset.status

    uni.navigateTo({
      url: `/pages/book-status-list/book-status-list?bookId=${encodeURIComponent(this.bookId)}&status=${status}`
    })
  },
    handleOpenEvent(event) {
    const id = event.currentTarget.dataset.id

    if (!id) {
      return
    }

    uni.navigateTo({
      url: `/pages/event-detail/event-detail?id=${encodeURIComponent(id)}`
    })
  },
    handleOpenVip() {
    uni.showToast({ title: "请先开通 Pro", icon: "none" })
  },
    handleEditBook() {
    uni.navigateTo({
      url: `/pages/book-category-create/book-category-create?mode=edit&id=${encodeURIComponent(this.bookId)}`
    })
  },
    handleCreateEvent() {
    if (this.book) {
      uni.setStorageSync("selectedCountdownBook", this.book)
    }

    uni.navigateTo({ url: "/pages/create/create" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: #fbf9f9;
  color: #1b1c1c;
}

.tap-press {
  opacity: 0.78;
  transform: scale(0.985);
}

.glass {
  background: rgba(255, 255, 255, 0.62);
  border: 1rpx solid rgba(255, 255, 255, 0.42);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  box-shadow: 0 16rpx 48rpx rgba(27, 28, 28, 0.12);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 80;
  pointer-events: none;
}

.nav-back,
.nav-title {
  position: absolute;
  display: flex;
  align-items: center;
  pointer-events: auto;
}

.nav-back {
  left: 46rpx;
  width: 77rpx;
  justify-content: center;
  border-radius: 50%;
}

.nav-back image {
  width: 38rpx;
  height: 38rpx;
}

.nav-title {
  left: 50%;
  width: 340rpx;
  justify-content: center;
  margin-left: -170rpx;
  color: #ffffff;
  font-size: 35rpx;
  line-height: 44rpx;
  font-weight: 800;
  text-shadow: 0 5rpx 16rpx rgba(0, 0, 0, 0.22);
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}

.hero {
  position: relative;
  height: 807rpx;
  overflow: hidden;
}

.hero-image,
.hero-gradient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-image {
  background: #ded8d2;
}

.hero-gradient {
  background:
    linear-gradient(180deg, rgba(27, 28, 28, 0.22) 0%, rgba(251, 249, 249, 0) 40%, #fbf9f9 95%),
    radial-gradient(circle at 50% 28%, rgba(255, 255, 255, 0.18), transparent 42%);
}

.hero-stats {
  position: absolute;
  left: 46rpx;
  right: 46rpx;
  bottom: 46rpx;
  z-index: 2;
  box-sizing: border-box;
  padding: 46rpx;
  border-radius: 31rpx;
}

.stat-row {
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  color: #1b1c1c;
  font-size: 58rpx;
  line-height: 68rpx;
  font-weight: 900;
}

.stat-primary {
  color: #ff8c00;
}

.stat-label {
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.6);
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 700;
}

.stat-divider {
  width: 1rpx;
  height: 58rpx;
  background: rgba(86, 67, 52, 0.13);
}

.ai-updated {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: #904d00;
  font-size: 23rpx;
  line-height: 34rpx;
  font-weight: 700;
}

.ai-updated image {
  width: 31rpx;
  height: 31rpx;
}

.main {
  box-sizing: border-box;
  padding: 0 46rpx calc(190rpx + env(safe-area-inset-bottom));
}

.insight-card {
  position: relative;
  box-sizing: border-box;
  padding: 46rpx;
  border-radius: 31rpx;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 245, 235, 0.72));
  border-color: rgba(221, 193, 174, 0.18);
  box-shadow: 0 18rpx 54rpx rgba(27, 28, 28, 0.08);
}

.insight-head,
.section-title-row,
.list-head,
.sort-pill,
.analysis-entry,
.detail-tip,
.event-title-row,
.event-ai,
.event-progress-line {
  display: flex;
  align-items: center;
}

.insight-head,
.list-head,
.event-title-row,
.event-progress-line {
  justify-content: space-between;
}

.section-title-row {
  gap: 15rpx;
  color: #1b1c1c;
  font-size: 35rpx;
  line-height: 46rpx;
  font-weight: 900;
}

.section-title-row image {
  width: 42rpx;
  height: 42rpx;
}

.pro-badge {
  padding: 3rpx 12rpx;
  border-radius: 10rpx;
  background: #fbbc04;
  color: #904d00;
  font-size: 17rpx;
  line-height: 24rpx;
  font-weight: 900;
}

.insight-content {
  margin-top: 30rpx;
}

.insight-content-locked {
  opacity: 0.58;
  filter: blur(0.8px);
}

.insight-text {
  color: rgba(27, 28, 28, 0.82);
  font-size: 27rpx;
  line-height: 43rpx;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 32rpx;
}

.metric-item {
  min-height: 113rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 23rpx;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(221, 193, 174, 0.18);
}

.metric-item text:first-child {
  color: #904d00;
  font-size: 32rpx;
  line-height: 42rpx;
  font-weight: 900;
}

.metric-item text:last-child {
  margin-top: 4rpx;
  color: rgba(86, 67, 52, 0.55);
  font-size: 19rpx;
  line-height: 28rpx;
}

.analysis-entry {
  height: 77rpx;
  justify-content: center;
  gap: 8rpx;
  margin-top: 32rpx;
  border-radius: 999rpx;
  background: rgba(255, 140, 0, 0.1);
  color: #904d00;
  font-size: 25rpx;
  font-weight: 800;
}

.entry-icon {
  width: 31rpx;
  height: 31rpx;
  transition: transform 160ms ease;
}

.entry-icon-open {
  transform: rotate(180deg);
}

.insight-detail {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid rgba(221, 193, 174, 0.32);
}

.detail-title {
  color: #1b1c1c;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 800;
}

.distribution-bar {
  height: 16rpx;
  display: flex;
  overflow: hidden;
  margin-top: 18rpx;
  border-radius: 999rpx;
  background: #efe7df;
}

.distribution-main {
  height: 100%;
  background: #ff8c00;
}

.distribution-second {
  height: 100%;
  background: #904d00;
}

.distribution-rest {
  height: 100%;
  background: #ddc1ae;
}

.detail-tip {
  gap: 12rpx;
  margin-top: 24rpx;
  color: rgba(86, 67, 52, 0.72);
  font-size: 22rpx;
  line-height: 34rpx;
}

.detail-tip image {
  width: 31rpx;
  height: 31rpx;
  flex: 0 0 auto;
}

.insight-source {
  display: block;
  margin-top: 22rpx;
  color: rgba(86, 67, 52, 0.42);
  font-size: 19rpx;
  line-height: 28rpx;
}

.vip-mask {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 46rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.vip-lock {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 26rpx;
  background: rgba(255, 140, 0, 0.13);
}

.vip-lock image {
  width: 43rpx;
  height: 43rpx;
}

.vip-title {
  margin-top: 18rpx;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 900;
}

.vip-desc {
  max-width: 500rpx;
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.66);
  font-size: 23rpx;
  line-height: 35rpx;
}

.vip-button {
  margin-top: 24rpx;
  padding: 15rpx 42rpx;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 25rpx;
  line-height: 34rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 30rpx rgba(255, 140, 0, 0.22);
}

.event-section,
.timeline-section {
  margin-top: 77rpx;
}

.list-head {
  margin-bottom: 31rpx;
}

.list-head > text {
  color: #1b1c1c;
  font-size: 35rpx;
  line-height: 46rpx;
  font-weight: 900;
}

.sort-pill {
  gap: 8rpx;
  color: #904d00;
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 700;
}

.sort-pill image {
  width: 31rpx;
  height: 31rpx;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 31rpx;
}

.event-card {
  height: 276rpx;
  display: flex;
  overflow: hidden;
  border-radius: 31rpx;
  background: #ffffff;
  border: 1rpx solid rgba(221, 193, 174, 0.18);
  box-shadow: 0 13rpx 38rpx rgba(27, 28, 28, 0.055);
}

.event-cover,
.event-placeholder {
  width: 215rpx;
  height: 276rpx;
  flex: 0 0 auto;
  background: #e4e2e4;
}

.event-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-placeholder image {
  width: 58rpx;
  height: 58rpx;
}

.event-main {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: 31rpx 31rpx 28rpx;
}

.event-title {
  flex: 1;
  min-width: 0;
  color: #1b1c1c;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.days-wrap {
  width: 106rpx;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.days-wrap text:first-child {
  color: #904d00;
  font-size: 36rpx;
  line-height: 42rpx;
  font-weight: 900;
}

.days-wrap text:last-child {
  color: rgba(86, 67, 52, 0.58);
  font-size: 17rpx;
  line-height: 22rpx;
  font-weight: 800;
  text-transform: uppercase;
}

.event-ai {
  gap: 8rpx;
  max-width: 100%;
  height: 42rpx;
  margin-top: 20rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 140, 0, 0.1);
  color: #904d00;
  font-size: 19rpx;
  line-height: 28rpx;
}

.event-ai image {
  width: 24rpx;
  height: 24rpx;
  flex: 0 0 auto;
}

.event-ai text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-progress-line {
  margin-top: 24rpx;
  color: rgba(86, 67, 52, 0.58);
  font-size: 19rpx;
  line-height: 28rpx;
}

.progress-track {
  height: 10rpx;
  margin-top: 10rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e7e1dc;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #ff8c00;
}

.empty-card {
  min-height: 230rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 31rpx;
  background: #ffffff;
  color: rgba(86, 67, 52, 0.56);
  font-size: 23rpx;
}

.empty-card image {
  width: 54rpx;
  height: 54rpx;
}

.timeline-card {
  padding-left: 6rpx;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  min-height: 112rpx;
}

.timeline-rail {
  position: relative;
  width: 36rpx;
  align-self: stretch;
  flex: 0 0 auto;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 9rpx;
  width: 19rpx;
  height: 19rpx;
  border: 5rpx solid #ff8c00;
  border-radius: 50%;
  background: #fbf9f9;
  box-sizing: border-box;
}

.timeline-line {
  position: absolute;
  left: 8rpx;
  top: 28rpx;
  bottom: -4rpx;
  width: 2rpx;
  background: rgba(221, 193, 174, 0.62);
}

.timeline-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.timeline-copy text:first-child {
  color: rgba(86, 67, 52, 0.55);
  font-size: 21rpx;
  line-height: 30rpx;
}

.timeline-copy text:last-child {
  margin-top: 8rpx;
  color: #1b1c1c;
  font-size: 27rpx;
  line-height: 38rpx;
  font-weight: 800;
}

.timeline-value {
  max-width: 154rpx;
  margin-left: 20rpx;
  color: #904d00;
  font-size: 22rpx;
  line-height: 32rpx;
  font-weight: 800;
}

.floating-actions {
  position: fixed;
  right: 46rpx;
  bottom: calc(61rpx + env(safe-area-inset-bottom));
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22rpx;
}

.fab,
.fab-edit {
  width: 123rpx;
  height: 123rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.fab {
  background: #ff8c00;
  box-shadow: 0 18rpx 48rpx rgba(255, 140, 0, 0.28);
}

.fab image {
  width: 50rpx;
  height: 50rpx;
}

.fab-edit {
  width: 123rpx;
  height: 123rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(221, 193, 174, 0.38);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  box-shadow: 0 14rpx 34rpx rgba(27, 28, 28, 0.08);
}

.fab-edit image {
  width: 46rpx;
  height: 46rpx;
}
</style>
