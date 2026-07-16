<template>
<view class="page" v-if="event" :style="'background: ' + (themeSurface) + ';'">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-left">
      <view class="nav-button" @tap="handleBack" hover-class="tap-press">
        <image class="nav-back-icon" src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
      </view>
      <text class="nav-title">倒数详情</text>
    </view>
    <view v-if="!isSystemHoliday" class="nav-actions" :style="navActionStyle">
      <view class="nav-button" @tap="handleMore" hover-class="tap-press">
        <image class="nav-action-icon" src="/static/assets/icons/more-horiz.svg" mode="aspectFit"></image>
      </view>
    </view>
  </view>

  <view class="page-content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view :class="'hero ' + (event.background.tone ? 'hero-tone-' + event.background.tone : '')">
      <image v-if="event.background.image" class="hero-image" :src="event.background.image" mode="aspectFill"></image>
      <view class="hero-overlay" :style="'background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.02) 42%, ' + (themeSurface) + ' 100%);'"></view>
      <view class="hero-content">
        <text class="hero-kicker">距离{{event.title}}还有</text>
        <text class="hero-number">{{daysLeft}}</text>
        <text class="hero-unit">天，静候美好</text>
        <view class="hero-progress">
          <view class="hero-progress-fill" :style="'width: ' + (heroProgress) + '%; background: ' + (themeColor) + ';'"></view>
        </view>
        <view class="hero-dates">
          <text>{{startDateText}}</text>
          <text>{{heroProgress}}%</text>
          <text>{{endDateText}}</text>
        </view>
      </view>
    </view>

    <view class="detail-content">
      <view class="ai-card">
        <view class="ai-badge">
          <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
          <text>AI</text>
        </view>
        <view class="ai-heading">
          <image src="/static/assets/icons/star-filled.svg" mode="aspectFit"></image>
          <text>今日AI寄语</text>
        </view>
        <text class="ai-quote">“{{aiQuote}}”</text>
        <text class="ai-sign">— AI 智者</text>
      </view>

      <view class="task-section">
        <view class="section-head">
          <text class="section-title">AI 智能分解任务</text>
          <text class="task-progress task-progress-loading" v-if="isLoadingTasks">AI 规划中...</text>
          <text class="task-progress" v-else>已完成 {{completedTaskCount}}/{{tasks.length}}</text>
        </view>
        <view class="task-panel">
          <view class="task-loading" v-if="isLoadingTasks && !tasks.length">
            <view class="task-loading-preview">
              <view class="task-preview-row" v-for="item in loadingTaskRows" :key="item">
                <view class="task-preview-check"></view>
                <view class="task-preview-copy">
                  <view class="task-preview-title"></view>
                  <view class="task-preview-line"></view>
                  <view class="task-preview-line task-preview-line-short"></view>
                </view>
              </view>
            </view>
            <view class="task-generating-mask">
              <view class="task-generating-icon">
                <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
              </view>
              <text class="task-generating-title">AI 正在生成专属计划</text>
              <text class="task-generating-copy">结合事件类型与目标日期智能拆解</text>
              <view class="task-generating-dots">
                <view></view>
                <view></view>
                <view></view>
              </view>
            </view>
          </view>
          <view class="task-load-error" v-else-if="taskLoadFailed && !tasks.length" @tap="handleRetryTasks" hover-class="tap-press">
            <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
            <text class="task-load-error-title">AI 规划暂时未完成</text>
            <text class="task-load-error-copy">点击重新生成任务计划</text>
          </view>
          <view v-else :class="'task-list ' + (!isVip ? 'task-list-locked' : '')">
            <view
              :class="'task-item ' + (item.done ? 'task-item-completed' : '')"
             
             
              :data-id="item.id"
              @tap="handleToggleTask"
              hover-class="task-item-press"
             v-for="(item, index) in tasks" :key="item.id">
              <view :class="'task-check ' + (item.done ? 'task-check-done' : '')">
                <image v-if="item.done" src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
              </view>
              <view class="task-copy">
                <view class="task-title-line">
                  <text :class="'task-title ' + (item.done ? 'task-title-done' : '')">{{item.title}}</text>
                  <text class="task-time">{{item.timing}}</text>
                </view>
                <text class="task-description">{{item.description}}</text>
              </view>
            </view>
          </view>
          <view class="vip-mask" v-if="!isVip" @tap="handleOpenVip">
            <view class="vip-icon-wrap">
              <image src="/static/assets/icons/workspace-premium.svg" mode="aspectFit"></image>
            </view>
            <text class="vip-title">解锁 AI 智能规划</text>
            <text class="vip-description">按事件类型生成专属阶段任务</text>
            <view class="vip-button">开通 Pro</view>
          </view>
        </view>
      </view>

      <view v-if="!isSystemHoliday" class="timeline-section">
        <view class="section-head">
          <text class="section-title">时光记录</text>
          <view class="timeline-add" @tap="handleAddRecord" hover-class="tap-press">
            <image src="/static/assets/icons/add-circle-primary.svg" mode="aspectFit"></image>
          </view>
        </view>

        <view class="timeline-empty" v-if="!timeline.length">
          <image src="/static/assets/icons/history-edu.svg" mode="aspectFit"></image>
          <text class="timeline-empty-title">还没有时光记录</text>
          <text class="timeline-empty-copy">写下这一刻，让等待也成为故事。</text>
        </view>

        <view class="timeline-list" v-else>
          <view class="timeline-item" v-for="(item, index) in timeline" :key="item.id">
            <view class="timeline-rail">
              <view class="timeline-dot"></view>
              <view class="timeline-line" v-if="index < timeline.length - 1"></view>
            </view>
            <view class="timeline-main">
              <view class="timeline-meta">
                <view>
                  <text class="timeline-date">{{item.dateText}}</text>
                  <text class="timeline-time">{{item.timeText}}</text>
                </view>
                <view class="timeline-actions">
                  <view :data-id="item.id" @tap="handleEditRecord">
                    <image src="/static/assets/icons/edit.svg" mode="aspectFit"></image>
                  </view>
                  <view :data-id="item.id" @tap="handleDeleteRecord">
                    <image src="/static/assets/icons/delete.svg" mode="aspectFit"></image>
                  </view>
                </view>
              </view>
              <view class="timeline-card">
                <view class="timeline-photos" v-if="item.photos.length">
                  <image
                   
                   
                   
                    class="timeline-photo"
                    :src="photo"
                    mode="aspectFill"
                    :data-current="photo"
                    :data-entry="item.id"
                    @tap="handlePreviewRecordImage"
                   v-for="(photo, index) in item.photos" :key="index"></image>
                </view>
                <text class="timeline-text" v-if="item.content">{{item.content}}</text>
                <view class="location-chip" v-if="item.location">
                  <image src="/static/assets/icons/location-on.svg" mode="aspectFit"></image>
                  <text>{{item.location.name || item.location.address}}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="!isSystemHoliday" class="floating-edit" @tap="handleEdit" hover-class="tap-press">
    <image src="/static/assets/icons/event-edit-fab.svg" mode="aspectFit"></image>
  </view>

  <view v-if="!isSystemHoliday" class="bottom-bar">
    <view class="bottom-action" @tap="handleSaveImage" hover-class="tap-press">
      <image src="/static/assets/icons/download.svg" mode="aspectFit"></image>
      <text>保存图片</text>
    </view>
    <view class="bottom-divider"></view>
    <button class="bottom-action share-button" open-type="share" hover-class="tap-press">
      <image src="/static/assets/icons/share.svg" mode="aspectFit"></image>
      <text>分享</text>
    </button>
  </view>

  <view class="pro-overlay" v-if="showProModal" @tap="handleClosePro">
    <view class="pro-modal" @tap.stop="handleModalTap">
      <view class="pro-modal-head">
        <view class="pro-head-spacer"></view>
        <text>升级为 Pro 专业版</text>
        <view class="pro-close" @tap="handleClosePro">
          <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
        </view>
      </view>

      <view class="pro-hero">
        <view class="pro-logo">
          <image src="/static/assets/icons/auto-awesome-orange.svg" mode="aspectFit"></image>
        </view>
        <text class="pro-title">解锁 Pro 版全部功能</text>
        <text class="pro-subtitle">升级您的倒计时体验，尊享专属权益</text>
      </view>

      <view class="benefit-grid">
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">AI 无限次数</text>
          <text class="benefit-copy">智能创建与生成</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/cloud-done.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">无限存储</text>
          <text class="benefit-copy">记录每个瞬间</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/palette.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">个性图标</text>
          <text class="benefit-copy">100+ 精致图标</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/magic-button.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">动态特效</text>
          <text class="benefit-copy">专属背景特效</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/block.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">无广告</text>
          <text class="benefit-copy">专注记录不打扰</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon"><image src="/static/assets/icons/devices.svg" mode="aspectFit"></image></view>
          <text class="benefit-title">多端同步</text>
          <text class="benefit-copy">随时随地查看</text>
        </view>
      </view>

      <view class="plan-grid">
        <view
          :class="'plan-option ' + (selectedPlanId === item.id ? 'plan-option-active' : '')"
         
         
          :data-id="item.id"
          @tap="handleSelectPlan"
         v-for="(item, index) in proPlans" :key="item.id">
          <text class="recommended-tag" v-if="item.recommended">最推荐</text>
          <image class="plan-check" v-if="selectedPlanId === item.id" src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
          <image class="plan-icon" :src="item.iconSrc" mode="aspectFit"></image>
          <text class="plan-name">{{item.title}}</text>
          <view class="plan-price">
            <text>{{item.price}}</text>
            <text class="plan-suffix">{{item.suffix}}</text>
          </view>
          <text class="plan-description">{{item.description}}</text>
        </view>
      </view>

      <view class="purchase-button" @tap="handlePurchasePro" hover-class="tap-press">
        <text>{{isPaying ? '正在支付' : '立即开启 Pro'}}</text>
        <image src="/static/assets/icons/arrow-forward-white.svg" mode="aspectFit"></image>
      </view>
      <text class="pro-terms">确认购买即表示您同意《服务条款》与《隐私政策》</text>
    </view>
  </view>
