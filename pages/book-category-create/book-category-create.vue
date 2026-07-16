<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle">
      <text>{{pageTitle}}</text>
    </view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="section-card basic-card">
        <text class="field-label">分类名称</text>
        <input
          class="name-input"
          :value="categoryName"
          placeholder="例如：生日、纪念日"
          placeholder-class="placeholder"
          @input="handleNameInput"
        />
        <view class="desc-block">
          <text class="field-label">描述</text>
          <textarea
            class="desc-input"
            :value="categoryDesc"
            maxlength="40"
            placeholder="写一句关于这个倒数本的说明"
            placeholder-class="placeholder"
            @input="handleDescInput"
          ></textarea>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text class="section-title">图标</text>
        <text class="section-link" @tap="handleOpenIconSheet">查看全部</text>
      </view>
      <view class="section-card icon-card">
        <view class="quick-icon-grid">
          <view
            :class="'quick-icon ' + (selectedIconId === item.id ? 'quick-icon-active' : '')"
           
           
            :data-id="item.id"
            @tap="handleSelectIcon"
            hover-class="tap-press"
           v-for="(item, index) in quickIcons" :key="item.id">
            <image :src="selectedIconId === item.id ? (item.activeIcon || item.icon) : item.icon" mode="aspectFit"></image>
            <view v-if="selectedIconId === item.id" class="quick-icon-selected-mark">
              <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">封面颜色</text>
      <view class="section-card color-card">
        <view class="color-row">
          <view
            :class="'color-item ' + (selectedColor === item.id ? 'color-active' : '') + ' ' + (item.id === 'none' ? 'color-none' : '')"
           
           
            :data-id="item.id"
            @tap="handleSelectColor"
            :style="item.color ? 'background: ' + item.color + ';' : ''"
            hover-class="tap-press"
           v-for="(item, index) in colorOptions" :key="item.id">
            <image v-if="item.icon" :src="item.icon" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text class="section-title">背景图 <text class="inline-pro">PRO</text></text>
      </view>
      <view class="background-grid">
        <view
          :class="'background-card ' + (selectedBackground === item.id ? 'background-active' : '')"
         
         
          :data-id="item.id"
          @tap="handleSelectBackground"
          hover-class="tap-press"
         v-for="(item, index) in backgroundOptions" :key="item.id">
          <image :src="item.image" mode="aspectFill"></image>
          <text class="pro-badge">PRO</text>
          <view v-if="selectedBackground === item.id" class="selected-overlay">
            <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </scroll-view>

  <view class="bottom-action">
    <view v-if="isEdit" class="delete-button" @tap="handleDelete" hover-class="tap-press">
      <image src="/static/assets/icons/delete.svg" mode="aspectFit"></image>
      <text>{{isDefaultBook ? '恢复默认' : '删除'}}</text>
    </view>
    <view :class="'save-button ' + (isEdit ? 'save-button-edit' : '')" @tap="handleSave" hover-class="tap-press">
      <text>{{isEdit ? '保存修改' : '保存分类'}}</text>
    </view>
  </view>

  <view v-if="showIconSheet" class="sheet-mask" @tap="handleCloseIconSheet">
    <view class="icon-sheet" @tap.stop="noop">
      <view class="sheet-head">
        <text>选择图标</text>
        <image src="/static/assets/icons/close.svg" mode="aspectFit" @tap="handleCloseIconSheet"></image>
      </view>
      <scroll-view class="icon-scroll" scroll-y enhanced :show-scrollbar="false">
        <view class="icon-grid">
          <view
            :class="'icon-option ' + (selectedIconId === item.id ? 'icon-option-active' : '')"
           
           
            :data-id="item.id"
            @tap="handleSelectIcon"
           v-for="(item, index) in iconOptions" :key="item.id">
            <image :src="item.icon" mode="aspectFit"></image>
            <text>{{item.label}}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>

  <view v-if="showProModal" class="pro-mask" @tap="handleClosePro">
    <view class="pro-sheet" @tap.stop="handleModalTap">
      <view class="pro-head">
        <text>升级 Pro</text>
        <image src="/static/assets/icons/close.svg" mode="aspectFit" @tap="handleClosePro"></image>
      </view>
      <view class="pro-mark">
        <image src="/static/assets/icons/workspace-premium.svg" mode="aspectFit"></image>
      </view>
      <text class="pro-title">解锁付费背景模板</text>
      <text class="pro-desc">开通后即可使用全部 PRO 封面背景，并在倒数本详情页展示专属视觉。</text>
      <view class="pro-benefits">
        <view>
          <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
          <text>高级背景模板</text>
        </view>
        <view>
          <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
          <text>倒数本详情背景</text>
        </view>
        <view>
          <image src="/static/assets/icons/check-white.svg" mode="aspectFit"></image>
          <text>Pro 功能持续解锁</text>
        </view>
      </view>
      <view class="pro-button" @tap="handlePurchasePro" hover-class="tap-press">
        <text>{{isPaying ? '正在开通' : '立即开启 Pro'}}</text>
      </view>
    </view>
  </view>
