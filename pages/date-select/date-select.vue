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
              <text class="primary-value">{{selectedYear}}年{{selectedMonth}}月{{selectedDay}}日</text>
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

  <view class="overlay"></view>

  <view class="date-sheet">
    <view class="sheet-head">
      <view class="sheet-action" @tap="handleBack" hover-class="tap-press">
        <text>取消</text>
      </view>
      <text class="sheet-title">选择日期</text>
      <view class="sheet-action sheet-confirm" @tap="handleConfirm" hover-class="tap-press">
        <text>确定</text>
      </view>
    </view>

    <view class="picker-body">
      <view class="selection-band"></view>
      <picker-view class="date-picker" :value="pickerValue" indicator-style="height: 76rpx;" mask-style="background: transparent;" @change="handleDateChange">
        <picker-view-column>
          <view :class="'picker-option ' + (pickerValue[0] === index ? 'picker-selected' : '')" v-for="(item, index) in years" :key="index">
            <text>{{item}}</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view :class="'picker-option ' + (pickerValue[1] === index ? 'picker-selected' : '')" v-for="(item, index) in months" :key="index">
            <text>{{item}}月</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view :class="'picker-option ' + (pickerValue[2] === index ? 'picker-selected' : '')" v-for="(item, index) in days" :key="index">
            <text>{{item}}日</text>
          </view>
        </picker-view-column>
      </picker-view>
    </view>

    <view class="lunar-wrap">
      <text class="lunar-chip">{{lunarText}}</text>
    </view>
  </view>
</view>
</template>

<script>
const { getWindowMetrics } = require("../../utils/system-info")

const FUTURE_YEAR_COUNT = 21

function getMinDate() {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  }
}

function formatDate(year, month, day) {
  return `${year}年${month}月${day}日`
}

