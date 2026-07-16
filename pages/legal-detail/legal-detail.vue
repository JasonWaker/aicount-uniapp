<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>{{doc.title}}</text></view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="paper">
      <text class="doc-title">{{doc.title}}</text>
      <text class="doc-date">{{doc.updatedAt}}</text>
      <view class="divider"></view>
      <text class="paragraph" v-for="(item, index) in doc.paragraphs" :key="index">{{item}}</text>
    </view>
  </scroll-view>
</view>
</template>

<script>
const { getWindowMetrics } = require("../../utils/system-info")

const legalDocs = {
  privacy: {
    title: "隐私政策",
    updatedAt: "更新日期：2026年7月2日",
    paragraphs: [
      "AI 倒数日重视并保护你的个人信息。本政策说明我们如何收集、使用、存储和保护你在使用小程序过程中产生的信息。",
      "我们可能会收集你的微信登录状态、手机号授权结果、倒数日事件、倒数本分类、背景模板、提醒偏好和会员状态，用于提供账号识别、事件管理、提醒通知、会员权益和数据同步等基础功能。",
      "当你使用拍照、相册、通知等能力时，小程序会在获得你的授权后调用对应系统权限。你可以在微信设置或小程序设置中随时关闭相关权限。",
      "你的倒数日标题、目标日期、备注、背景图和时光记录仅用于展示、提醒和生成相关 AI 辅助内容。未经你的明确授权，我们不会将这些信息用于与产品功能无关的目的。",
      "我们会采用合理的安全措施保护你的信息，包括本地存储隔离、最小必要使用和敏感操作授权确认。演示环境中的登录、支付和 AI 能力可能使用模拟流程，正式上线时将接入真实服务端校验。",
      "如你需要查询、更正、删除个人信息，或注销账号，可通过中心设置、意见反馈入口联系我们处理。注销后，与账号相关的数据将按产品规则删除或匿名化处理。",
      "本政策可能因功能调整、法律法规要求或服务变化而更新。更新后，我们会在相关页面展示最新版本。"
    ]
  },
  service: {
    title: "用户服务协议",
    updatedAt: "更新日期：2026年7月2日",
    paragraphs: [
      "欢迎使用 AI 倒数日。本协议是你与 AI 倒数日之间关于使用本小程序服务所订立的协议。",
      "你可以通过本小程序创建倒数日、管理倒数本、选择背景模板、记录时光节点、查看 AI 寄语和智能分解建议。你应保证填写的内容真实、合法，不侵犯他人权益。",
      "你理解并同意，AI 生成内容仅作为记录、提醒和灵感辅助，不构成专业建议。重要事项请结合自身判断并自行承担安排责任。",
      "Pro 会员能力包括更多模板、AI 功能和高级配置。会员服务的价格、权益、有效期以页面展示和实际支付结果为准。演示流程中的支付可能使用模拟接口。",
      "你不得利用本小程序发布违法违规、侵权、骚扰、虚假或恶意内容，也不得干扰小程序正常运行、逆向破解或绕过权限限制。",
      "因不可抗力、系统维护、网络异常、第三方服务故障等原因导致服务中断或数据展示延迟的，我们会尽力恢复，但不承担超出法律规定范围的责任。",
      "我们可能根据产品发展调整功能、页面和服务规则。继续使用本小程序，即表示你接受更新后的协议内容。"
    ]
  }
}

export default {
  data() {
    return {
    contentTop: 96,
    doc: legalDocs.privacy,
    navActionStyle: "",
    navShellStyle: ""
  }
  },
  onLoad(options = {}) {
    this.setupNavigation()
    this.setData({
      doc: legalDocs[options.type] || legalDocs.privacy
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
    const system = getWindowMetrics()
    const menu = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = system.statusBarHeight || 20
    const menuTop = menu.top || statusBarHeight + 4
    const menuHeight = menu.height || 32
    const navHeight = menuTop + menuHeight + 8

    this.setData({
      navActionStyle: `top:${menuTop}px;height:${menuHeight}px;`,
      navShellStyle: `height:${navHeight}px;`,
      contentTop: navHeight + 34
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/privacy-management/privacy-management" })
  }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  overflow: hidden;
  background: #fcf8fb;
  color: #1b1b1d;
}

.nav-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  background: rgba(252, 248, 251, 0.82);
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
  left: 31rpx;
  width: 78rpx;
}

.nav-back image {
  width: 42rpx;
  height: 42rpx;
}

.nav-title {
  left: 114rpx;
  right: 31rpx;
  color: #904d00;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 0 31rpx calc(96rpx + env(safe-area-inset-bottom));
}

.paper {
  padding: 40rpx 34rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.25);
  border-radius: 31rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(27, 27, 29, 0.03);
}

.doc-title {
  display: block;
  color: #1b1b1d;
  font-size: 42rpx;
  line-height: 58rpx;
  font-weight: 900;
}

.doc-date {
  display: block;
  margin-top: 8rpx;
  color: rgba(86, 67, 52, 0.52);
  font-size: 23rpx;
  line-height: 34rpx;
}

.divider {
  height: 1rpx;
  margin: 30rpx 0;
  background: rgba(221, 193, 174, 0.2);
}

.paragraph {
  display: block;
  margin-bottom: 28rpx;
  color: rgba(27, 27, 29, 0.84);
  font-size: 28rpx;
  line-height: 48rpx;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