</view>
</template>

<script>
const {
  deleteTimelineEntryAsync,
  getEventById,
  refreshEventDetailFromCloud,
  updateEvent,
  updateTimelineEntryAsync
} = require("../../utils/event-store")
const { getWindowMetrics } = require("../../utils/system-info")
const { getSystemHolidayById } = require("../../utils/system-holidays")

const DAY_MS = 86400000

const themeColors = {
  brown: "#904d00",
  orange: "#ff8c00",
  gray: "#5d5e60",
  peach: "#e88458"
}

const themeSurfaces = {
  brown: "#fcf8fb",
  orange: "#fff8f1",
  gray: "#f7f7f8",
  peach: "#fff7f4"
}

const proPlans = [
  {
    id: "monthly",
    title: "按月订阅",
    iconSrc: "/static/assets/icons/calendar-today.svg",
    price: "¥2.99",
    suffix: "/ 月",
    description: "灵活开启，随时取消",
    amount: 299
  },
  {
    id: "lifetime",
    title: "永久使用",
    iconSrc: "/static/assets/icons/auto-awesome-primary.svg",
    price: "¥19.99",
    suffix: "",
    description: "一次购买，终身享有",
    amount: 1999,
    recommended: true
  }
]

function getDaysLeft(target) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const targetTime = new Date(target.year, target.month - 1, target.day).getTime()
  return Math.max(0, Math.ceil((targetTime - today) / DAY_MS))
}

