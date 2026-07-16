<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <text class="nav-title">记录当下</text>
    <view class="nav-publish" :style="navPublishStyle" @tap="handlePublish" hover-class="tap-press">
      <text>{{isPublishing ? '发布中' : '发布'}}</text>
    </view>
  </view>

  <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <picker mode="date" :value="dateValue" @change="handleDateChange">
      <view class="date-row" hover-class="date-row-press">
        <image class="date-icon" src="/static/assets/icons/calendar-today.svg" mode="aspectFit"></image>
        <text>{{dateDisplay}} {{timeText}}</text>
        <image class="date-chevron" src="/static/assets/icons/chevron-down.svg" mode="aspectFit"></image>
      </view>
    </picker>

    <textarea
      class="moment-input"
      :value="content"
      placeholder="这一刻的想法..."
      placeholder-class="moment-placeholder"
      maxlength="1000"
      @input="handleContentInput"
    ></textarea>

    <view class="photo-grid">
      <view class="photo-card" v-for="(item, index) in photos" :key="index">
        <image
          class="photo-image"
          :src="item"
          mode="aspectFill"
          :data-src="item"
          @tap="handlePreviewPhoto"
        ></image>
        <view class="photo-remove" :data-index="index" @tap="handleRemovePhoto">
          <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
        </view>
      </view>
      <view class="photo-add" v-if="photos.length < 9" @tap="handleChooseAlbum" hover-class="tap-press">
        <image src="/static/assets/icons/add.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="location-chip" v-if="location">
      <image src="/static/assets/icons/location-on.svg" mode="aspectFit"></image>
      <text>{{location.name || location.address}}</text>
      <view class="location-remove" @tap="handleRemoveLocation">
        <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>
  </view>

  <view class="media-toolbar">
    <view class="toolbar-inner">
      <view class="toolbar-button" @tap="handleChooseAlbum" hover-class="tap-press">
        <image src="/static/assets/icons/image.svg" mode="aspectFit"></image>
      </view>
      <view class="toolbar-button" @tap="handleTakePhoto" hover-class="tap-press">
        <image src="/static/assets/icons/photo-camera.svg" mode="aspectFit"></image>
      </view>
      <view class="toolbar-button" @tap="handleVoice" hover-class="tap-press">
        <image src="/static/assets/icons/mic.svg" mode="aspectFit"></image>
      </view>
      <view class="toolbar-button" @tap="handleChooseLocation" hover-class="tap-press">
        <image src="/static/assets/icons/location-on.svg" mode="aspectFit"></image>
      </view>
    </view>
  </view>
</view>
</template>

<script>
const { addTimelineEntryAsync } = require("../../utils/event-store")
const { uploadTimelinePhoto } = require("../../utils/cloud-files")

const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]

function pad(value) {
  return String(value).padStart(2, "0")
}

function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toDisplayDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return `${year}年${month}月${day}日 ${weekdays[date.getDay()]}`
}

