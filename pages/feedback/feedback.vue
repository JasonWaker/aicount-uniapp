<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>意见反馈</text></view>
    <view class="nav-draft" :style="navActionStyle" @tap="handleDraft" hover-class="tap-press">草稿</view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="field-block">
      <text class="field-label">问题描述</text>
      <view class="glass-card textarea-card">
        <textarea
          :value="content"
          maxlength="500"
          placeholder="请详细描述您遇到的问题或建议..."
          placeholder-class="input-placeholder"
          @input="handleContentInput"
        ></textarea>
      </view>
    </view>

    <view class="upload-grid">
      <view class="upload-preview" v-for="(item, index) in screenshots" :key="item">
        <image class="preview-image" :src="item" mode="aspectFill" :data-current="item" @tap="handlePreviewImage"></image>
        <view class="preview-remove" :data-index="index" @tap.stop="handleRemoveImage">
          <image src="/static/assets/icons/close.svg" mode="aspectFit"></image>
        </view>
      </view>
      <view class="upload-tile" @tap="handleUpload" hover-class="tap-press">
        <image src="/static/assets/icons/image.svg" mode="aspectFit"></image>
        <text>{{screenshots.length ? screenshots.length + '/3' : '上传截图'}}</text>
      </view>
    </view>

    <view class="field-block contact-block">
      <text class="field-label">联系方式</text>
      <view class="glass-card contact-card">
        <image src="/static/assets/icons/contact-support.svg" mode="aspectFit"></image>
        <input
          :value="contact"
          placeholder="手机号或邮箱（选填）"
          placeholder-class="input-placeholder"
          @input="handleContactInput"
        />
      </view>
    </view>

    <text class="quote">“您的每一份反馈，都在帮助我们雕琢时间的艺术。”</text>
    <button class="submit-button" :disabled="isSubmitting" @tap="handleSubmit" hover-class="button-press">
      <text>提交反馈</text>
      <image src="/static/assets/icons/arrow-forward-white.svg" mode="aspectFit"></image>
    </button>
  </scroll-view>
</view>
</template>

<script>
const cloudApi = require("../../services/cloud-api")
const { getWindowMetrics } = require("../../utils/system-info")

export default {
  data() {
    return {
    contact: "",
    content: "",
    contentTop: 96,
    isSubmitting: false,
    navActionStyle: "",
    navShellStyle: "",
    screenshots: []
  }
  },
  onLoad() {
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
      contentTop: navHeight + 46
    })
  },
    handleContentInput(event) {
    this.setData({ content: event.detail.value })
  },
    handleContactInput(event) {
    this.setData({ contact: event.detail.value })
  },
    handleDraft() {
    uni.showToast({ title: "草稿已保存", icon: "success" })
  },
    handleUpload() {
    const remaining = 3 - this.screenshots.length
    if (remaining <= 0) {
      uni.showToast({ title: "最多上传3张截图", icon: "none" })
      return
    }

    uni.chooseImage({
      count: remaining,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (result) => {
        const selected = Array.isArray(result.tempFilePaths) ? result.tempFilePaths : []
        this.setData({ screenshots: this.screenshots.concat(selected).slice(0, 3) })
        uni.showToast({ title: "截图已添加", icon: "success" })
      }
    })
  },
    handlePreviewImage(event) {
    const current = event.currentTarget.dataset.current
    uni.previewImage({
      current,
      urls: this.screenshots
    })
  },
    handleRemoveImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setData({
      screenshots: this.screenshots.filter((item, itemIndex) => itemIndex !== index)
    })
  },
    getImageExtension(filePath) {
    const matched = String(filePath || "").match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
    const extension = matched ? matched[1].toLowerCase() : "jpg"
    return ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg"
  },
    async uploadFeedbackAttachments() {
    const uploadToken = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    const tasks = this.screenshots.map(async (filePath, index) => {
      const extension = this.getImageExtension(filePath)
      const result = await uniCloud.uploadFile({
        filePath,
        cloudPath: `feedback/${uploadToken}/screenshot-${index + 1}.${extension}`
      })
      const fileId = result && (result.fileID || result.fileId)
      if (!fileId) {
        throw new Error("FEEDBACK_ATTACHMENT_UPLOAD_FAILED")
      }
      return fileId
    })

    return Promise.all(tasks)
  },
    async handleSubmit() {
    if (!this.content.trim()) {
      uni.showToast({ title: "请详细描述问题或建议", icon: "none" })
      return
    }

    if (this.isSubmitting) {
      return
    }

    this.setData({ isSubmitting: true })
    uni.showLoading({ title: this.screenshots.length ? "上传附件中" : "提交中", mask: true })
    try {
      const attachments = this.screenshots.length
        ? await this.uploadFeedbackAttachments()
        : []
      uni.showLoading({ title: "提交中", mask: true })
      await cloudApi.feedback().submit({
        content: this.content,
        contact: this.contact,
        type: "general",
        attachments
      })
      uni.hideLoading()
      uni.showToast({ title: "提交成功", icon: "success" })
      this.setData({ contact: "", content: "", isSubmitting: false, screenshots: [] })
      setTimeout(() => {
        this.handleBack()
      }, 500)
    } catch (error) {
      console.error("submit feedback failed", error)
      uni.hideLoading()
      this.setData({ isSubmitting: false })
      uni.showToast({
        title: this.screenshots.length ? "附件上传或提交失败，请重试" : "提交失败，请重试",
        icon: "none"
      })
    }
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/mine/mine" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #fcf8fb 0%, #f8f2f4 100%);
  color: #1b1b1d;
}