function formatShortDate(target) {
  return `${target.month}月${target.day}日`
}

function formatFullDate(target) {
  return `${target.year}年${target.month}月${target.day}日`
}

function stripAiPrefix(text) {
  return String(text || "").replace(/^AI提醒[:：]\s*/, "")
}

function normalizeTimeline(timeline) {
  return (Array.isArray(timeline) ? timeline : [])
    .slice()
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map((item) => ({
      ...item,
      photos: Array.isArray(item.photos) ? item.photos : []
    }))
}

export default {
  data() {
    return {
    aiQuote: "",
    completedTaskCount: 0,
    daysLeft: 0,
    endDateText: "",
    event: null,
    eventId: "",
    heroProgress: 0,
    isLoadingTasks: false,
    isPaying: false,
    isVip: false,
    isSystemHoliday: false,
    loadingTaskRows: [1, 2, 3],
    navActionStyle: "",
    navShellStyle: "",
    startDateText: "",
    selectedPlanId: "lifetime",
    showProModal: false,
    proPlans,
    tasks: [],
    taskLoadFailed: false,
    themeColor: "#904d00",
    themeSurface: "#fcf8fb",
    timeline: []
  }
  },
  onLoad(options) {
    this.eventId = decodeURIComponent(options.id || "")
    this.isSystemHoliday = options.system === "1"
    this.setupNavigation()
  },
  async onShow() {
    if (this.isSystemHoliday) {
      await this.loadEvent()
      return
    }

    const localEvent = getEventById(this.eventId)
    const hasLocalTaskCache = !!(
      localEvent
      && Array.isArray(localEvent.aiTasks)
      && localEvent.aiTasks.length
    )
    const localLoad = localEvent
      ? this.loadEvent({ deferTaskGeneration: !hasLocalTaskCache })
      : Promise.resolve()
    await refreshEventDetailFromCloud(this.eventId)
    if (!this.isLoadingTasks) {
      await this.loadEvent()
    }
    await localLoad
  },
  onShareAppMessage() {
    const event = this.event || {}
    return {
      title: `${event.title || "重要时刻"}，还有 ${this.daysLeft} 天`,
      path: `/pages/event-detail/event-detail?id=${encodeURIComponent(this.eventId)}`,
      imageUrl: event.background && event.background.image
    }
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
    const menuRight = system.windowWidth && menu.left ? system.windowWidth - menu.left : 88
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navShellStyle: `height:${navHeight}px;`,
      navActionStyle: `top:${menuTop}px;height:${menuHeight}px;right:${menuRight + 4}px;`,
      contentTop: navHeight
    })
  },
    async loadEvent(options = {}) {
    const event = this.isSystemHoliday
      ? getSystemHolidayById(this.eventId)
      : getEventById(this.eventId)

    if (!event) {
      uni.showToast({
        title: "事件不存在",
        icon: "none"
      })
      setTimeout(() => this.handleBack(), 500)
      return
    }

    const daysLeft = getDaysLeft(event.target)
    const createdAt = new Date(event.createdAt || Date.now())
    const startTime = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      createdAt.getDate()
    ).getTime()
    const targetTime = new Date(
      event.target.year,
      event.target.month - 1,
      event.target.day
    ).getTime()
    const initialDays = Math.max(
      0,
      Number.isFinite(Number(event.initialDays))
        ? Number(event.initialDays)
        : Math.ceil((targetTime - startTime) / DAY_MS)
    )
    const elapsedDays = Math.max(0, initialDays - daysLeft)
    const heroProgress = initialDays <= 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((elapsedDays / initialDays) * 100)))
    const tasks = Array.isArray(event.aiTasks) ? event.aiTasks : []

    this.setData({
      aiQuote: stripAiPrefix(event.aiReminder),
      completedTaskCount: tasks.filter((item) => item.done).length,
      daysLeft,
      endDateText: formatShortDate(event.target),
      event,
      eventId: event.id,
      heroProgress,
      isVip: getApp().getVipState(),
      isSystemHoliday: !!event.isSystemHoliday,
      startDateText: `${createdAt.getMonth() + 1}月${createdAt.getDate()}日`,
      tasks,
      themeColor: themeColors[event.theme] || themeColors.brown,
      themeSurface: themeSurfaces[event.theme] || themeSurfaces.brown,
      timeline: normalizeTimeline(event.timeline)
    })

    if (!options.deferTaskGeneration && !event.isSystemHoliday && !tasks.length && !this.isLoadingTasks) {
      await this.generateTasks(event)
    }
  },
    async generateTasks(event) {
    this.setData({ isLoadingTasks: true, taskLoadFailed: false })

    try {
      const generatedTasks = await getApp().getAiService().generateTaskBreakdown({
        categoryId: event.countdownBook && event.countdownBook.id,
        categoryName: event.countdownBook && event.countdownBook.title,
        eventName: event.title,
        note: event.note,
        targetDate: event.target
      })
      const previousTasks = Array.isArray(event.aiTasks) ? event.aiTasks : []
      const completedTitles = previousTasks
        .filter((item) => item.done)
        .map((item) => item.title)
      const tasks = generatedTasks.map((item, index) => {
        const previousTask = previousTasks.find((task) => (
          task.id === item.id || task.title === item.title
        ))

        return {
          ...item,
          done: !!(
            (previousTask && previousTask.done)
            || completedTitles.includes(item.title)
          ),
          completedAt: previousTask && previousTask.completedAt
            ? previousTask.completedAt
            : null,
          id: item.id || `task-${index + 1}`
        }
      })
      const nextEvent = updateEvent(event.id, {
        aiTasks: tasks,
        aiTaskModel: generatedTasks.model || "",
        aiTaskProvider: generatedTasks.provider || "local"
      })

      this.setData({
        completedTaskCount: tasks.filter((item) => item.done).length,
        event: nextEvent || event,
        tasks
      })
    } catch (error) {
      console.error("generate AI tasks failed", error)
      this.setData({ taskLoadFailed: true })
    } finally {
      this.setData({ isLoadingTasks: false })
    }
  },
    handleRetryTasks() {
    if (!this.event || this.isLoadingTasks) {
      return
    }
    this.generateTasks(this.event)
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/index/index" })
  },
    handleEdit() {
    if (this.isSystemHoliday) {
      return
    }
    uni.navigateTo({
      url: `/pages/create/create?mode=edit&id=${encodeURIComponent(this.eventId)}`
    })
  },
    handleMore() {
    uni.showActionSheet({
      itemList: ["标记为特别时刻", "复制事件"],
      success: () => {
        uni.showToast({
          title: "已记录",
          icon: "success"
        })
      }
    })
  },
    handleToggleTask(event) {
    if (this.isSystemHoliday) {
      uni.showToast({
        title: "系统节日建议仅供参考",
        icon: "none"
      })
      return
    }
    if (!this.isVip) {
      this.handleOpenVip()
      return
    }

    const taskId = event.currentTarget.dataset.id
    const selectedTask = this.tasks.find((item) => item.id === taskId)
    if (!selectedTask || selectedTask.done) {
      if (selectedTask && selectedTask.done) {
        uni.showToast({
          title: "已完成的任务不可撤销",
          icon: "none"
        })
      }
      return
    }

    const tasks = this.tasks.map((item) => (
      item.id === taskId
        ? { ...item, done: true, completedAt: Date.now() }
        : item
    ))
    const nextEvent = updateEvent(this.eventId, { aiTasks: tasks })

    this.setData({
      completedTaskCount: tasks.filter((item) => item.done).length,
      event: nextEvent || this.event,
      tasks
    })
  },
    handleOpenVip() {
    this.setData({ showProModal: true })
  },
    handleClosePro() {
    if (this.isPaying) {
      return
    }
    this.setData({ showProModal: false })
  },
    handleModalTap() {},
    handleSelectPlan(event) {
    this.setData({
      selectedPlanId: event.currentTarget.dataset.id
    })
  },
    async handlePurchasePro() {
    if (this.isPaying) {
      return
    }

    const plan = proPlans.find((item) => item.id === this.selectedPlanId) || proPlans[1]
    this.setData({ isPaying: true })
    uni.showLoading({ title: "正在唤起支付" })

    try {
      const paymentResult = await getApp().getPaymentService().purchasePro(
        plan,
        getApp().getAuthState()
      )
      getApp().setVipState(true)
      uni.hideLoading()
      this.setData({
        isPaying: false,
        isVip: true,
        showProModal: false
      })
      uni.showToast({
        title: paymentResult.mock ? "演示支付成功" : "Pro 已成功开通",
        icon: "success"
      })
    } catch (error) {
      uni.hideLoading()
      this.setData({ isPaying: false })

      const cancelled = error && /cancel/i.test(error.errMsg || error.message || "")
      if (cancelled) {
        uni.showToast({ title: "已取消支付", icon: "none" })
        return
      }

      if (error && error.code === "PAYMENT_NOT_CONFIGURED") {
        uni.showModal({
          title: "支付服务未配置",
          content: "请在 app.js 启动配置中设置支付下单接口，接口返回微信支付参数后即可调用真实支付。",
          showCancel: false
        })
        return
      }

      uni.showToast({
        title: "支付未完成，请重试",
        icon: "none"
      })
    }
  },
    handleAddRecord() {
    uni.navigateTo({
      url: `/pages/record-now/record-now?eventId=${encodeURIComponent(this.eventId)}`
    })
  },
    handleDeleteRecord(event) {
    const entryId = event.currentTarget.dataset.id

    uni.showModal({
      title: "删除这条记录？",
      content: "删除后将无法恢复。",
      confirmText: "删除",
      confirmColor: "#b3261e",
      success: ({ confirm }) => {
        if (!confirm) {
          return
        }

        deleteTimelineEntryAsync(this.eventId, entryId)
        this.loadEvent()
      }
    })
  },
    handleEditRecord() {
    uni.showToast({
      title: "暂不支持编辑",
      icon: "none"
    })
  },
    handleDeleteRecord(event) {
    const entryId = event.currentTarget.dataset.id

    uni.showModal({
      title: "删除这条记录？",
      content: "删除后将无法恢复。",
      confirmText: "删除",
      confirmColor: "#b3261e",
      success: async ({ confirm }) => {
        if (!confirm) {
          return
        }

        uni.showLoading({ title: "正在删除", mask: true })
        try {
          await deleteTimelineEntryAsync(this.eventId, entryId)
          uni.hideLoading()
          uni.showToast({ title: "已删除", icon: "success" })
          this.loadEvent()
        } catch (error) {
          console.error("delete timeline failed", error)
          uni.hideLoading()
          uni.showToast({ title: "删除失败，请重试", icon: "none" })
        }
      }
    })
  },
    handleEditRecord(event) {
    const entryId = event.currentTarget.dataset.id
    const entry = this.timeline.find((item) => item.id === entryId)

    if (!entry) {
      return
    }

    uni.showModal({
      title: "编辑记录",
      editable: true,
      placeholderText: "写下这一刻的想法...",
      content: entry.content || "",
      confirmText: "保存",
      success: async ({ confirm, content }) => {
        if (!confirm) {
          return
        }

        const nextContent = String(content || "").trim()
        if (!nextContent && !entry.photos.length) {
          uni.showToast({ title: "记录内容不能为空", icon: "none" })
          return
        }

        uni.showLoading({ title: "正在保存", mask: true })
        try {
          await updateTimelineEntryAsync(this.eventId, entryId, {
            content: nextContent
          })
          uni.hideLoading()
          uni.showToast({ title: "已保存", icon: "success" })
          this.loadEvent()
        } catch (error) {
          console.error("update timeline failed", error)
          uni.hideLoading()
          uni.showToast({ title: "保存失败，请重试", icon: "none" })
        }
      }
    })
  },
    handlePreviewRecordImage(event) {
    const { current, entry } = event.currentTarget.dataset
    const timelineEntry = this.timeline.find((item) => item.id === entry)

    if (!timelineEntry || !timelineEntry.photos.length) {
      return
    }

    uni.previewImage({
      current,
      urls: timelineEntry.photos
    })
  },
    handleSaveImage() {
    uni.navigateTo({
      url: `/pages/poster/poster?id=${encodeURIComponent(this.eventId)}`
    })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #fcf8fb;
  color: #1b1b1d;
}

