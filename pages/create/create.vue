<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-action nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image class="nav-icon" src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">
      <text>{{pageTitle}}</text>
    </view>
  </view>

  <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="section">
      <text class="section-label">第 1 步：基本信息</text>
      <view class="list-card">
        <view class="form-row">
          <text class="row-label fixed-label">事件名称</text>
          <input class="event-input" :value="eventName" placeholder="例如：我的生日" placeholder-class="input-placeholder" @input="handleNameInput" />
        </view>
        <view class="category-block">
          <text class="row-label">分类选择</text>
          <view class="category-grid">
            <view :class="'category-item ' + (selectedCategory === item.id ? 'category-active' : '')" :data-id="item.id" @tap="handleSelectCategory" hover-class="tap-press" v-for="(item, index) in categories" :key="item.id">
              <image class="category-icon" :src="selectedCategory === item.id ? item.activeIcon : item.icon" mode="aspectFit"></image>
              <text>{{item.label}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-label">第 2 步：时间与备注</text>
      <view class="list-card">
        <view class="form-row row-between" @tap="handleOpenDatePicker" hover-class="row-press">
          <text class="row-label">目标日期</text>
          <view class="row-value">
            <text class="primary-value">{{targetDateText}}</text>
            <image class="small-icon" src="/static/assets/icons/calendar-month.svg" mode="aspectFit"></image>
          </view>
        </view>
        <view class="note-row">
          <text class="row-label">备注</text>
          <textarea class="note-input" :value="note" placeholder="记录下这一刻的期待..." placeholder-class="input-placeholder" :auto-height="false" maxlength="80" @input="handleNoteInput"></textarea>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="list-card">
        <view class="form-row row-between">
          <text class="row-label">置顶此事件</text>
          <view :class="'custom-switch ' + (pinned ? 'custom-switch-on' : '')" @tap="togglePinned" hover-class="tap-press">
            <view class="switch-thumb"></view>
          </view>
        </view>
        <view class="form-row row-between" @tap="handleOpenReminderPicker" hover-class="row-press">
          <text class="row-label">定期提醒</text>
          <view class="row-value muted-value">
            <text>{{reminderText}}</text>
            <image class="small-chevron" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="fold-section">
      <view class="fold-head" @tap="togglePro" hover-class="tap-press">
        <text class="section-label inline-label">Pro 功能区</text>
        <text class="pro-tag">PRO</text>
        <image :class="'fold-chevron ' + (proExpanded ? 'fold-open' : '')" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
      </view>
      <view v-if="proExpanded" class="list-card pro-card">
        <view class="form-row row-between">
          <text class="row-label">AI 智能分解任务</text>
          <view :class="'custom-switch ' + (aiBreakdown ? 'custom-switch-on' : '')" @tap="toggleAiBreakdown" hover-class="tap-press">
            <view class="switch-thumb"></view>
          </view>
        </view>
        <view class="form-row row-between">
          <text class="row-label">事件主题颜色</text>
          <view class="color-row">
            <view
              :class="'color-choice ' + (selectedTheme === item.id ? 'color-choice-active' : '')"
             
             
              :data-id="item.id"
              @tap="handleSelectTheme"
              hover-class="tap-press"
             v-for="(item, index) in themeOptions" :key="item.id">
              <view class="color-dot" :style="'background: ' + (item.color) + ';'"></view>
            </view>
          </view>
        </view>
        <view class="form-row row-between" @tap="handleOpenCardEffect" hover-class="row-press">
          <text class="row-label">卡片特效与背景</text>
          <view class="row-value muted-value">
            <text>{{selectedEffectLabel}}</text>
            <image class="small-icon" src="/static/assets/icons/magic-button.svg" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="fold-section">
      <view class="fold-head" @tap="toggleBackground" hover-class="tap-press">
        <text class="section-label inline-label">背景设置</text>
        <image :class="'fold-chevron ' + (backgroundExpanded ? 'fold-open' : '')" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
      </view>
      <view v-if="backgroundExpanded" class="list-card background-card">
        <view class="media-grid">
          <view class="media-action" @tap="handleTakePhoto" hover-class="tap-press">
            <image class="media-icon" src="/static/assets/icons/photo-camera.svg" mode="aspectFit"></image>
            <text>拍照</text>
          </view>
          <view class="media-action" @tap="handleChooseAlbum" hover-class="tap-press">
            <image class="media-icon" src="/static/assets/icons/image.svg" mode="aspectFit"></image>
            <text>相册</text>
          </view>
          <view class="media-action" @tap="handleOpenTemplates" hover-class="tap-press">
            <image class="media-icon" src="/static/assets/icons/dashboard.svg" mode="aspectFit"></image>
            <text>模板</text>
          </view>
        </view>
        <view :class="'preview-card ' + (backgroundTone ? 'preview-tone-' + backgroundTone : '')">
          <image v-if="backgroundImage" class="preview-image" :src="backgroundImage" mode="aspectFill"></image>
          <view class="preview-copy">
            <text class="preview-kicker">{{backgroundLabel}}</text>
            <text class="preview-title">距离 {{eventName || '未命名事件'}}</text>
            <view class="preview-count">
              <text class="preview-number">{{backgroundDaysLeft}}</text>
              <text class="preview-unit">天</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="footer-action">
    <view v-if="isEdit" class="delete-button" @tap="handleDeleteEvent" hover-class="save-press">
      <image src="/static/assets/icons/delete.svg" mode="aspectFit"></image>
      <text>删除</text>
    </view>
    <button :class="'save-button ' + (isEdit ? 'save-button-edit' : '')" :disabled="isSaving" @tap="handleDone" hover-class="save-press">{{isSaving ? '正在保存' : (isEdit ? '保存修改' : '保存时刻')}}</button>
  </view>
</view>
</template>

<script>
const { getCountdownBooks, getSelectedCountdownBook, refreshCountdownBooksFromCloud } = require("../../utils/countdown-books")
const { deleteEvent, getEventById, refreshEventDetailFromCloud, saveEventAsync, updateEventAsync } = require("../../utils/event-store")
const { getCloudTempFileURL, isCloudFileId, uploadEventBackground } = require("../../utils/cloud-files")
const { getWindowMetrics } = require("../../utils/system-info")

const bookPickerCategory = {
  id: "book-picker",
  label: "其他",
  icon: "/static/assets/icons/more-horiz.svg",
  activeIcon: "/static/assets/icons/more-horiz-white.svg",
  isBookPicker: true
}

function toCategory(book) {
  const icon = book.iconSrc || book.icon || "/static/assets/icons/book.svg"

  return {
    id: book.id,
    label: book.title || book.label,
    icon,
    activeIcon: icon,
    isCountdownBook: true
  }
}

function buildCreateCategories(selectedBook) {
  const books = getCountdownBooks()
  const designBookIds = ["life", "travel", "work"]
  const designBooks = designBookIds
    .map((id) => books.find((book) => book.id === id))
    .filter(Boolean)
  const fallbackSelected = selectedBook || designBooks[0] || books[0]
  const isDesignBook = designBookIds.includes(fallbackSelected.id)
  const visibleBooks = isDesignBook
    ? designBooks
    : [fallbackSelected].concat(designBooks.filter((book) => book.id !== fallbackSelected.id)).slice(0, 3)

  return visibleBooks.map(toCategory).concat(bookPickerCategory)
}

function getTodayParts() {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  }
}