</view>
</template>

<script>
const { getEventIcons } = require("../../utils/event-icons")
const {
  deleteCustomCountdownBook,
  getCountdownBookById,
  getCustomCountdownBookById,
  isDefaultCountdownBook,
  saveCustomCountdownBookAsync
} = require("../../utils/countdown-books")
const { getWindowMetrics } = require("../../utils/system-info")

const quickIconIds = ["cake", "favorite", "flight", "work", "school"]

function buildQuickIcons(iconOptions, selectedIcon) {
  const defaultIcons = quickIconIds
    .map((id) => iconOptions.find((item) => item.id === id))
    .filter(Boolean)
  const orderedIcons = selectedIcon
    ? [selectedIcon].concat(defaultIcons.filter((item) => item.id !== selectedIcon.id))
    : defaultIcons

  return orderedIcons.slice(0, 5)
}

const proPlan = {
  id: "category-background-pro",
  title: "Pro 背景模板",
  amount: 900,
  price: "¥9"
}

const colorOptions = [
  { id: "none", label: "no color", color: "", icon: "/static/assets/icons/block.svg" },
  { id: "orange", label: "orange", color: "#ff8c00", tone: "warm" },
  { id: "brown", label: "brown", color: "#904d00", tone: "warm" },
  { id: "rose", label: "rose", color: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)", tone: "red" },
  { id: "sky", label: "sky", color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", tone: "blue" },
  { id: "mint", label: "mint", color: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", tone: "green" },
  { id: "purple", label: "purple", color: "#a855f7", tone: "purple" }
]

const backgroundOptions = [
  { id: "clay", image: "/static/assets/templates/category-bg-1.jpg" },
  { id: "glass", image: "/static/assets/templates/category-bg-2.jpg" },
  { id: "silk", image: "/static/assets/templates/category-bg-3.jpg" },
  { id: "night", image: "/static/assets/templates/category-bg-4.jpg" },
  { id: "mountain", image: "/static/assets/templates/category-bg-5.jpg" },
  { id: "geo", image: "/static/assets/templates/category-bg-6.jpg" },
  { id: "botanical", image: "/static/assets/templates/category-bg-7.jpg" },
  { id: "concrete", image: "/static/assets/templates/category-bg-8.jpg" }
]

function findColor(id) {
  return colorOptions.find((item) => item.id === id) || colorOptions[1]
}

function getColorId(coverColor) {
  const matched = colorOptions.find((item) => item.color === coverColor)
  return matched ? matched.id : "orange"
}

function getBackgroundId(coverImage) {
  const matched = backgroundOptions.find((item) => item.image === coverImage)
  return matched ? matched.id : ""
}

export default {
  data() {
    return {
    backgroundOptions,
    bookId: "",
    categoryDesc: "",
    categoryName: "",
    canDelete: false,
    colorOptions,
    contentTop: 88,
    iconOptions: [],
    navActionStyle: "",
    navShellStyle: "",
    quickIcons: [],
    isPaying: false,
    isDefaultBook: false,
    isEdit: false,
    isVip: false,
    pendingBackground: "",
    pageTitle: "新增分类",
    selectedBackground: "",
    selectedColor: "orange",
    selectedIcon: null,
    selectedIconId: "",
    showProModal: false,
    showIconSheet: false
  }
  },
  onLoad(options = {}) {
    this.bookId = decodeURIComponent(options.id || "")
    this.isEdit = options.mode === "edit"
    this.setupNavigation()
    this.loadIcons()
    this.setData({
      bookId: this.bookId,
      isEdit: this.isEdit,
      isVip: getApp().getVipState(),
      pageTitle: this.isEdit ? "编辑倒数本" : "新增分类"
    })

    if (this.isEdit) {
      this.loadEditBook()
    }
  },
  onShow() {
    this.setData({ isVip: getApp().getVipState() })
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
      contentTop: navHeight + 30
    })
  },
    loadIcons() {
    const iconOptions = getEventIcons()
    const selectedIcon = iconOptions.find((item) => item.id === "cake") || iconOptions[0]
    const quickIcons = buildQuickIcons(iconOptions, selectedIcon)

    this.setData({
      iconOptions,
      quickIcons,
      selectedIcon,
      selectedIconId: (selectedIcon || {}).id || ""
    })
  },
    loadEditBook() {
    const book = getCountdownBookById(this.bookId)

    if (!book) {
      uni.showToast({ title: "倒数本不存在", icon: "none" })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }

    const iconOptions = this.iconOptions.length ? this.iconOptions : getEventIcons()
    const selectedIcon = iconOptions.find((item) => (
      item.id === book.icon || item.icon === book.iconSrc
    )) || iconOptions[0]
    const isDefaultBook = isDefaultCountdownBook(book.id)
    const customBook = getCustomCountdownBookById(book.id)

    this.setData({
      canDelete: !!customBook || !isDefaultBook,
      categoryDesc: book.desc || "",
      categoryName: book.title || "",
      iconOptions,
      quickIcons: buildQuickIcons(iconOptions, selectedIcon),
      isDefaultBook,
      selectedBackground: getBackgroundId(book.coverImage),
      selectedColor: getColorId(book.coverColor),
      selectedIcon,
      selectedIconId: selectedIcon ? selectedIcon.id : ""
    })
  },
    handleBack() {
    uni.navigateBack()
  },
    handleNameInput(event) {
    this.setData({ categoryName: event.detail.value })
  },
    handleDescInput(event) {
    this.setData({ categoryDesc: event.detail.value })
  },
    handleOpenIconSheet() {
    this.setData({ showIconSheet: true })
  },
    handleCloseIconSheet() {
    this.setData({ showIconSheet: false })
  },
    noop() {},
    handleSelectIcon(event) {
    const selectedIcon = this.iconOptions.find((item) => item.id === event.currentTarget.dataset.id)

    if (!selectedIcon) {
      return
    }

    this.setData({
      quickIcons: buildQuickIcons(this.iconOptions, selectedIcon),
      selectedIcon,
      selectedIconId: selectedIcon.id,
      showIconSheet: false
    })
  },
    handleSelectColor(event) {
    this.setData({ selectedColor: event.currentTarget.dataset.id })
  },
    handleSelectBackground(event) {
    const backgroundId = event.currentTarget.dataset.id

    if (this.isVip || getApp().getVipState()) {
      this.setData({
        isVip: true,
        selectedBackground: backgroundId
      })
      return
    }

    this.setData({
      pendingBackground: backgroundId,
      showProModal: true
    })
  },
    handleClosePro() {
    if (this.isPaying) {
      return
    }

    this.setData({
      pendingBackground: "",
      showProModal: false
    })
  },
    handleModalTap() {},
    async handlePurchasePro() {
    if (this.isPaying) {
      return
    }

    this.setData({ isPaying: true })

    try {
      const auth = getApp().getAuthState ? getApp().getAuthState() : {}
      const result = await getApp().getPaymentService().purchasePro(proPlan, auth)

      getApp().setVipState(true)
      this.setData({
        isPaying: false,
        isVip: true,
        selectedBackground: this.pendingBackground,
        pendingBackground: "",
        showProModal: false
      })

      uni.showToast({
        title: result && result.mock ? "演示支付成功" : "Pro 已开通",
        icon: "success"
      })
    } catch (error) {
      this.setData({ isPaying: false })
      uni.showToast({ title: "支付未完成", icon: "none" })
    }
  },
    async handleSave() {
    const title = this.categoryName.trim()
    const desc = this.categoryDesc.trim()

    if (!title) {
      uni.showToast({ title: this.isEdit ? "请输入倒数本名称" : "请输入分类名称", icon: "none" })
      return
    }

    const selectedIcon = this.selectedIcon || this.iconOptions[0]
    const selectedColor = findColor(this.selectedColor)
    const selectedBackground = this.selectedBackground
      ? backgroundOptions.find((item) => item.id === this.selectedBackground)
      : null
    uni.showLoading({ title: "正在保存" })
    let savedBook
    try {
      savedBook = await saveCustomCountdownBookAsync({
        id: this.isEdit ? this.bookId : undefined,
        title,
        desc: desc || "记录每一个值得期待的日子",
        icon: selectedIcon.id,
        iconSrc: selectedIcon.icon,
        activeIconSrc: selectedIcon.activeIcon || selectedIcon.icon,
        coverColor: selectedColor.color,
        coverImage: selectedBackground && selectedBackground.image,
        tone: selectedColor.tone || "warm"
      })
    } catch (error) {
      uni.hideLoading()
      console.warn("save countdown book failed", error)
      uni.showToast({ title: "保存失败，请重试", icon: "none" })
      return
    }

    uni.setStorageSync("selectedCountdownBook", savedBook)
    uni.hideLoading()
    uni.showToast({ title: "保存成功", icon: "success" })

    setTimeout(() => {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
        return
      }

      uni.redirectTo({ url: "/pages/book/book" })
    }, 300)
  },
    handleDelete() {
    const title = this.isDefaultBook ? "恢复默认倒数本？" : "删除这个倒数本？"
    const content = this.isDefaultBook
      ? "将清除当前倒数本的自定义信息，恢复系统默认配置。"
      : "删除后该倒数本将从列表中移除，已有事件不会被删除。"

    uni.showModal({
      title,
      content,
      confirmText: this.isDefaultBook ? "恢复默认" : "删除",
      confirmColor: "#ba1a1a",
      success: ({ confirm }) => {
        if (!confirm) {
          return
        }

        const fallbackBook = deleteCustomCountdownBook(this.bookId)
        const selectedBook = uni.getStorageSync("selectedCountdownBook")

        if (selectedBook && selectedBook.id === this.bookId) {
          if (fallbackBook && fallbackBook.id === this.bookId) {
            uni.setStorageSync("selectedCountdownBook", fallbackBook)
          } else {
            uni.removeStorageSync("selectedCountdownBook")
          }
        }

        uni.showToast({
          title: this.isDefaultBook ? "已恢复默认" : "已删除",
          icon: "success"
        })

        setTimeout(() => {
          if (getCurrentPages().length > 2) {
            uni.navigateBack({ delta: 2 })
            return
          }

          uni.redirectTo({ url: "/pages/book/book" })
        }, 350)
      }
    })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: #fbf9f9;
  color: #1b1c1c;
  overflow: hidden;
}