.tap-press,
.task-item-press {
  opacity: 0.72;
  transform: scale(0.98);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.24);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-left {
  position: absolute;
  left: 22rpx;
  bottom: 8rpx;
  display: flex;
  align-items: center;
  height: 64rpx;
}

.nav-title {
  margin-left: 8rpx;
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 600;
}

.nav-actions {
  position: absolute;
  left: auto;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.nav-button {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 80ms ease;
}

.nav-back-icon {
  width: 38rpx;
  height: 38rpx;
}

.nav-action-icon {
  width: 40rpx;
  height: 40rpx;
}

.page-content {
  box-sizing: border-box;
  padding-bottom: calc(154rpx + env(safe-area-inset-bottom));
}

.hero {
  position: relative;
  width: 100%;
  height: 780rpx;
  overflow: hidden;
  background: #d6b4a2;
}

.hero-tone-love {
  background: #ffd1dc;
}

.hero-tone-month {
  background: #303032;
}

.hero-image,
.hero-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-overlay {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.18) 0%,
    rgba(0, 0, 0, 0.02) 42%,
    rgba(252, 248, 251, 0.92) 100%
  );
}

.hero-content {
  position: absolute;
  left: 52rpx;
  right: 52rpx;
  top: 196rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ffffff;
  text-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.22);
}

