<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">选择背景模板</view>
    <view class="nav-spark" :style="navActionStyle">
      <image src="/static/assets/icons/auto-awesome-primary.svg" mode="aspectFit"></image>
    </view>
  </view>

  <view class="content" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view :class="'hero-preview ' + (previewTemplate.tone ? 'hero-tone-' + previewTemplate.tone : '')">
      <image v-if="previewTemplate.image" class="hero-image" :src="previewTemplate.image" mode="aspectFill"></image>
      <view v-if="previewTemplate.image" class="hero-shade"></view>
      <view :class="'hero-copy ' + (activeCategory === 'popular' ? 'hero-copy-popular' : '')">
        <view class="hero-top">
          <text class="hero-date">今日 {{todayText}}</text>
          <text class="hero-title">{{activeCategory === 'popular' ? previewTemplate.title : previewTemplate.previewTitle}}</text>
        </view>
        <view class="hero-count" v-if="activeCategory !== 'popular' || previewTemplate.id === 'popular-sky'">
          <text class="hero-number">{{daysLeft}}</text>
          <text class="hero-unit">天</text>
        </view>
        <view class="hero-special" v-else-if="previewTemplate.id === 'popular-modern'">
          <text class="hero-special-main">01:07:34</text>
          <text class="hero-special-sub">现代主义</text>
        </view>
        <view class="hero-special hero-special-love" v-else-if="previewTemplate.id === 'popular-love'">
          <image src="/static/assets/icons/favorite.svg" mode="aspectFit"></image>
          <text class="hero-special-main">{{daysLeft}}</text>
          <text class="hero-special-sub">恋爱宣言</text>
        </view>
        <view class="hero-special hero-special-month" v-else>
          <text class="hero-special-main">15</text>
          <text class="hero-special-unit">月</text>
          <text class="hero-special-sub">倒计时月</text>
        </view>
        <text class="hero-target">目标日 / {{targetDateText}}</text>
      </view>
    </view>

    <scroll-view class="category-scroll" scroll-x enhanced :show-scrollbar="false">
      <view class="category-row">
        <view
          :class="'category-chip ' + (item.id === activeCategory ? 'category-chip-active' : '')"
         
         
          :data-id="item.id"
          @tap="handleCategory"
          hover-class="tap-press"
         v-for="(item, index) in categories" :key="item.id">{{item.label}}</view>
      </view>
    </scroll-view>

    <view class="template-grid">
      <view
        :class="'template-card ' + (selectedTemplate === item.id ? 'template-card-active' : '') + ' ' + (item.tone ? 'template-tone-' + item.tone : '')"
       
       
        :data-id="item.id"
        @tap="handleSelectTemplate"
        hover-class="tap-press"
       v-for="(item, index) in library.templates" :key="item.id">
        <image v-if="item.image" class="template-image" :src="item.image" mode="aspectFill"></image>
        <view v-if="item.image" class="template-shade"></view>
        <view v-if="item.pro" class="pro-badge">
          <image src="/static/assets/icons/star-filled.svg" mode="aspectFit"></image>
          <text>Pro</text>
        </view>
        <view class="template-center">
          <block v-if="activeCategory === 'popular'">
            <image v-if="item.tone === 'love'" class="love-icon" src="/static/assets/icons/favorite.svg" mode="aspectFit"></image>
            <text class="template-main">{{item.id === 'popular-sky' || item.id === 'popular-love' ? daysLeft : item.subtitle}}</text>
          </block>
          <block v-else>
            <text class="template-title">{{item.title}}</text>
            <text class="template-subtitle">{{item.subtitle}}</text>
          </block>
        </view>
        <view class="template-footer">
          <text>{{item.title}}</text>
          <image v-if="selectedTemplate === item.id" src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <view class="message-card">
      <image src="/static/assets/icons/edit-note.svg" mode="aspectFit"></image>
      <textarea placeholder="写一点关于这个日子的寄语吧..." placeholder-class="message-placeholder" maxlength="100"></textarea>
    </view>
  </view>

  <view class="footer">
    <button class="save-button" @tap="handleSave" hover-class="button-press">
      <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
      <text>保存模板</text>
    </button>
    <button class="share-button" @tap="handleShare" hover-class="button-press">
      <image src="/static/assets/icons/share.svg" mode="aspectFit"></image>
    </button>
  </view>
</view>
</template>

<script>
const { requestProAccess } = require("../../utils/pro-access")
const { categories, getLibrary, getTemplateBackground, getTemplateDateState } = require("../../utils/template-library")

function getPreview(library, selectedTemplate) {
  const template = library.templates.find((item) => item.id === selectedTemplate) || library.templates[0]

  return {
    ...template,
    image: template.image || "",
    previewTitle: template.title || library.previewTitle
  }
}