.tap-press {
  opacity: 0.78;
  transform: scale(0.98);
}

.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 70;
  background: rgba(251, 249, 249, 0.84);
  border-bottom: 1rpx solid rgba(221, 193, 174, 0.42);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 28rpx;
  width: 76rpx;
  justify-content: center;
  border-radius: 999rpx;
}

.nav-back image {
  width: 36rpx;
  height: 36rpx;
}

.nav-title {
  left: 116rpx;
  right: 210rpx;
  color: #1b1c1c;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 46rpx;
  padding-right: 46rpx;
  padding-bottom: calc(152rpx + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: 32rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: block;
  margin: 0 0 16rpx 2rpx;
  color: #564334;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
}

.section-head .section-title {
  margin-bottom: 16rpx;
}

.section-link {
  margin-bottom: 16rpx;
  color: #904d00;
  font-size: 22rpx;
  line-height: 30rpx;
}

.section-card {
  box-sizing: border-box;
  border-radius: 16rpx;
  background: #efeded;
}

.basic-card {
  padding: 32rpx;
}

.field-label {
  display: block;
  margin-bottom: 16rpx;
  color: #5f5e5e;
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.name-input {
  height: 88rpx;
  box-sizing: border-box;
  padding: 0 30rpx;
  border-radius: 16rpx;
  background: #f5f3f3;
  color: #1b1c1c;
  font-size: 27rpx;
}

.desc-block {
  margin-top: 26rpx;
}

.desc-input {
  width: 100%;
  height: 128rpx;
  box-sizing: border-box;
  padding: 22rpx 30rpx;
  border-radius: 16rpx;
  background: #f5f3f3;
  color: #1b1c1c;
  font-size: 27rpx;
  line-height: 38rpx;
}

.placeholder {
  color: rgba(86, 67, 52, 0.38);
}

.icon-card,
.color-card {
  padding: 32rpx;
}

.quick-icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 31rpx;
}

.quick-icon {
  position: relative;
  width: 92rpx;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #efeded;
  transition: transform 140ms ease, background-color 140ms ease;
}

.quick-icon image {
  width: 40rpx;
  height: 40rpx;
}

.quick-icon-active {
  background: #ff8c00;
  box-shadow: 0 6rpx 18rpx rgba(255, 140, 0, 0.18);
}

.quick-icon-selected-mark {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 3rpx solid #efeded;
  border-radius: 50%;
  background: #904d00;
  box-shadow: 0 4rpx 12rpx rgba(27, 28, 28, 0.16);
}

.quick-icon-selected-mark image {
  width: 18rpx;
  height: 18rpx;
  margin: 0;
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 31rpx;
}

.color-item {
  width: 77rpx;
  height: 77rpx;
  box-sizing: border-box;
  border: 4rpx solid transparent;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 14rpx rgba(27, 28, 28, 0.06);
}

.color-none {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-color: #ddc1ae;
}

.color-none image {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.66;
}

.color-active {
  border-color: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(255, 140, 0, 0.28), 0 8rpx 20rpx rgba(27, 28, 28, 0.08);
}

.inline-pro {
  color: #ff8c00;
  font-size: 18rpx;
  letter-spacing: 1rpx;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 31rpx;
}

.background-card {
  position: relative;
  height: 0;
  padding-bottom: 133%;
  overflow: hidden;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  border-radius: 24rpx;
  background: #e3e2e2;
  box-shadow: 0 8rpx 20rpx rgba(27, 28, 28, 0.05);
}

.background-card image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.background-active {
  border-color: #ff8c00;
  box-shadow: 0 12rpx 34rpx rgba(255, 140, 0, 0.22);
}

.pro-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  z-index: 2;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 16rpx;
  line-height: 24rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.selected-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 140, 0, 0.2);
}