.hero-tone-love .hero-content {
  color: #ff5e78;
  text-shadow: none;
}

.hero-tone-month .hero-content {
  color: #ffb77d;
  text-shadow: none;
}

.hero-kicker {
  max-width: 610rpx;
  font-size: 30rpx;
  line-height: 43rpx;
  font-weight: 500;
  opacity: 0.72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-number {
  margin-top: 24rpx;
  font-size: 230rpx;
  line-height: 230rpx;
  font-weight: 700;
}

.hero-unit {
  margin-top: 8rpx;
  font-size: 27rpx;
  line-height: 39rpx;
  font-weight: 500;
  opacity: 0.82;
}

.hero-progress {
  width: 492rpx;
  height: 8rpx;
  margin-top: 30rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.24);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.hero-progress-fill {
  min-width: 8rpx;
  height: 100%;
  border-radius: inherit;
  box-shadow: 0 0 16rpx rgba(255, 140, 0, 0.5);
}

.hero-dates {
  width: 492rpx;
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 31rpx;
  opacity: 0.68;
}

.detail-content {
  position: relative;
  z-index: 5;
  margin-top: -126rpx;
  padding: 0 38rpx;
}

.ai-card {
  position: relative;
  box-sizing: border-box;
  min-height: 290rpx;
  padding: 38rpx 34rpx 31rpx;
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.34);
  border-radius: 31rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20rpx 60rpx rgba(144, 77, 0, 0.08);
  -webkit-backdrop-filter: blur(22px);
  backdrop-filter: blur(22px);
}