function formatTargetDate(date) {
  return `${date.year}年${date.month}月${date.day}日`
}

function isBeforeToday(date) {
  const today = getTodayParts()
  const target = new Date(date.year, date.month - 1, date.day).getTime()
  const min = new Date(today.year, today.month - 1, today.day).getTime()

  return target < min
}

function getDaysLeft(date) {
  const today = getTodayParts()
  const targetTime = new Date(date.year, date.month - 1, date.day).getTime()
  const todayTime = new Date(today.year, today.month - 1, today.day).getTime()

  return Math.max(0, Math.ceil((targetTime - todayTime) / 86400000))
}

const themeOptions = [
  { id: "brown", color: "#904d00" },
  { id: "orange", color: "#ff8c00" },
  { id: "gray", color: "#5d5e60" },
  { id: "peach", color: "#ffb77d" }
]

export default {
  data() {
    return {
    aiBreakdown: false,
    backgroundDaysLeft: 0,
    backgroundImage: "/static/assets/create/preview-bg.jpg",
    backgroundLabel: "默认背景",
    backgroundTone: "",
    backgroundExpanded: true,
    categories: [],
    contentTop: 88,
    eventId: "",
    eventName: "",
    isEdit: false,
    isUploadingBackground: false,
    isSaving: false,
    navActionStyle: "",
    navShellStyle: "",
    pageTitle: "新建时刻",
    pinned: false,
    proExpanded: true,
    selectedCategory: "",
    selectedCountdownBook: null,
    reminderText: "无",
    note: "",
    selectedEffectLabel: "动态渐变",
    selectedTheme: "brown",
    themeOptions,
    targetDateText: formatTargetDate(getTodayParts())
  }
  },
  async onLoad(options = {}) {
    this.eventId = decodeURIComponent(options.id || "")
    this.isEdit = options.mode === "edit"
    this.setupNavigation()
    await refreshCountdownBooksFromCloud()
    this.syncSelectedBook()
    this.setData({
      eventId: this.eventId,
      isEdit: this.isEdit,
      pageTitle: this.isEdit ? "编辑时刻" : "新建时刻"
    })

    if (this.isEdit) {
      await refreshEventDetailFromCloud(this.eventId)
      this.loadEditEvent()
    }
  },
  onShow() {
    this.syncSelectedBook()
    this.syncTargetDate()
    this.syncReminder()
    this.syncCardPreferences()
    this.syncBackground()
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
    loadEditEvent() {
    const event = getEventById(this.eventId)

    if (!event) {
      uni.showToast({ title: "事件不存在", icon: "none" })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }

    const countdownBook = getCountdownBooks().find((book) => (
      book.id === (event.countdownBook && event.countdownBook.id)
    )) || getSelectedCountdownBook()
    const targetDate = {
      ...event.target,
      text: event.targetDateText || formatTargetDate(event.target)
    }
    const reminder = event.reminder || { id: "none", label: "无", displayLabel: "无" }
    const background = event.background || {
      type: "default",
      image: this.backgroundImage,
      label: this.backgroundLabel
    }
    const effect = event.effect || { id: "dynamic-gradient", label: "动态渐变" }

    uni.setStorageSync("selectedCountdownBook", countdownBook)
    uni.setStorageSync("selectedTargetDate", targetDate)
    uni.setStorageSync("selectedReminder", reminder)
    uni.setStorageSync("selectedBackground", background)
    uni.setStorageSync("selectedEventTheme", event.theme || "brown")
    uni.setStorageSync("selectedCardEffect", effect)

    this.setData({
      aiBreakdown: !!event.aiBreakdown,
      backgroundDaysLeft: getDaysLeft(targetDate),
      backgroundImage: background.image || (background.tone ? "" : this.backgroundImage),
      backgroundLabel: background.label || "自定义背景",
      backgroundTone: background.tone || "",
      categories: buildCreateCategories(countdownBook),
      eventName: event.title || "",
      note: event.note || "",
      pinned: !!event.pinned,
      reminderText: reminder.displayLabel || reminder.label || "无",
      selectedCategory: countdownBook.id,
      selectedCountdownBook: countdownBook,
      selectedEffectLabel: effect.label || "动态渐变",
      selectedTheme: themeOptions.some((item) => item.id === event.theme) ? event.theme : "brown",
      targetDateText: targetDate.text
    })
  },
    syncSelectedBook() {
    const selectedCountdownBook = getSelectedCountdownBook()

    this.setData({
      categories: buildCreateCategories(selectedCountdownBook),
      selectedCategory: selectedCountdownBook.id,
      selectedCountdownBook
    })
  },
    syncTargetDate() {
    const selectedTargetDate = uni.getStorageSync("selectedTargetDate")

    if (!selectedTargetDate) {
      const today = getTodayParts()
      this.setData({
        backgroundDaysLeft: 0,
        targetDateText: formatTargetDate(today)
      })
      return
    }

    if (isBeforeToday(selectedTargetDate)) {
      const today = getTodayParts()
      const nextTargetDate = {
        ...today,
        text: formatTargetDate(today)
      }

      uni.setStorageSync("selectedTargetDate", nextTargetDate)
      this.setData({
        backgroundDaysLeft: 0,
        targetDateText: nextTargetDate.text
      })
      return
    }

    this.setData({
      backgroundDaysLeft: getDaysLeft(selectedTargetDate),
      targetDateText: selectedTargetDate.text || formatTargetDate(selectedTargetDate)
    })
  },
    syncReminder() {
    const selectedReminder = uni.getStorageSync("selectedReminder") || {}

    this.setData({
      reminderText: selectedReminder.displayLabel || selectedReminder.label || "无"
    })
  },
    syncCardPreferences() {
    const selectedTheme = uni.getStorageSync("selectedEventTheme")
    const selectedEffect = uni.getStorageSync("selectedCardEffect")

    this.setData({
      selectedEffectLabel: selectedEffect.label || "动态渐变",
      selectedTheme: themeOptions.some((item) => item.id === selectedTheme) ? selectedTheme : "brown"
    })
  },
    syncBackground() {
    const selectedBackground = uni.getStorageSync("selectedBackground")

    if (!selectedBackground || (!selectedBackground.image && !selectedBackground.tone)) {
      return
    }

    const backgroundFileId = selectedBackground.cloudFileId || selectedBackground.fileID || selectedBackground.image
    const displayImage = selectedBackground.localPreview || selectedBackground.previewImage || selectedBackground.image || ""

    this.setData({
      backgroundImage: displayImage,
      backgroundLabel: selectedBackground.label || "自定义背景",
      backgroundTone: selectedBackground.tone || ""
    })

    if (!selectedBackground.localPreview && isCloudFileId(backgroundFileId)) {
      getCloudTempFileURL(backgroundFileId)
        .then((url) => {
          if (url) {
            this.setData({ backgroundImage: url })
          }
        })
        .catch((error) => {
          console.warn("resolve background temp url failed", error)
        })
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
      contentTop: navHeight + 24
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/index/index" })
  },
    async handleDone() {
    const eventName = this.eventName.trim()
    if (!eventName) {
      uni.showToast({
        title: "请输入事件名称",
        icon: "none"
      })
      return
    }

    if (this.isSaving) {
      return
    }

    this.setData({ isSaving: true })
    uni.showLoading({ title: "正在保存" })

    try {
      const selectedTargetDate = uni.getStorageSync("selectedTargetDate") || getTodayParts()
      const selectedBackground = uni.getStorageSync("selectedBackground") || {
        type: "default",
        image: this.backgroundImage,
        label: this.backgroundLabel
      }
      const selectedReminder = uni.getStorageSync("selectedReminder") || {
        id: "none",
        label: "无",
        displayLabel: "无"
      }
      const selectedEffect = uni.getStorageSync("selectedCardEffect") || {
        id: "dynamic-gradient",
        label: "动态渐变"
      }
      const countdownBook = this.selectedCountdownBook || getSelectedCountdownBook()
      const aiService = getApp().getAiService()
      const aiReminder = await aiService.generateEventReminder({
        categoryId: countdownBook.id,
        categoryName: countdownBook.title,
        eventName,
        note: this.note,
        targetDate: selectedTargetDate
      })
      const createdAt = Date.now()
      const initialDays = getDaysLeft(selectedTargetDate)
      const eventPatch = {
        title: eventName,
        note: this.note.trim(),
        aiReminder,
        target: {
          year: selectedTargetDate.year,
          month: selectedTargetDate.month,
          day: selectedTargetDate.day
        },
        targetDateText: selectedTargetDate.text || formatTargetDate(selectedTargetDate),
        countdownBook: {
          id: countdownBook.id,
          title: countdownBook.title,
          iconSrc: countdownBook.iconSrc || countdownBook.icon || "/static/assets/icons/book.svg"
        },
        background: {
          type: selectedBackground.type || "default",
          category: selectedBackground.category || "",
          templateId: selectedBackground.templateId || "",
          image: selectedBackground.cloudFileId || selectedBackground.fileID || selectedBackground.image || (selectedBackground.tone ? "" : this.backgroundImage),
          cloudFileId: selectedBackground.cloudFileId || selectedBackground.fileID || "",
          tone: selectedBackground.tone || "",
          label: selectedBackground.label || this.backgroundLabel
        },
        theme: this.selectedTheme,
        effect: selectedEffect,
        reminder: selectedReminder,
        pinned: this.pinned,
        aiBreakdown: this.aiBreakdown,
        initialDays
      }

      if (this.isEdit) {
        await updateEventAsync(this.eventId, eventPatch)
      } else {
        await saveEventAsync({
          id: `event-${createdAt}`,
          ...eventPatch,
          aiTasks: [],
          timeline: [],
          createdAt
        })
      }

      this.clearDraftPreferences()
      uni.hideLoading()
      uni.showToast({
        title: "保存成功",
        icon: "success"
      })

      setTimeout(() => {
        if (this.isEdit) {
          uni.navigateBack()
          return
        }

        uni.redirectTo({ url: "/pages/index/index" })
      }, 350)
    } catch (error) {
      uni.hideLoading()
      this.setData({ isSaving: false })
      uni.showToast({
        title: "保存失败，请重试",
        icon: "none"
      })
    }
  },
    handleDeleteEvent() {
    uni.showModal({
      title: "删除这个时刻？",
      content: "删除后该倒数日和时光记录将无法恢复。",
      confirmText: "删除",
      confirmColor: "#ba1a1a",
      success: ({ confirm }) => {
        if (!confirm) {
          return
        }

        deleteEvent(this.eventId)
        this.clearDraftPreferences()
        uni.showToast({ title: "已删除", icon: "success" })

        setTimeout(() => {
          if (getCurrentPages().length > 2) {
            uni.navigateBack({ delta: 2 })
            return
          }

          uni.redirectTo({ url: "/pages/index/index" })
        }, 350)
      }
    })
  },
    clearDraftPreferences() {
    [
      "selectedTargetDate",
      "selectedReminder",
      "selectedBackground",
      "selectedEventTheme",
      "selectedCardEffect"
    ].forEach((key) => uni.removeStorageSync(key))
  },
    handleNameInput(event) {
    this.setData({
      eventName: event.detail.value
    })
  },
    handleNoteInput(event) {
    this.setData({
      note: event.detail.value
    })
  },
    handleSelectCategory(event) {
    const selectedCategory = event.currentTarget.dataset.id

    if (selectedCategory === "book-picker") {
      uni.navigateTo({ url: "/pages/category-select/category-select" })
      return
    }

    const selectedCountdownBook = getCountdownBooks().find((book) => book.id === selectedCategory)

    if (selectedCountdownBook) {
      uni.setStorageSync("selectedCountdownBook", selectedCountdownBook)
      this.setData({
        categories: buildCreateCategories(selectedCountdownBook),
        selectedCategory,
        selectedCountdownBook
      })
      return
    }

    this.setData({ selectedCategory })
  },
    handleOpenDatePicker() {
    uni.navigateTo({ url: "/pages/date-select/date-select" })
  },
    handleOpenReminderPicker() {
    uni.navigateTo({ url: "/pages/reminder-select/reminder-select" })
  },
    handleSelectTheme(event) {
    const selectedTheme = event.currentTarget.dataset.id

    if (!themeOptions.some((item) => item.id === selectedTheme)) {
      return
    }

    uni.setStorageSync("selectedEventTheme", selectedTheme)
    this.setData({ selectedTheme })
  },
    handleOpenCardEffect() {
    uni.navigateTo({ url: "/pages/card-effect-select/card-effect-select" })
  },
    handleTakePhoto() {
    this.chooseBackgroundMedia(["camera"])
  },
    handleChooseAlbum() {
    this.chooseBackgroundMedia(["album"])
  },
    chooseBackgroundMedia(sourceType) {
    if (this.isUploadingBackground) {
      return
    }

    uni.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType,
      success: async ({ tempFiles }) => {
        const file = tempFiles && tempFiles[0]
        if (!file) {
          return
        }

        const previewPath = file.tempFilePath
        this.setData({ isUploadingBackground: true })
        this.applyLocalPreviewBackground(previewPath)
        uni.showLoading({ title: "上传背景中", mask: true })

        try {
          const result = await uploadEventBackground(previewPath)
          uni.hideLoading()
          this.applyCloudBackground(result.fileID, previewPath)
          this.setData({ isUploadingBackground: false })
          uni.showToast({ title: "背景已上传", icon: "success" })
        } catch (error) {
          console.error("upload event background failed", error)
          uni.hideLoading()
          this.setData({ isUploadingBackground: false })
          uni.showToast({ title: "上传失败，请重试", icon: "none" })
        }
      }
    })
  },
    applyLocalPreviewBackground(image) {
    this.setData({
      backgroundImage: image,
      backgroundLabel: "本地图片",
      backgroundTone: ""
    })
  },
    applyCloudBackground(fileID, previewImage) {
    const selectedBackground = {
      type: "cloud",
      image: fileID,
      cloudFileId: fileID,
      localPreview: previewImage || "",
      label: "本地图片"
    }

    uni.setStorageSync("selectedBackground", selectedBackground)
    this.setData({
      backgroundImage: previewImage || fileID,
      backgroundLabel: selectedBackground.label,
      backgroundTone: ""
    })
  },
    handleOpenTemplates() {
    uni.navigateTo({ url: "/pages/template-picker/template-picker" })
  },
    togglePinned() {
    this.setData({
      pinned: !this.pinned
    })
  },
    toggleAiBreakdown() {
    this.setData({
      aiBreakdown: !this.aiBreakdown
    })
  },
    togglePro() {
    this.setData({
      proExpanded: !this.proExpanded
    })
  },
    toggleBackground() {
    this.setData({
      backgroundExpanded: !this.backgroundExpanded
    })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #f5f5f7;
  color: #1b1b1d;
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
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
  padding-left: 38rpx;
  padding-right: 38rpx;
  padding-bottom: calc(196rpx + env(safe-area-inset-bottom));
}

.section,
.fold-section {
  margin-bottom: 46rpx;
}

.settings-section {
  margin-bottom: 46rpx;
}

.section-label {
  display: block;
  margin: 0 31rpx 15rpx;
  color: #5d5e60;
  font-size: 25rpx;
  line-height: 35rpx;
  font-weight: 500;
  letter-spacing: 0;
}

.inline-label {
  margin: 0;
}

.list-card {
  overflow: hidden;
  border-radius: 23rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
}

.form-row {
  min-height: 89rpx;
  display: flex;
  align-items: center;
  padding: 23rpx 31rpx;
  border-bottom: 1rpx solid rgba(229, 229, 231, 0.9);
}

.form-row:last-child {
  border-bottom: 0;
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

.event-input {
  min-width: 0;
  flex: 1 1 auto;
  height: 42rpx;
  color: #564334;
  font-size: 29rpx;
  line-height: 42rpx;
}

.input-placeholder {
  color: rgba(137, 115, 98, 0.42);
}

.category-block {
  padding: 31rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23rpx;
  margin-top: 31rpx;
}

.category-item {
  min-height: 127rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 23rpx 12rpx;
  border-radius: 23rpx;
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
  width: 46rpx;
  height: 46rpx;
  margin-bottom: 8rpx;
}

.category-active .category-icon {
  filter: brightness(0) invert(1);
}

.category-item text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-value {
  display: flex;
  align-items: center;
  gap: 15rpx;
  min-width: 0;
}

.primary-value {
  color: #904d00;
  font-size: 29rpx;
  line-height: 42rpx;
  font-weight: 500;
}

.small-icon,
.small-chevron {
  width: 35rpx;
  height: 35rpx;
}

.muted-value {
  color: rgba(93, 94, 96, 0.6);
  font-size: 29rpx;
  line-height: 42rpx;
}

.note-row {
  min-height: 150rpx;
  padding: 31rpx;
}

.note-input {
  width: 100%;
  height: 69rpx;
  margin-top: 15rpx;
  color: #564334;
  font-size: 29rpx;
  line-height: 39rpx;
}

.custom-switch {
  position: relative;
  width: 98rpx;
  height: 60rpx;
  flex: 0 0 auto;
  border-radius: 999rpx;
  background: #e9e9ea;
  box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, 0.04);
  transition: background-color 160ms ease;
}

.switch-thumb {
  position: absolute;
  left: 4rpx;
  top: 4rpx;
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.16);
  transition: transform 160ms ease;
}