.nav-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.45);
  background: rgba(252, 248, 251, 0.65);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title,
.nav-draft {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 31rpx;
  width: 78rpx;
}

.nav-back image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 128rpx;
  right: 128rpx;
  justify-content: center;
  color: #904d00;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.nav-draft {
  right: 31rpx;
  justify-content: flex-end;
  color: rgba(86, 67, 52, 0.72);
  font-size: 27rpx;
  line-height: 38rpx;
  font-weight: 700;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 31rpx;
  padding-right: 31rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.field-label {
  padding-left: 4rpx;
  color: #897362;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 800;
  letter-spacing: 3rpx;
}

.glass-card {
  border: 1rpx solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  box-shadow: 0 12rpx 34rpx rgba(27, 27, 29, 0.035);
}

.textarea-card {
  overflow: hidden;
  border-radius: 24rpx;
}

.textarea-card textarea {
  width: 100%;
  min-height: 346rpx;
  box-sizing: border-box;
  padding: 38rpx;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 44rpx;
}

.input-placeholder {
  color: rgba(137, 115, 98, 0.48);
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin: 28rpx 0 42rpx;
}

.upload-preview,
.upload-tile {
  position: relative;
  width: 156rpx;
  height: 156rpx;
  overflow: hidden;
  border-radius: 24rpx;
}

.upload-preview {
  background: rgba(255, 255, 255, 0.65);
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4rpx 14rpx rgba(27, 27, 29, 0.14);
}

.preview-remove image {
  width: 25rpx;
  height: 25rpx;
}

.upload-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed rgba(221, 193, 174, 0.46);
  background: rgba(255, 255, 255, 0.5);
}

.upload-tile image {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 10rpx;
  opacity: 0.62;
}

.upload-tile text {
  color: rgba(86, 67, 52, 0.52);
  font-size: 20rpx;
  line-height: 28rpx;
}

.contact-block {
  margin-top: 0;
}

.contact-card {
  height: 104rpx;
  display: flex;
  align-items: center;
  padding: 0 38rpx;
  border-radius: 999rpx;
}

.contact-card image {
  width: 38rpx;
  height: 38rpx;
  margin-right: 18rpx;
  opacity: 0.62;
}

.contact-card input {
  flex: 1;
  height: 104rpx;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
}

.quote {
  display: block;
  margin: 28rpx 0 52rpx;
  color: rgba(137, 115, 98, 0.62);
  font-size: 25rpx;
  line-height: 36rpx;
  font-style: italic;
  font-weight: 600;
}

.submit-button {
  width: 100%;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 800;
  box-shadow: 0 28rpx 58rpx rgba(255, 140, 0, 0.2);
}

.submit-button image {
  width: 34rpx;
  height: 34rpx;
  margin-left: 12rpx;
}

.submit-button::after {
  border: 0;
}

.submit-button[disabled] {
  opacity: 0.68;
}

.tap-press,
.button-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>