.ai-badge {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 9rpx 22rpx;
  border-radius: 0 0 0 24rpx;
  background: rgba(144, 77, 0, 0.08);
  color: #904d00;
  font-size: 20rpx;
  line-height: 29rpx;
}

.ai-badge image {
  width: 22rpx;
  height: 22rpx;
}

.ai-heading {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #904d00;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 600;
}

.ai-heading image {
  width: 34rpx;
  height: 34rpx;
}

.ai-quote {
  display: block;
  margin-top: 24rpx;
  color: #1b1b1d;
  font-size: 30rpx;
  line-height: 49rpx;
  font-style: italic;
}

.ai-sign {
  display: block;
  margin-top: 20rpx;
  color: rgba(86, 67, 52, 0.55);
  font-size: 22rpx;
  line-height: 31rpx;
  text-align: right;
}

.task-section,
.timeline-section {
  margin-top: 48rpx;
}

.section-head {
  min-height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-title {
  font-size: 36rpx;
  line-height: 50rpx;
  font-weight: 600;
}

.task-progress {
  color: #904d00;
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 500;
}

.task-progress-loading {
  animation: task-loading-pulse 1.2s ease-in-out infinite;
}

.task-panel {
  position: relative;
  min-height: 410rpx;
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 31rpx;
  background: #ffffff;
}

.task-list {
  transition: filter 160ms ease;
}

.task-loading {
  position: relative;
  min-height: 410rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.task-loading-preview {
  min-height: 410rpx;
  opacity: 0.72;
  filter: blur(2rpx);
}

.task-preview-row {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  min-height: 128rpx;
  box-sizing: border-box;
  padding: 27rpx 30rpx;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.2);
}

.task-preview-check {
  width: 42rpx;
  height: 42rpx;
  flex: 0 0 auto;
  margin-top: 3rpx;
  box-sizing: border-box;
  border: 3rpx solid rgba(255, 140, 0, 0.2);
  border-radius: 50%;
}

.task-preview-copy {
  min-width: 0;
  flex: 1 1 auto;
  padding-top: 4rpx;
}

.task-preview-title,
.task-preview-line {
  border-radius: 8rpx;
  background: rgba(137, 115, 98, 0.13);
}

.task-preview-title {
  width: 38%;
  height: 25rpx;
}

.task-preview-line {
  width: 88%;
  height: 18rpx;
  margin-top: 15rpx;
}

.task-preview-line-short {
  width: 62%;
  margin-top: 9rpx;
}

.task-generating-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 38rpx;
  background: rgba(255, 255, 255, 0.68);
  -webkit-backdrop-filter: blur(10rpx);
  backdrop-filter: blur(10rpx);
}

.task-generating-icon {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 140, 0, 0.16);
  border-radius: 50%;
  background: rgba(255, 248, 240, 0.88);
  box-shadow: 0 12rpx 32rpx rgba(144, 77, 0, 0.08);
  animation: task-loading-pulse 1.2s ease-in-out infinite;
}

.task-generating-icon image {
  width: 42rpx;
  height: 42rpx;
}

.task-generating-title,
.task-generating-copy {
  display: block;
  text-align: center;
}

.task-generating-title {
  margin-top: 20rpx;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 41rpx;
  font-weight: 600;
}

.task-generating-copy {
  margin-top: 7rpx;
  color: rgba(86, 67, 52, 0.6);
  font-size: 21rpx;
  line-height: 31rpx;
}

.task-generating-dots {
  display: flex;
  gap: 10rpx;
  margin-top: 22rpx;
}

.task-generating-dots view {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ff8c00;
  animation: task-dot-pulse 1.1s ease-in-out infinite;
}

.task-generating-dots view:nth-child(2) {
  animation-delay: 160ms;
}

.task-generating-dots view:nth-child(3) {
  animation-delay: 320ms;
}

