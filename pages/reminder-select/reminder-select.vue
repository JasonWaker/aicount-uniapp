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
                <image class="category-icon" src="/static/assets/icons/favorite.svg" mode="aspectFit"></image>
                <text>生活</text>
              </view>
              <view class="category-item">
                <image class="category-icon" src="/static/assets/icons/explore.svg" mode="aspectFit"></image>
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

      <view class="section">
        <text class="section-label">第 3 步：偏好设置</text>
        <view class="list-card">
          <view class="form-row row-between">
            <text class="row-label">置顶此事件</text>
            <view class="mock-switch">
              <view class="switch-thumb"></view>
            </view>
          </view>
          <view class="form-row row-between">
            <text class="row-label">定期提醒</text>
            <view class="row-value muted-value">
              <text>无</text>
              <image class="small-icon" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="overlay"></view>

  <view class="reminder-sheet">
    <view class="sheet-handle"></view>
    <view class="sheet-head">
      <text class="sheet-title">定期提醒</text>
      <view class="close-button" @tap="handleBack" hover-class="tap-press">
        <image class="close-icon" src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="option-list">
      <view :class="'option-row ' + (selectedReminder === item.id ? 'option-active' : '')" :data-id="item.id" @tap="handleSelect" hover-class="row-press" v-for="(item, index) in reminderOptions" :key="item.id">
        <text class="option-label">{{item.label}}</text>
        <image v-if="selectedReminder === item.id" class="option-icon" src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
        <image v-else class="option-icon" src="/static/assets/icons/radio-button-unchecked.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="sheet-footer">
      <button class="confirm-button" @tap="handleConfirm" hover-class="button-press">确定</button>
    </view>
  </view>
</view>
</template>

<script>
const reminderOptions = [
  { id: "none", label: "不提醒", displayLabel: "无" },
  { id: "daily", label: "每天提醒", displayLabel: "每天提醒" },
  { id: "weekly", label: "每周提醒", displayLabel: "每周提醒" },
  { id: "monthly", label: "每月提醒", displayLabel: "每月提醒" }
]

export default {
  data() {
    return {
    contentTop: 88,
    navActionStyle: "",
    navShellStyle: "",
    reminderOptions,
    selectedReminder: "none"
  }
  },
  onLoad() {
    this.loadReminder()
    this.setupNavigation()
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
    loadReminder() {
    const selected = uni.getStorageSync("selectedReminder") || {}

    this.setData({
      selectedReminder: selected.id || "none"
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
    this.setData({
      selectedReminder: event.currentTarget.dataset.id
    })
  },
    handleConfirm() {
    const selected = reminderOptions.find((item) => item.id === this.selectedReminder) || reminderOptions[0]
    uni.setStorageSync("selectedReminder", selected)
    this.handleBack()
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

.category-active .category-icon {
  filter: brightness(0) invert(1);
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

.muted-value {
  color: rgba(93, 94, 96, 0.6);
  font-size: 29rpx;
  line-height: 42rpx;
}

.mock-switch {
  position: relative;
  width: 98rpx;
  height: 60rpx;
  border-radius: 999rpx;
  background: #e9e9ea;
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
}

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  -webkit-backdrop-filter: blur(8rpx);
  backdrop-filter: blur(8rpx);
}

.reminder-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  overflow: hidden;
  border-radius: 61rpx 61rpx 0 0;
  background: #ffffff;
  box-shadow: 0 -24rpx 70rpx rgba(0, 0, 0, 0.22);
}

.sheet-handle {
  width: 92rpx;
  height: 12rpx;
  margin: 23rpx auto 15rpx;
  border-radius: 999rpx;
  background: #e4e2e4;
}

.sheet-head {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 46rpx;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.1);
}

.sheet-title {
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 700;
}

.close-button {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f6f3f5;
}

.close-icon {
  width: 38rpx;
  height: 38rpx;
  opacity: 0.82;
}

.option-list {
  padding: 31rpx 31rpx 12rpx;
}

.option-row {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  margin-bottom: 8rpx;
  padding: 0 31rpx;
  border: 1rpx solid transparent;
  border-radius: 31rpx;
}

.option-row:last-child {
  margin-bottom: 0;
}

.option-active {
  border-color: rgba(144, 77, 0, 0.2);
  background: rgba(144, 77, 0, 0.05);
}

.option-label {
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.option-active .option-label {
  color: #904d00;
  font-weight: 600;
}

.option-icon {
  width: 46rpx;
  height: 46rpx;
}

.sheet-footer {
  padding: 4rpx 46rpx calc(77rpx + env(safe-area-inset-bottom));
}

.confirm-button {
  box-sizing: border-box;
  width: 100%;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  border-radius: 31rpx;
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