.custom-switch-on {
  background: #34c759;
}

.custom-switch-on .switch-thumb {
  transform: translateX(38rpx);
}

.fold-head {
  min-height: 42rpx;
  display: flex;
  align-items: center;
  padding: 0 31rpx;
}

.pro-tag {
  display: inline-flex;
  align-items: center;
  margin-left: 8rpx;
  padding: 2rpx 9rpx;
  border-radius: 7rpx;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: #4b3300;
  font-size: 17rpx;
  line-height: 21rpx;
  font-weight: 800;
}

.fold-chevron {
  width: 34rpx;
  height: 34rpx;
  margin-left: auto;
  opacity: 0.72;
  transition: transform 160ms ease;
}

.fold-open {
  transform: rotate(90deg);
}

.pro-card {
  margin-top: 15rpx;
  border: 1rpx solid rgba(144, 77, 0, 0.1);
  box-shadow: 0 8rpx 23rpx rgba(0, 0, 0, 0.04);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.color-choice {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  border-radius: 50%;
}

.color-choice-active {
  border-color: rgba(144, 77, 0, 0.22);
  background: #ffffff;
  box-shadow: 0 0 0 3rpx #ffffff, 0 0 0 6rpx rgba(144, 77, 0, 0.16);
}

.color-dot {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
}

.background-card {
  margin-top: 15rpx;
  padding: 31rpx;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 23rpx;
  margin-bottom: 31rpx;
}

.media-action {
  min-height: 104rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 23rpx;
  color: #1b1b1d;
  font-size: 21rpx;
  line-height: 27rpx;
  font-weight: 500;
}

.media-icon {
  width: 38rpx;
  height: 38rpx;
}

.preview-card {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 23rpx;
  background: #e4e2e4;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-tone-love {
  background: #ffd1dc;
}

.preview-tone-month {
  background: #303032;
}

.preview-tone-love .preview-copy {
  color: #ff5e78;
  text-shadow: none;
}

.preview-tone-month .preview-copy {
  color: #ffb77d;
  text-shadow: none;
}

.preview-copy {
  position: absolute;
  left: 23rpx;
  right: 23rpx;
  bottom: 23rpx;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.preview-kicker {
  margin-bottom: 2rpx;
  font-size: 19rpx;
  line-height: 25rpx;
  opacity: 0.8;
}

.preview-title {
  max-width: 100%;
  font-size: 27rpx;
  line-height: 35rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-count {
  display: flex;
  align-items: baseline;
  margin-top: 5rpx;
}

.preview-number {
  font-size: 44rpx;
  line-height: 48rpx;
  font-weight: 700;
}

.preview-unit {
  margin-left: 6rpx;
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 600;
}

.footer-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  gap: 22rpx;
  padding: 38rpx 38rpx calc(38rpx + env(safe-area-inset-bottom));
  background: linear-gradient(0deg, #f5f5f7 0%, rgba(245, 245, 247, 0.96) 64%, rgba(245, 245, 247, 0) 100%);
}

.save-button,
.delete-button {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 31rpx;
  box-sizing: border-box;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.save-button {
  flex: 1;
  background: #ff8c00;
  color: #ffffff;
  box-shadow: 0 18rpx 38rpx rgba(255, 140, 0, 0.24);
}

.save-button-edit {
  flex: 1.35;
}

.delete-button {
  flex: 1;
  border: 2rpx solid rgba(186, 26, 26, 0.18);
  background: rgba(255, 218, 214, 0.56);
  color: #ba1a1a;
  box-shadow: 0 10rpx 28rpx rgba(186, 26, 26, 0.06);
}

.delete-button image {
  width: 34rpx;
  height: 34rpx;
  margin-right: 10rpx;
}

.card-press,
.tap-press,
.row-press,
.save-press {
  transform: scale(0.98);
}
</style>