.task-load-error {
  min-height: 410rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 40rpx;
}

.task-load-error image {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 18rpx;
}

.task-load-error-title {
  color: #1b1b1d;
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 600;
}

.task-load-error-copy {
  margin-top: 7rpx;
  color: rgba(86, 67, 52, 0.58);
  font-size: 22rpx;
  line-height: 32rpx;
}

@keyframes task-loading-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes task-dot-pulse {
  0%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-5rpx);
  }
}

.task-list-locked {
  filter: blur(3rpx);
  opacity: 0.82;
  pointer-events: none;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  min-height: 128rpx;
  box-sizing: border-box;
  padding: 27rpx 30rpx;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.2);
}

.task-item:last-child {
  border-bottom: 0;
}

.task-item-completed {
  background: rgba(144, 77, 0, 0.025);
}

.task-check {
  width: 42rpx;
  height: 42rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3rpx;
  border: 3rpx solid rgba(255, 140, 0, 0.34);
  border-radius: 50%;
  box-sizing: border-box;
}

.task-check-done {
  border-color: #ff8c00;
  background: #ff8c00;
}

.task-check image {
  width: 28rpx;
  height: 28rpx;
}

.task-copy {
  min-width: 0;
  flex: 1 1 auto;
}

.task-title-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18rpx;
}

.task-title {
  min-width: 0;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 41rpx;
  font-weight: 500;
}

.task-title-done {
  color: rgba(86, 67, 52, 0.55);
  text-decoration: line-through;
}

.task-time {
  flex: 0 0 auto;
  color: #904d00;
  font-size: 19rpx;
  line-height: 27rpx;
}

.task-description {
  display: block;
  margin-top: 7rpx;
  color: rgba(86, 67, 52, 0.66);
  font-size: 22rpx;
  line-height: 34rpx;
}

.vip-mask {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(5rpx);
  backdrop-filter: blur(5rpx);
}

.vip-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 140, 0, 0.1);
}

.vip-icon-wrap image {
  width: 42rpx;
  height: 42rpx;
}

.vip-title {
  margin-top: 18rpx;
  font-size: 31rpx;
  line-height: 43rpx;
  font-weight: 600;
}

.vip-description {
  margin-top: 6rpx;
  color: rgba(86, 67, 52, 0.64);
  font-size: 22rpx;
  line-height: 32rpx;
}

.vip-button {
  margin-top: 22rpx;
  padding: 13rpx 36rpx;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 600;
}

.timeline-add {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-add image {
  width: 47rpx;
  height: 47rpx;
}

.timeline-empty {
  min-height: 250rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(221, 193, 174, 0.48);
  border-radius: 31rpx;
  background: rgba(255, 255, 255, 0.52);
}

.timeline-empty image {
  width: 58rpx;
  height: 58rpx;
  opacity: 0.56;
}

.timeline-empty-title {
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 500;
}

.timeline-empty-copy {
  margin-top: 6rpx;
  color: rgba(86, 67, 52, 0.56);
  font-size: 21rpx;
  line-height: 30rpx;
}

.timeline-item {
  display: flex;
  align-items: stretch;
}

.timeline-rail {
  position: relative;
  width: 43rpx;
  flex: 0 0 auto;
}

.timeline-dot {
  position: relative;
  z-index: 2;
  width: 23rpx;
  height: 23rpx;
  margin: 8rpx 0 0 2rpx;
  border: 8rpx solid #fcf8fb;
  border-radius: 50%;
  background: #ffb77d;
  box-sizing: content-box;
}

.timeline-line {
  position: absolute;
  left: 13rpx;
  top: 38rpx;
  bottom: -8rpx;
  width: 2rpx;
  background: #e5e5e7;
}

.timeline-main {
  min-width: 0;
  flex: 1 1 auto;
  padding-bottom: 28rpx;
}

.timeline-meta {
  min-height: 48rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.timeline-date {
  color: #564334;
  font-size: 23rpx;
  line-height: 32rpx;
  font-weight: 500;
}

.timeline-time {
  margin-left: 12rpx;
  color: rgba(86, 67, 52, 0.48);
  font-size: 19rpx;
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.timeline-actions view {
  width: 46rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-actions image {
  width: 31rpx;
  height: 31rpx;
  opacity: 0.58;
}

.timeline-card {
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.26);
  border-radius: 23rpx;
  background: #ffffff;
}

.timeline-photos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rpx;
}

.timeline-photo {
  width: 100%;
  height: 190rpx;
  background: #e4e2e4;
}

.timeline-photos .timeline-photo:first-child:last-child {
  grid-column: 1 / -1;
  height: 252rpx;
}

.timeline-text {
  display: block;
  padding: 25rpx 27rpx;
  color: #1b1b1d;
  font-size: 26rpx;
  line-height: 42rpx;
}

.location-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 0 27rpx 24rpx;
  color: #904d00;
  font-size: 20rpx;
  line-height: 29rpx;
}

.location-chip image {
  width: 27rpx;
  height: 27rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  min-height: 108rpx;
  padding: 12rpx 40rpx calc(12rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  border-radius: 31rpx 31rpx 0 0;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 -18rpx 50rpx rgba(0, 0, 0, 0.04);
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
}

.floating-edit {
  position: fixed;
  right: 42rpx;
  bottom: calc(150rpx + env(safe-area-inset-bottom));
  z-index: 70;
  width: 108rpx;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1rpx solid rgba(221, 193, 174, 0.38);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 44rpx rgba(27, 28, 28, 0.1);
  -webkit-backdrop-filter: blur(22px);
  backdrop-filter: blur(22px);
}

.floating-edit image {
  width: 46rpx;
  height: 46rpx;
}

.bottom-action {
  min-width: 0;
  flex: 1 1 0;
  min-height: 76rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  color: #564334;
  font-size: 21rpx;
  line-height: 29rpx;
}

.bottom-action image {
  width: 38rpx;
  height: 38rpx;
}

.share-button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-weight: 400;
  line-height: normal;
  box-sizing: border-box;
}

.share-button::after {
  border: 0;
}

.bottom-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(221, 193, 174, 0.34);
}