.selected-overlay image {
  width: 54rpx;
  height: 54rpx;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: flex;
  gap: 22rpx;
  padding: 24rpx 46rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(251, 249, 249, 0.84);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.save-button,
.delete-button {
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  box-sizing: border-box;
  font-size: 31rpx;
  line-height: 42rpx;
  font-weight: 700;
}

.save-button {
  flex: 1;
  background: #ff8c00;
  color: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(255, 140, 0, 0.24);
}

.save-button-edit {
  flex: 1.35;
}

.delete-button {
  flex: 1;
  border: 2rpx solid rgba(186, 26, 26, 0.18);
  background: rgba(255, 218, 214, 0.5);
  color: #ba1a1a;
  box-shadow: 0 10rpx 28rpx rgba(186, 26, 26, 0.06);
}

.delete-button image {
  width: 34rpx;
  height: 34rpx;
  margin-right: 10rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(27, 27, 29, 0.42);
}

.icon-sheet {
  width: 100%;
  max-height: 74vh;
  box-sizing: border-box;
  padding: 28rpx 28rpx calc(30rpx + env(safe-area-inset-bottom));
  border-radius: 38rpx 38rpx 0 0;
  background: #ffffff;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  color: #1b1c1c;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.sheet-head image {
  width: 34rpx;
  height: 34rpx;
}

.icon-scroll {
  max-height: 940rpx;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18rpx;
}

.icon-option {
  min-height: 126rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx solid transparent;
  border-radius: 22rpx;
  background: #f7f4f6;
  color: #564334;
  font-size: 20rpx;
}

.icon-option-active {
  border-color: rgba(144, 77, 0, 0.3);
  background: rgba(255, 220, 195, 0.46);
  color: #904d00;
}

.icon-option image {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 10rpx;
}

.pro-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  background: rgba(27, 27, 29, 0.44);
}

