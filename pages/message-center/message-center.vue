<template>
<view class="page">
  <view class="nav-shell" :style="navShellStyle">
    <view class="nav-back" :style="navActionStyle" @tap="handleBack" hover-class="tap-press">
      <image src="/static/assets/icons/chevron-left.svg" mode="aspectFit"></image>
    </view>
    <view class="nav-title" :style="navActionStyle"><text>消息中心</text></view>
    <view class="nav-more" :style="navActionStyle">
      <image src="/static/assets/icons/more-horiz.svg" mode="aspectFit"></image>
    </view>
  </view>

  <scroll-view class="content" scroll-y enhanced :show-scrollbar="false" :style="'padding-top: ' + (contentTop) + 'px;'">
    <view class="message-list">
      <view
        class="message-card"
       
       
        :data-id="item.id"
        :data-event-id="item.eventId"
        @tap="handleOpenMessage"
        hover-class="tap-press"
       v-for="(item, index) in messages" :key="item.id">
        <view :class="'message-icon ' + (item.tone)">
          <image :src="item.icon" mode="aspectFit"></image>
        </view>
        <view class="message-copy">
          <text class="message-title">{{item.title}}</text>
          <text class="message-text">{{item.copy}}</text>
        </view>
        <view class="message-side">
          <text>{{item.time}}</text>
          <view v-if="item.unread" class="unread-dot"></view>
        </view>
      </view>

      <view v-if="emptyVisible" class="empty-state">
        <image src="/static/assets/icons/notifications.svg" mode="aspectFit"></image>
        <text class="empty-title">暂无消息</text>
        <text class="empty-copy">创建倒数日后，临近、置顶和完成提醒会出现在这里。</text>
      </view>
    </view>
  </scroll-view>
</view>
</template>

<script>
const { getUserMessages } = require("../../utils/message-notifications")
const cloudApi = require("../../services/cloud-api")
const { getWindowMetrics } = require("../../utils/system-info")

function formatMessageTime(timestamp) {
  const date = new Date(Number(timestamp || Date.now()))
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

function normalizeCloudMessage(item = {}) {
  const toneMap = {
    today: "message-warm",
    soon: "message-warm",
    completed: "message-green",
    progress: "message-blue"
  }
  return {
    id: item._id || item.id,
    eventId: item.event_id || item.eventId,
    title: item.title || "",
    copy: item.content || item.copy || "",
    time: item.time || formatMessageTime(item.created_at),
    unread: !!item.unread,
    icon: "/static/assets/icons/notifications.svg",
    tone: toneMap[item.type] || "message-warm"
  }
}

export default {
  data() {
    return {
    contentTop: 96,
    emptyVisible: false,
    messages: [],
    navActionStyle: "",
    navShellStyle: ""
  }
  },
  onLoad() {
    this.setupNavigation()
    this.loadMessages()
  },
  async onShow() {
    await this.loadMessages()
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
      contentTop: navHeight + 32
    })
  },
    async loadMessages() {
    const auth = getApp().getAuthState()
    let messages = []

    if (auth.isLoggedIn) {
      try {
        const res = await cloudApi.message().list()
        messages = (res && res.data ? res.data : []).map(normalizeCloudMessage)
      } catch (error) {
        messages = getUserMessages(true)
      }
    }

    this.setData({
      emptyVisible: messages.length === 0,
      messages
    })
  },
    handleBack() {
    if (getCurrentPages().length > 1) {
      uni.navigateBack()
      return
    }

    uni.redirectTo({ url: "/pages/mine/mine" })
  },
    handleOpenMessage(event) {
    const eventId = event.currentTarget.dataset.eventId
    const messageId = event.currentTarget.dataset.id

    if (messageId) {
      try {
        cloudApi.message().markRead(messageId)
      } catch (error) {}
    }

    if (!eventId) {
      return
    }

    uni.navigateTo({
      url: `/pages/event-detail/event-detail?id=${encodeURIComponent(eventId)}`
    })
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
  background: rgba(252, 248, 251, 0.68);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.nav-back,
.nav-title,
.nav-more {
  position: absolute;
  display: flex;
  align-items: center;
}

.nav-back {
  left: 32rpx;
  width: 72rpx;
  justify-content: flex-start;
}

.nav-back image {
  width: 44rpx;
  height: 44rpx;
}

.nav-title {
  left: 132rpx;
  right: 132rpx;
  justify-content: center;
  color: #1b1b1d;
  font-size: 38rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.nav-more {
  right: 32rpx;
  width: 72rpx;
  justify-content: flex-end;
}

.nav-more image {
  width: 44rpx;
  height: 44rpx;
}

.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.message-card {
  position: relative;
  min-height: 154rpx;
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 31rpx;
  border: 1rpx solid rgba(221, 193, 174, 0.28);
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(27, 27, 29, 0.025);
}

.message-icon {
  width: 92rpx;
  height: 92rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 31rpx;
  border-radius: 50%;
}

.message-icon image {
  width: 46rpx;
  height: 46rpx;
}

.message-icon.primary {
  background: rgba(144, 77, 0, 0.08);
}

.message-icon.secondary {
  background: rgba(137, 115, 98, 0.14);
}

.message-icon.orange {
  background: rgba(255, 140, 0, 0.12);
}

.message-icon.amber {
  background: rgba(255, 180, 64, 0.14);
}

.message-copy {
  min-width: 0;
  flex: 1;
  padding-right: 112rpx;
}

.message-title {
  display: block;
  color: #1b1b1d;
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 800;
}

.message-text {
  display: -webkit-box;
  margin-top: 8rpx;
  overflow: hidden;
  color: rgba(86, 67, 52, 0.66);
  font-size: 25rpx;
  line-height: 38rpx;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.message-side {
  position: absolute;
  top: 31rpx;
  right: 31rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-side text {
  color: rgba(86, 67, 52, 0.42);
  font-size: 21rpx;
  line-height: 30rpx;
  font-weight: 600;
}

.unread-dot {
  width: 19rpx;
  height: 19rpx;
  margin-top: 20rpx;
  border-radius: 50%;
  background: #ff8c00;
}

.empty-state {
  min-height: 520rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 64rpx 32rpx;
  box-sizing: border-box;
  text-align: center;
}

.empty-state image {
  width: 88rpx;
  height: 88rpx;
  opacity: 0.46;
}

.empty-title {
  margin-top: 28rpx;
  color: #1b1b1d;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 700;
}

.empty-copy {
  width: 460rpx;
  max-width: 100%;
  margin-top: 12rpx;
  color: rgba(86, 67, 52, 0.56);
  font-size: 24rpx;
  line-height: 36rpx;
}

.tap-press {
  opacity: 0.82;
  transform: scale(0.98);
}
</style>