export default {
  data() {
    return {
    activeCategory: "popular",
    categories,
    contentTop: 88,
    daysLeft: 0,
    library: getLibrary("popular"),
    navActionStyle: "",
    navShellStyle: "",
    previewTemplate: getPreview(getLibrary("popular"), "popular-sky"),
    selectedTemplate: "popular-sky",
    targetDateText: "",
    todayText: ""
  }
  },
  onLoad() {
    this.setupNavigation()
    this.syncTargetDate()
    const stored = uni.getStorageSync("selectedBackground")
    const activeCategory = stored && stored.category ? stored.category : "popular"
    const library = getLibrary(activeCategory)
    const storedTemplateExists = !!(
      stored
      && stored.templateId
      && library.templates.some((item) => item.id === stored.templateId)
    )
    const selectedTemplate = storedTemplateExists ? stored.templateId : library.templates[0].id

    this.setData({
      activeCategory,
      library,
      previewTemplate: getPreview(library, selectedTemplate),
      selectedTemplate
    })
  },
  onShow() {
    this.syncTargetDate()
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
    syncTargetDate() {
    this.setData(getTemplateDateState())
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
      contentTop: navHeight + 24
    })
  },
    handleBack() {
    uni.navigateBack()
  },
    handleCategory(event) {
    const activeCategory = event.currentTarget.dataset.id
    if (activeCategory === this.activeCategory) {
      return
    }

    const library = getLibrary(activeCategory)
    const stored = uni.getStorageSync("selectedBackground")
    const storedTemplateExists = !!(
      stored
      && stored.category === activeCategory
      && library.templates.some((item) => item.id === stored.templateId)
    )
    const selectedTemplate = storedTemplateExists ? stored.templateId : library.templates[0].id

    this.setData({
      activeCategory,
      library,
      previewTemplate: getPreview(library, selectedTemplate),
      selectedTemplate
    })
  },
    selectTemplate(selectedTemplate) {
    this.setData({
      previewTemplate: getPreview(this.library, selectedTemplate),
      selectedTemplate
    })
  },
    requestTemplatePro(selectedTemplate, afterOpen) {
    requestProAccess({
      content: "开通 Pro 后即可使用该高级背景模板，并继续完成当前倒数日创建或编辑。",
      onSuccess: () => {
        if (selectedTemplate) {
          this.selectTemplate(selectedTemplate)
        }

        if (typeof afterOpen === "function") {
          afterOpen()
        }
      }
    })
  },
    handleSelectTemplate(event) {
    const selectedTemplate = event.currentTarget.dataset.id
    const selected = this.library.templates.find((item) => item.id === selectedTemplate)

    if (selected && selected.pro && !getApp().getVipState()) {
      this.requestTemplatePro(selectedTemplate)
      return
    }

    this.selectTemplate(selectedTemplate)
  },
    handleSave() {
    const selected = this.library.templates.find((item) => item.id === this.selectedTemplate)
    if (!selected) return

    if (selected.pro && !getApp().getVipState()) {
      this.requestTemplatePro(this.selectedTemplate, () => {
        this.handleSave()
      })
      return
    }

    uni.setStorageSync(
      "selectedBackground",
      getTemplateBackground(this.activeCategory, selected.id)
    )
    uni.navigateBack()
  },
    handleShare() {
    uni.showShareMenu({ menus: ["shareAppMessage"] })
    uni.showToast({ title: "可点击右上角分享", icon: "none" })
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

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.2);
  background: rgba(252, 248, 251, 0.86);
  -webkit-backdrop-filter: blur(24rpx);
  backdrop-filter: blur(24rpx);
}

.nav-back,
.nav-title,
.nav-spark {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 28rpx;
  width: 58rpx;
}

.nav-back image,
.nav-spark image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 50%;
  width: 260rpx;
  justify-content: center;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 600;
  transform: translateX(-50%);
}

.nav-spark {
  right: 190rpx;
  width: 58rpx;
  justify-content: center;
}

.content {
  padding: 0 38rpx calc(190rpx + env(safe-area-inset-bottom));
}

.hero-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 1rpx solid rgba(221, 193, 174, 0.2);
  border-radius: 46rpx;
  background: #e4e2e4;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.hero-tone-love {
  background: #ffd1dc;
}

.hero-tone-month {
  background: #303032;
}

.hero-image,
.hero-shade,
.hero-copy {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-shade {
  background: rgba(0, 0, 0, 0.12);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 77rpx 31rpx 50rpx;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.35);
}

.hero-top,
.hero-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-date,
.hero-target {
  font-size: 21rpx;
  line-height: 29rpx;
  letter-spacing: 0;
  opacity: 0.84;
}