.pro-sheet {
  width: 100%;
  box-sizing: border-box;
  padding: 30rpx 46rpx calc(36rpx + env(safe-area-inset-bottom));
  border-radius: 42rpx 42rpx 0 0;
  background: #fffaf6;
  box-shadow: 0 -20rpx 60rpx rgba(27, 27, 29, 0.12);
}

.pro-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1b1c1c;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.pro-head image {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.72;
}

.pro-mark {
  width: 118rpx;
  height: 118rpx;
  margin: 34rpx auto 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 38rpx;
  background: rgba(255, 140, 0, 0.12);
}

.pro-mark image {
  width: 62rpx;
  height: 62rpx;
}

.pro-title,
.pro-desc {
  display: block;
  text-align: center;
}

.pro-title {
  color: #1b1c1c;
  font-size: 36rpx;
  line-height: 50rpx;
  font-weight: 800;
}

.pro-desc {
  margin: 12rpx auto 0;
  max-width: 560rpx;
  color: rgba(86, 67, 52, 0.66);
  font-size: 24rpx;
  line-height: 38rpx;
}

.pro-benefits {
  margin: 30rpx 0;
  display: grid;
  gap: 16rpx;
}

.pro-benefits view {
  min-height: 70rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: rgba(255, 140, 0, 0.08);
  color: #564334;
  font-size: 25rpx;
}

.pro-benefits image {
  width: 28rpx;
  height: 28rpx;
  margin-right: 14rpx;
  padding: 5rpx;
  border-radius: 50%;
  background: #ff8c00;
}

.pro-button {
  height: 104rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: #ff8c00;
  color: #ffffff;
  font-size: 30rpx;
  line-height: 42rpx;
  font-weight: 800;
  box-shadow: 0 14rpx 34rpx rgba(255, 140, 0, 0.24);
}

.bottom-spacer {
  height: 150rpx;
}
</style>