export default {
  data() {
    return {
    content: "",
    contentTop: 88,
    dateDisplay: "",
    dateValue: "",
    eventId: "",
    isPublishing: false,
    location: null,
    navPublishStyle: "",
    navShellStyle: "",
    photos: [],
    timeText: ""
  }
  },
  onLoad(options) {
    const now = new Date()
    this.eventId = decodeURIComponent(options.eventId || "")
    this.setupNavigation()
    this.setData({
      dateDisplay: toDisplayDate(toDateValue(now)),
      dateValue: toDateValue(now),
      eventId: this.eventId,
      timeText: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    })
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
    const system = uni.getSystemInfoSync()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const menuRight = system.windowWidth && menu.left ? system.windowWidth - menu.left : 88
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navShellStyle: `height:${navHeight}px;`,
      navPublishStyle: `top:${menuTop}px;height:${menuHeight}px;right:${menuRight + 10}px;`,
      contentTop: navHeight + 30
    })
  },
    handleBack() {
    uni.navigateBack()
  },
    handleContentInput(event) {
    this.setData({
      content: event.detail.value
    })
  },
    handleDateChange(event) {
    const dateValue = event.detail.value
    this.setData({
      dateDisplay: toDisplayDate(dateValue),
      dateValue
    })
  },
    handleChooseAlbum() {
    this.choosePhotos(["album"])
  },
    handleTakePhoto() {
    this.choosePhotos(["camera"])
  },
    choosePhotos(sourceType) {
    const remaining = 9 - this.photos.length
    if (remaining <= 0) {
      uni.showToast({
        title: "最多添加 9 张图片",
        icon: "none"
      })
      return
    }

    uni.chooseMedia({
      count: remaining,
      mediaType: ["image"],
      sourceType,
      success: ({ tempFiles }) => {
        const nextPhotos = (tempFiles || []).map((item) => item.tempFilePath)
        this.setData({
          photos: this.photos.concat(nextPhotos).slice(0, 9)
        })
      }
    })
  },
    handleRemovePhoto(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setData({
      photos: this.photos.filter((item, photoIndex) => photoIndex !== index)
    })
  },
    handlePreviewPhoto(event) {
    uni.previewImage({
      current: event.currentTarget.dataset.src,
      urls: this.photos
    })
  },
    handleVoice() {
    uni.showToast({
      title: "语音记录即将开放",
      icon: "none"
    })
  },
    handleChooseLocation() {
    uni.chooseLocation({
      success: (location) => {
        this.setData({
          location: {
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
          }
        })
      }
    })
  },
    handleRemoveLocation() {
    this.setData({ location: null })
  },
    async handlePublish() {
    const content = this.content.trim()

    if (!content && !this.photos.length) {
      uni.showToast({
        title: "写下一点此刻的想法吧",
        icon: "none"
      })
      return
    }

    if (!this.eventId || this.isPublishing) {
      return
    }

    this.setData({ isPublishing: true })
    uni.showLoading({ title: "正在发布" })

    try {
      if (this.photos.length) {
        uni.showLoading({ title: "上传图片中", mask: true })
      }

      const photos = await Promise.all(this.photos.map(async (photo, index) => {
        const result = await uploadTimelinePhoto(photo, this.eventId, index)
        return result.fileID
      }))
      uni.showLoading({ title: "正在发布", mask: true })
      const createdAt = Date.now()
      const entry = {
        id: `record-${createdAt}`,
        content,
        createdAt,
        dateText: this.dateDisplay,
        dateValue: this.dateValue,
        location: this.location,
        photos,
        timeText: this.timeText
      }
      const updatedEvent = await addTimelineEntryAsync(this.eventId, entry)

      uni.hideLoading()
      if (!updatedEvent) {
        uni.showToast({
          title: "事件不存在",
          icon: "none"
        })
        this.setData({ isPublishing: false })
        return
      }

      uni.showToast({
        title: "记录已保存",
        icon: "success"
      })
      setTimeout(() => uni.navigateBack(), 300)
    } catch (error) {
      uni.hideLoading()
      this.setData({ isPublishing: false })
      uni.showToast({
        title: "保存失败，请重试",
        icon: "none"
      })
    }
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
.date-row-press {
  opacity: 0.68;
  transform: scale(0.98);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  box-sizing: border-box;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.22);
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back {
  position: absolute;
  left: 22rpx;
  bottom: 7rpx;
  width: 66rpx;
  height: 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back image {
  width: 39rpx;
  height: 39rpx;
}

.nav-title {
  position: absolute;
  left: 50%;
  bottom: 16rpx;
  transform: translateX(-50%);
  font-size: 34rpx;
  line-height: 48rpx;
  font-weight: 600;
  white-space: nowrap;
}

.nav-publish {
  position: absolute;
  left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 90rpx;
  color: #904d00;
  font-size: 27rpx;
  line-height: 38rpx;
  font-weight: 600;
}

.content {
  min-height: 100vh;
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
}

.date-row {
  display: flex;
  align-items: center;
  min-height: 58rpx;
  color: #5d5e60;
  font-size: 23rpx;
  line-height: 33rpx;
  transition: transform 80ms ease;
}

.date-icon {
  width: 34rpx;
  height: 34rpx;
  margin-right: 13rpx;
}

.date-chevron {
  width: 28rpx;
  height: 28rpx;
  margin-left: 7rpx;
  opacity: 0.56;
}

.moment-input {
  width: 100%;
  min-height: 460rpx;
  box-sizing: border-box;
  margin-top: 28rpx;
  padding: 0;
  color: #1b1b1d;
  font-size: 34rpx;
  line-height: 54rpx;
  background: transparent;
}

.moment-placeholder {
  color: rgba(86, 67, 52, 0.5);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 20rpx;
}

.photo-card,
.photo-add {
  position: relative;
  width: 100%;
  height: 210rpx;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 23rpx;
  background: #f2eff1;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-remove {
  position: absolute;
  top: 7rpx;
  right: 7rpx;
  width: 38rpx;
  height: 38rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.38);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.photo-remove image {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) invert(1);
}

.photo-add {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx dashed rgba(154, 143, 136, 0.28);
  background: rgba(255, 255, 255, 0.46);
}

.photo-add image {
  width: 50rpx;
  height: 50rpx;
}

.location-chip {
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  box-sizing: border-box;
  margin-top: 32rpx;
  padding: 12rpx 16rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.34);
  border-radius: 999rpx;
  background: #f7f3f5;
  color: #564334;
  font-size: 21rpx;
  line-height: 30rpx;
}

.location-chip > image {
  width: 29rpx;
  height: 29rpx;
  flex: 0 0 auto;
}

.location-chip > text {
  max-width: 500rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-remove {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-remove image {
  width: 24rpx;
  height: 24rpx;
}

.media-toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid rgba(221, 193, 174, 0.2);
  background: rgba(255, 255, 255, 0.84);
  -webkit-backdrop-filter: blur(26px);
  backdrop-filter: blur(26px);
}

.toolbar-inner {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 76rpx;
}

.toolbar-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-button image {
  width: 39rpx;
  height: 39rpx;
}
</style>