.pro-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 34rpx;
  background: rgba(27, 27, 29, 0.36);
  -webkit-backdrop-filter: blur(8rpx);
  backdrop-filter: blur(8rpx);
}

.pro-modal {
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 28rpx 30rpx;
  border: 1rpx solid rgba(255,255,255,0.72);
  border-radius: 46rpx;
  background: rgba(255,255,255,0.9);
  box-shadow: 0 40rpx 100rpx rgba(0,0,0,0.14);
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
}

.pro-modal-head {
  height: 78rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 29rpx;
  font-weight: 600;
}

.pro-head-spacer,
.pro-close {
  width: 52rpx;
  height: 52rpx;
}

.pro-close {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pro-close image {
  width: 34rpx;
  height: 34rpx;
}

.pro-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rpx 0 18rpx;
}

.pro-logo {
  width: 104rpx;
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 31rpx;
  background: linear-gradient(145deg, #ffb347, #ff8c00);
  box-shadow: 0 15rpx 35rpx rgba(255,140,0,0.24);
  transform: rotate(4deg);
}

.pro-logo image {
  width: 62rpx;
  height: 62rpx;
  filter: brightness(0) invert(1);
}

.pro-title {
  margin-top: 21rpx;
  font-size: 39rpx;
  line-height: 52rpx;
  font-weight: 700;
}

.pro-subtitle {
  margin-top: 7rpx;
  color: #5d5e60;
  font-size: 22rpx;
  line-height: 32rpx;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13rpx;
  margin-top: 8rpx;
}

.benefit-item {
  min-height: 126rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14rpx;
  box-sizing: border-box;
  border: 1rpx solid rgba(255,255,255,0.7);
  border-radius: 23rpx;
  background: rgba(255,255,255,0.46);
}

.benefit-icon {
  width: 46rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: rgba(255,140,0,0.08);
}

.benefit-icon image {
  width: 31rpx;
  height: 31rpx;
}

.benefit-title {
  margin-top: 7rpx;
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 600;
}

.benefit-copy {
  margin-top: 2rpx;
  color: #5d5e60;
  font-size: 17rpx;
  line-height: 24rpx;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.plan-option {
  position: relative;
  min-height: 216rpx;
  box-sizing: border-box;
  padding: 25rpx 20rpx;
  overflow: hidden;
  border: 2rpx solid rgba(93,94,96,0.18);
  border-radius: 31rpx;
  background: #ffffff;
}

.plan-option-active {
  border: 4rpx solid #904d00;
  background: rgba(255,140,0,0.035);
}

.recommended-tag {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5rpx 13rpx;
  border-radius: 0 0 0 17rpx;
  background: #ffd21c;
  color: #735500;
  font-size: 16rpx;
  font-weight: 700;
}

.plan-check {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 32rpx;
  height: 32rpx;
}

.plan-option-active .recommended-tag + .plan-check {
  top: 43rpx;
}

.plan-icon {
  width: 37rpx;
  height: 37rpx;
}

.plan-name {
  display: block;
  margin-top: 13rpx;
  font-size: 27rpx;
  line-height: 38rpx;
  font-weight: 600;
}

.plan-price {
  display: flex;
  align-items: baseline;
  margin-top: 9rpx;
  color: #904d00;
  font-size: 34rpx;
  line-height: 43rpx;
  font-weight: 700;
}

.plan-suffix {
  margin-left: 4rpx;
  color: #5d5e60;
  font-size: 18rpx;
  font-weight: 400;
}

.plan-description {
  display: block;
  margin-top: 7rpx;
  color: #8b8581;
  font-size: 17rpx;
  line-height: 24rpx;
}

.purchase-button {
  height: 94rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 25rpx;
  border-radius: 25rpx;
  background: linear-gradient(100deg, #ff8c00, #ffb77d);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 14rpx 35rpx rgba(255,140,0,0.24);
}

.purchase-button image {
  width: 34rpx;
  height: 34rpx;
}

.pro-terms {
  display: block;
  margin-top: 17rpx;
  color: #9a8f88;
  font-size: 16rpx;
  line-height: 24rpx;
  text-align: center;
}
</style>
