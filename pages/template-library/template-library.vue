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
    <view class="hero-preview">
      <image class="hero-image" :src="library.previewImage" mode="aspectFill"></image>
      <view class="hero-shade"></view>
      <view class="hero-copy">
        <view class="hero-top">
          <text class="hero-date">今日 {{todayText}}</text>
          <text class="hero-title">{{library.previewTitle}}</text>
        </view>
        <view class="hero-count">
          <text class="hero-number">{{daysLeft}}</text>
          <text class="hero-unit">天</text>
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
        :class="'template-card ' + (selectedTemplate === item.id ? 'template-card-active' : '')"
       
       
        :data-id="item.id"
        @tap="handleSelectTemplate"
        hover-class="tap-press"
       v-for="(item, index) in library.templates" :key="item.id">
        <image class="template-image" :src="item.image" mode="aspectFill"></image>
        <view class="template-shade"></view>
        <view v-if="item.pro" class="pro-badge">
          <image src="/static/assets/icons/star-filled.svg" mode="aspectFit"></image>
          <text>Pro</text>
        </view>
        <view class="template-center">
          <text class="template-title">{{item.title}}</text>
          <text class="template-subtitle">{{item.subtitle}}</text>
        </view>
        <view class="template-footer">
          <text>{{item.code || item.subtitle}}</text>
          <image v-if="selectedTemplate === item.id" src="/static/assets/icons/check-circle-primary.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <view class="option-row" @tap="handleChooseLocal" hover-class="row-press">
      <view class="option-left">
        <image src="/static/assets/icons/image.svg" mode="aspectFit"></image>
        <text>选择本地图片背景</text>
      </view>
      <image class="option-chevron" src="/static/assets/icons/chevron-right.svg" mode="aspectFit"></image>
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

export default {
  data() {
    return {
    activeCategory: "minimal",
    categories,
    contentTop: 88,
    daysLeft: 0,
    library: getLibrary("minimal"),
    navActionStyle: "",
    navShellStyle: "",
    selectedTemplate: "",
    targetDateText: "",
    todayText: ""
  }
  },
  onLoad(options = {}) {
    const activeCategory = options.category || "minimal"
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
      selectedTemplate
    })
    this.setupNavigation()
    this.syncTargetDate()
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
    const library = getLibrary(activeCategory)
    const stored = uni.getStorageSync("selectedBackground")
    const storedTemplateExists = !!(
      stored
      && stored.category === activeCategory
      && library.templates.some((item) => item.id === stored.templateId)
    )
    this.setData({
      activeCategory,
      library,
      selectedTemplate: storedTemplateExists ? stored.templateId : library.templates[0].id
    })
  },
    requestTemplatePro(selectedTemplate, afterOpen) {
    requestProAccess({
      content: "开通 Pro 后即可使用该高级背景模板，并继续完成当前倒数日创建或编辑。",
      onSuccess: () => {
        if (selectedTemplate) {
          this.setData({ selectedTemplate })
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

    this.setData({ selectedTemplate })
  },
    handleChooseLocal() {
    uni.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album"],
      success: ({ tempFiles }) => {
        const file = tempFiles && tempFiles[0]
        if (!file) return
        uni.setStorageSync("selectedBackground", {
          type: "local",
          image: file.tempFilePath,
          label: "本地图片"
        })
        this.returnToCreate()
      }
    })
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
    this.returnToCreate()
  },
    returnToCreate() {
    const pages = getCurrentPages()
    uni.navigateBack({ delta: pages.length >= 3 ? 2 : 1 })
  },
    handleShare() {
    uni.showShareMenu({ menus: ["shareAppMessage"] })
    uni.showToast({ title: "可点击右上角分享", icon: "none" })
  }
  }
}
</script>

<style>
@import "../template-picker/template-picker.wxss";

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
</style>
