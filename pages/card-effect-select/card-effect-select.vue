<template>
<view class="page">
  <view class="mock-page">
    <view class="mock-nav">
      <image class="mock-back" src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
      <text class="mock-title">新建时刻</text>
    </view>
    <view class="mock-content">
      <view class="mock-ai-card">
        <view class="mock-ai-icon">
          <image src="/static/assets/icons/auto-awesome-orange.svg" mode="aspectFit"></image>
        </view>
        <view class="mock-ai-copy">
          <text class="mock-ai-title">AI 智能创建</text>
          <text class="mock-ai-subtitle">描述您的时刻，让 AI 为您打理一切</text>
        </view>
      </view>
      <text class="mock-step">第 1 步：基本信息</text>
      <view class="mock-form-card">
        <view class="mock-form-row">
          <text>事件名称</text>
          <text class="mock-placeholder">例如：我的生日</text>
        </view>
        <view class="mock-category-block">
          <text>分类选择</text>
          <view class="mock-categories">
            <view class="mock-category mock-category-active">
              <image src="/static/assets/icons/favorite-white.svg" mode="aspectFit"></image>
              <text>生活</text>
            </view>
            <view class="mock-category">
              <image src="/static/assets/icons/flight.svg" mode="aspectFit"></image>
              <text>旅行</text>
            </view>
            <view class="mock-category">
              <image src="/static/assets/icons/work.svg" mode="aspectFit"></image>
              <text>工作</text>
            </view>
            <view class="mock-category">
              <image src="/static/assets/icons/more-horiz.svg" mode="aspectFit"></image>
              <text>其他</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view class="overlay" @tap="handleBack" @touchmove.stop.prevent="noop"></view>

  <view class="effect-sheet" @tap.stop="noop">
    <view class="sheet-handle"></view>
    <view class="sheet-head">
      <text class="sheet-title">卡片特效与背景</text>
      <view class="close-button" @tap="handleBack" hover-class="tap-press">
        <image class="close-icon" src="/static/assets/icons/close.svg" mode="aspectFit"></image>
      </view>
    </view>

    <view class="effect-grid">
      <view
        :class="'effect-option ' + (selectedEffect === item.id ? 'effect-option-active' : '')"
       
       
        :data-id="item.id"
        @tap="handleSelectEffect"
        hover-class="option-press"
       v-for="(item, index) in effectOptions" :key="item.id">
        <view :class="'effect-preview effect-' + (item.id)">
          <view v-if="item.id === 'star-breath'" class="star star-one"></view>
          <view v-if="item.id === 'star-breath'" class="star star-two"></view>
          <view v-if="item.id === 'star-breath'" class="star star-three"></view>
          <view v-if="item.id === 'minimal-frosted'" class="frosted-glass"></view>
          <view v-if="selectedEffect === item.id" class="check-badge">
            <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
          </view>
        </view>
        <view class="effect-label-row">
          <text class="effect-label">{{item.label}}</text>
          <text class="effect-pro" v-if="item.pro">PRO</text>
        </view>
      </view>
    </view>

    <view class="sheet-footer">
      <button class="confirm-button" @tap="handleConfirm" hover-class="button-press">确定</button>
    </view>
  </view>
</view>
</template>

<script>
const effectOptions = [
  { id: "dynamic-gradient", label: "动态渐变" },
  { id: "flowing-color", label: "流光溢彩", pro: true },
  { id: "star-breath", label: "星空呼吸", pro: true },
  { id: "minimal-frosted", label: "极简磨砂", pro: true }
]

export default {
  data() {
    return {
    effectOptions,
    selectedEffect: "dynamic-gradient"
  }
  },
  onLoad() {
    const stored = uni.getStorageSync("selectedCardEffect")

    if (stored && effectOptions.some((item) => item.id === stored.id)) {
      this.setData({
        selectedEffect: stored.id
      })
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
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/create/create" })
  },
    handleSelectEffect(event) {
    const selected = effectOptions.find((item) => item.id === event.currentTarget.dataset.id)
    if (selected && selected.pro && !getApp().getVipState()) {
      uni.showModal({
        title: "Pro 专属特效",
        content: "开通 Pro 后即可使用该卡片特效。",
        showCancel: false
      })
      return
    }

    this.setData({
      selectedEffect: event.currentTarget.dataset.id
    })
  },
    handleConfirm() {
    const selected = effectOptions.find((item) => item.id === this.selectedEffect) || effectOptions[0]
    if (selected.pro && !getApp().getVipState()) {
      uni.showToast({ title: "请先开通 Pro", icon: "none" })
      return
    }
    uni.setStorageSync("selectedCardEffect", selected)
    this.handleBack()
  },
    noop() {}
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: #1b1b1d;
  color: #1b1b1d;
}

.mock-page {
  min-height: 100vh;
  background: #f5f5f7;
  filter: blur(6rpx);
  opacity: 0.5;
}

.mock-nav {
  position: relative;
  height: 112rpx;
  padding-top: 48rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.3);
  background: rgba(252, 248, 251, 0.9);
}