function getLunarText(month, day) {
  if (month === 12 && day === 25) {
    return "农历 十一月廿五"
  }

  const lunarDays = {
    24: "廿四",
    25: "廿五",
    26: "廿六"
  }

  return `农历 ${month === 1 ? "腊月" : "十一月"}${lunarDays[day] || "廿五"}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function buildYears(year) {
  const minDate = getMinDate()
  const lastYear = Math.max(minDate.year + FUTURE_YEAR_COUNT - 1, year)

  return Array.from({ length: lastYear - minDate.year + 1 }, (_, index) => minDate.year + index)
}

function buildMonths(year) {
  const minDate = getMinDate()
  const startMonth = year === minDate.year ? minDate.month : 1

  return Array.from({ length: 13 - startMonth }, (_, index) => startMonth + index)
}

function buildDays(year, month) {
  const minDate = getMinDate()
  const startDay = year === minDate.year && month === minDate.month ? minDate.day : 1
  const endDay = getDaysInMonth(year, month)

  return Array.from({ length: endDay - startDay + 1 }, (_, index) => startDay + index)
}

function getIndex(values, value) {
  const index = values.indexOf(value)
  return index >= 0 ? index : 0
}

function clampDate(year, month, day) {
  const minDate = getMinDate()
  const safeYear = Math.max(year, minDate.year)
  const months = buildMonths(safeYear)
  const safeMonth = months.includes(month) ? month : months[0]
  const days = buildDays(safeYear, safeMonth)
  const safeDay = Math.min(Math.max(day, days[0]), days[days.length - 1])

  return {
    day: safeDay,
    month: safeMonth,
    year: safeYear
  }
}

function buildPickerState(year, month, day, lunarText) {
  const safeDate = clampDate(year, month, day)
  const years = buildYears(safeDate.year)
  const months = buildMonths(safeDate.year)
  const days = buildDays(safeDate.year, safeDate.month)
  const keepsLunarText = safeDate.year === year && safeDate.month === month && safeDate.day === day

  return {
    days,
    lunarText: keepsLunarText && lunarText ? lunarText : getLunarText(safeDate.month, safeDate.day),
    months,
    pickerValue: [getIndex(years, safeDate.year), getIndex(months, safeDate.month), getIndex(days, safeDate.day)],
    selectedDay: safeDate.day,
    selectedMonth: safeDate.month,
    selectedYear: safeDate.year,
    years
  }
}

const minDate = getMinDate()
const initialPickerState = buildPickerState(minDate.year, minDate.month, minDate.day)

export default {
  data() {
    return {
    contentTop: 88,
    days: initialPickerState.days,
    lunarText: initialPickerState.lunarText,
    months: initialPickerState.months,
    navActionStyle: "",
    navShellStyle: "",
    pickerValue: initialPickerState.pickerValue,
    selectedDay: initialPickerState.selectedDay,
    selectedMonth: initialPickerState.selectedMonth,
    selectedYear: initialPickerState.selectedYear,
    years: initialPickerState.years
  }
  },
  onLoad() {
    this.loadSelectedDate()
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
    loadSelectedDate() {
    const stored = uni.getStorageSync("selectedTargetDate")

    if (!stored) {
      return
    }

    this.updatePicker(stored.year || minDate.year, stored.month || minDate.month, stored.day || minDate.day, stored.lunar)
  },
    updatePicker(year, month, day, lunarText) {
    this.setData(buildPickerState(year, month, day, lunarText))
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
    handleDateChange(event) {
    const [yearIndex, monthIndex, dayIndex] = event.detail.value
    const selectedYear = this.years[yearIndex] || this.selectedYear
    const selectedMonth = this.months[monthIndex] || this.selectedMonth
    const days = buildDays(selectedYear, selectedMonth)
    const selectedDay = days[Math.min(dayIndex, days.length - 1)] || days[0]

    this.updatePicker(selectedYear, selectedMonth, selectedDay)
  },
    handleConfirm() {
    const selectedYear = Number(this.selectedYear)
    const selectedMonth = Number(this.selectedMonth)
    const selectedDay = Number(this.selectedDay)
    if (!selectedYear || !selectedMonth || !selectedDay) {
      uni.showToast({ title: "请选择有效日期", icon: "none" })
      return
    }
    const selectedTargetDate = {
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      text: formatDate(selectedYear, selectedMonth, selectedDay),
      lunar: getLunarText(selectedMonth, selectedDay)
    }

    uni.setStorageSync("selectedTargetDate", selectedTargetDate)
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

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.38);
  -webkit-backdrop-filter: blur(10rpx);
  backdrop-filter: blur(10rpx);
}

.date-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  overflow: hidden;
  border-radius: 46rpx 46rpx 0 0;
  background: #ffffff;
  box-shadow: 0 -20rpx 64rpx rgba(0, 0, 0, 0.18);
}

.sheet-head {
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 46rpx;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.08);
}

.sheet-action {
  min-width: 80rpx;
  color: #5d5e60;
  font-size: 28rpx;
  line-height: 42rpx;
  font-weight: 500;
}

.sheet-confirm {
  color: #904d00;
  text-align: right;
  font-weight: 700;
}

.sheet-title {
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 46rpx;
  font-weight: 700;
}

.picker-body {
  position: relative;
  height: 420rpx;
  overflow: hidden;
  padding: 0 46rpx;
}

.selection-band {
  position: absolute;
  left: 46rpx;
  right: 46rpx;
  top: 50%;
  height: 76rpx;
  border-top: 1rpx solid rgba(221, 193, 174, 0.16);
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.16);
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
}

.date-picker {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 420rpx;
}

.picker-option {
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(93, 94, 96, 0.34);
  font-size: 28rpx;
  line-height: 76rpx;
  font-weight: 500;
}

.picker-selected {
  color: #1b1b1d;
  font-size: 34rpx;
  font-weight: 700;
}

.lunar-wrap {
  display: flex;
  justify-content: center;
  padding: 34rpx 46rpx calc(90rpx + env(safe-area-inset-bottom));
}

.lunar-chip {
  padding: 14rpx 30rpx;
  border-radius: 999rpx;
  background: rgba(144, 77, 0, 0.05);
  color: #904d00;
  font-size: 25rpx;
  line-height: 34rpx;
  font-weight: 500;
}

.tap-press {
  transform: scale(0.98);
}
</style>