.hero-special {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-special-main {
  font-size: 76rpx;
  line-height: 92rpx;
  font-weight: 700;
}

.hero-special-sub {
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 34rpx;
  font-weight: 600;
}

.hero-special-love,
.hero-tone-love .hero-copy {
  color: #ff5e78;
  text-shadow: none;
}

.hero-special-love image {
  width: 92rpx;
  height: 92rpx;
}

.hero-special-month,
.hero-tone-month .hero-copy {
  color: #ffb77d;
  text-shadow: none;
}

.hero-special-unit {
  margin-top: -14rpx;
  font-size: 29rpx;
  line-height: 40rpx;
  font-weight: 700;
}

.hero-title {
  margin-top: 4rpx;
  font-size: 46rpx;
  line-height: 62rpx;
  font-weight: 600;
}

.hero-number {
  font-size: 180rpx;
  line-height: 176rpx;
  font-weight: 700;
}

.hero-unit {
  margin-top: -8rpx;
  font-size: 38rpx;
  line-height: 50rpx;
  font-weight: 600;
}

.category-scroll {
  width: calc(100% + 76rpx);
  height: 62rpx;
  margin: 31rpx -38rpx;
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  align-items: center;
  gap: 31rpx;
  padding: 0 38rpx;
}

.category-chip {
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0 31rpx;
  border-radius: 999rpx;
  background: #f0edef;
  color: #564334;
  font-size: 25rpx;
  line-height: 34rpx;
  font-weight: 500;
}

.category-chip-active {
  background: #ff8c00;
  color: #ffffff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 31rpx;
}

.template-card {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 3rpx solid transparent;
  border-radius: 31rpx;
  background: #e4e2e4;
}

.template-card-active {
  border-color: #904d00;
  box-shadow: 0 0 0 4rpx rgba(144, 77, 0, 0.16);
}

.template-image,
.template-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.template-shade {
  background: rgba(0, 0, 0, 0.16);
}

.template-tone-love {
  background: #ffd1dc;
  color: #ff5e78;
}

.template-tone-month {
  background: #303032;
  color: #ffb77d;
}

.template-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 31rpx;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 3rpx 9rpx rgba(0, 0, 0, 0.35);
}

.template-tone-love .template-center,
.template-tone-month .template-center {
  color: inherit;
  text-shadow: none;
}

.template-main {
  font-size: 46rpx;
  line-height: 58rpx;
  font-weight: 700;
}

.template-title {
  color: #ffffff;
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 600;
}

.template-subtitle {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 21rpx;
  line-height: 29rpx;
}

.love-icon {
  width: 54rpx;
  height: 54rpx;
}

.template-footer {
  position: absolute;
  left: 15rpx;
  right: 15rpx;
  bottom: 15rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  font-size: 19rpx;
  line-height: 25rpx;
  text-shadow: 0 2rpx 7rpx rgba(0, 0, 0, 0.5);
}

.template-tone-love .template-footer {
  color: #ff5e78;
  text-shadow: none;
}

.template-footer image {
  width: 29rpx;
  height: 29rpx;
  filter: brightness(0) invert(1);
}

.pro-badge {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 3rpx 10rpx;
  border-radius: 8rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 17rpx;
  line-height: 22rpx;
  font-weight: 700;
}

.pro-badge image {
  width: 17rpx;
  height: 17rpx;
  filter: brightness(0) invert(1);
}

.message-card {
  display: flex;
  border: 1rpx solid rgba(221, 193, 174, 0.3);
  border-radius: 31rpx;
  background: #ffffff;
}

.message-card > image {
  width: 42rpx;
  height: 42rpx;
}

.message-card {
  min-height: 135rpx;
  align-items: flex-start;
  gap: 23rpx;
  margin-top: 46rpx;
  padding: 31rpx;
}

.message-card textarea {
  min-width: 0;
  height: 73rpx;
  flex: 1;
  color: #564334;
  font-size: 27rpx;
  line-height: 36rpx;
}

.message-placeholder {
  color: rgba(137, 115, 98, 0.5);
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 31rpx;
  padding: 31rpx 38rpx calc(31rpx + env(safe-area-inset-bottom));
  background: linear-gradient(0deg, #fcf8fb 0%, rgba(252, 248, 251, 0.95) 72%, rgba(252, 248, 251, 0) 100%);
}

.save-button,
.share-button {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-button {
  min-width: 0;
  flex: 1;
  gap: 15rpx;
  border-radius: 999rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 34rpx rgba(255, 140, 0, 0.2);
}

.save-button image {
  width: 35rpx;
  height: 35rpx;
}

.share-button {
  width: 108rpx;
  flex: 0 0 108rpx;
  border: 2rpx solid #904d00;
  border-radius: 50%;
}

.share-button image {
  width: 38rpx;
  height: 38rpx;
}

.tap-press,
.row-press,
.button-press {
  transform: scale(0.98);
}
</style>