.mock-back {
  width: 46rpx;
  height: 46rpx;
  margin-left: 38rpx;
}

.mock-title {
  position: absolute;
  left: 50%;
  bottom: 25rpx;
  font-size: 38rpx;
  line-height: 50rpx;
  font-weight: 600;
  transform: translateX(-50%);
}

.mock-content {
  padding: 46rpx 38rpx;
}

.mock-ai-card {
  min-height: 169rpx;
  display: flex;
  align-items: center;
  padding: 38rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 31rpx;
  background: #ffffff;
}

.mock-ai-icon {
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 140, 0, 0.1);
}

.mock-ai-icon image {
  width: 54rpx;
  height: 54rpx;
}

.mock-ai-copy {
  display: flex;
  flex-direction: column;
  margin-left: 31rpx;
}

.mock-ai-title {
  font-size: 33rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.mock-ai-subtitle,
.mock-placeholder {
  margin-top: 8rpx;
  color: rgba(93, 94, 96, 0.7);
  font-size: 25rpx;
  line-height: 30rpx;
}

.mock-step {
  display: block;
  margin: 46rpx 31rpx 15rpx;
  color: #5d5e60;
  font-size: 25rpx;
}

.mock-form-card {
  overflow: hidden;
  border-radius: 23rpx;
  background: #ffffff;
}

.mock-form-row {
  min-height: 89rpx;
  display: flex;
  align-items: center;
  padding: 23rpx 31rpx;
  border-bottom: 1rpx solid #e5e5e7;
  font-size: 29rpx;
}

.mock-placeholder {
  margin: 0 0 0 70rpx;
}

.mock-category-block {
  padding: 31rpx;
  font-size: 29rpx;
}

.mock-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 23rpx;
  margin-top: 31rpx;
}

.mock-category {
  min-height: 127rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 23rpx;
  background: #f6f3f5;
  color: #5d5e60;
  font-size: 20rpx;
}

.mock-category image {
  width: 46rpx;
  height: 46rpx;
  margin-bottom: 8rpx;
}

.mock-category-active {
  background: #ff8c00;
  color: #ffffff;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  -webkit-backdrop-filter: blur(4rpx);
  backdrop-filter: blur(4rpx);
}

.effect-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  min-height: 906rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 62rpx 62rpx 0 0;
  background: #ffffff;
  box-shadow: 0 -24rpx 70rpx rgba(0, 0, 0, 0.24);
}

.sheet-handle {
  width: 92rpx;
  height: 12rpx;
  margin: 23rpx auto 15rpx;
  border-radius: 999rpx;
  background: #e4e2e4;
}

.sheet-head {
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 46rpx 15rpx;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.1);
}

.sheet-title {
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
}

.effect-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 31rpx;
  padding: 46rpx;
}

.effect-option {
  min-width: 0;
}

.effect-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  box-sizing: border-box;
  margin-bottom: 15rpx;
  border: 3rpx solid transparent;
  border-radius: 31rpx;
}

.effect-option-active .effect-preview {
  border-color: #904d00;
  box-shadow: 0 8rpx 20rpx rgba(144, 77, 0, 0.16);
}

.effect-dynamic-gradient {
  background: linear-gradient(-45deg, #ff8c00, #ffb77d, #ffecd2, #fc6076);
  background-size: 300% 300%;
  animation: gradient-flow 8s ease infinite;
}

.effect-flowing-color {
  background: linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fb923c 100%);
}

.effect-star-breath {
  background: #0a0e1a;
}

.effect-minimal-frosted {
  border-color: rgba(221, 193, 174, 0.2);
  background: #e4e2e4;
}

.frosted-glass {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(18rpx);
  backdrop-filter: blur(18rpx);
}

.star {
  position: absolute;
  width: 5rpx;
  height: 5rpx;
  border-radius: 50%;
  background: #ffffff;
  animation: star-pulse 1.6s ease-in-out infinite;
}

.star-one {
  top: 25%;
  left: 25%;
}

.star-two {
  top: 50%;
  left: 66%;
  animation-delay: 120ms;
}

.star-three {
  top: 74%;
  left: 34%;
  animation-delay: 240ms;
}

.check-badge {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  width: 46rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #904d00;
}

.check-badge image {
  width: 29rpx;
  height: 29rpx;
}

.effect-label {
  display: block;
  color: #1b1b1d;
  font-size: 29rpx;
  line-height: 42rpx;
  text-align: center;
}

.effect-label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.effect-pro {
  padding: 2rpx 8rpx;
  border-radius: 7rpx;
  background: #ffb000;
  color: #ffffff;
  font-size: 15rpx;
  line-height: 22rpx;
  font-weight: 700;
}

.effect-option-active .effect-label {
  color: #904d00;
  font-weight: 600;
}

.sheet-footer {
  margin-top: auto;
  padding: 15rpx 46rpx calc(38rpx + env(safe-area-inset-bottom));
}

.confirm-button {
  width: 100%;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 31rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 34rpx rgba(255, 140, 0, 0.2);
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes star-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.tap-press,
.option-press,
.button-press {
  transform: scale(0.98);
}
</style>
