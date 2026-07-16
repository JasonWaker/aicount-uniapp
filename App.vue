<script>
const AUTH_STORAGE_KEY = "ai_countdown_auth"
const VIP_STORAGE_KEY = "ai_countdown_vip"
const aiService = require("./services/ai-service")
const paymentService = require("./services/payment-service")
const cloudApi = require("./services/cloud-api")
const { getDeviceMetrics } = require("./utils/system-info")

export default {
  globalData: {
    auth: {
      isLoggedIn: false,
      nickname: "",
      loginCode: "",
      phoneLabel: "",
      phoneCode: ""
    },
    isVip: false,
    systemInfo: null,
    cloudStatus: {
      checked: false,
      available: false,
      initReady: false,
      collections: {},
      error: ""
    }
  },
  onLaunch() {
    this.installAppBridge()
    this.globalData.systemInfo = getDeviceMetrics()
    if (typeof wx !== "undefined" && wx.cloud) {
      wx.cloud.init({
        traceUser: true
      })
    }
    this.loadAuthState()
    this.getVipState()
    Promise.resolve(this.bootstrapCloud()).catch((error) => {
      console.warn("cloud bootstrap failed", error)
    })
  },
  methods: {
    installAppBridge() {
      const app = typeof getApp === "function" ? getApp() : null
      if (!app) return
      Object.keys(this.$options.methods || {}).forEach((name) => {
        if (name !== "installAppBridge") {
          app[name] = this[name].bind(this)
        }
      })
    },
    loadAuthState() {
    try {
      const auth = uni.getStorageSync(AUTH_STORAGE_KEY)
      if (auth && auth.isLoggedIn) {
        this.globalData.auth = {
          isLoggedIn: true,
          loginCode: auth.loginCode || "",
          nickname: auth.nickname || "",
          phoneCode: auth.phoneCode || "",
          phoneLabel: auth.phoneLabel || ""
        }
      }
    } catch (error) {
      this.globalData.auth = {
        isLoggedIn: false,
        loginCode: "",
        nickname: "",
        phoneCode: "",
        phoneLabel: ""
      }
    }
  },
    getAuthState() {
    return {
      ...this.globalData.auth
    }
  },
    getAiService() {
    return aiService
  },
    configureAiService(config) {
    aiService.configureAiService(config)
  },
    getPaymentService() {
    return paymentService
  },
    configurePaymentService(config) {
    paymentService.configurePaymentService(config)
  },
    async bootstrapCloud() {
    await this.checkCloudSetup()
    if (this.globalData.auth.isLoggedIn) {
      await this.refreshVipStateFromCloud()
    }
    return this.globalData.cloudStatus
  },
    async checkCloudSetup() {
    try {
      const result = await cloudApi.setup().checkInitData()
      const data = result && result.data ? result.data : {}
      this.globalData.cloudStatus = {
        checked: true,
        available: true,
        initReady: !!data.ready,
        collections: data.collections || {},
        error: ""
      }
      if (!data.ready) {
        console.warn("uniCloud init data is incomplete", data.collections || {})
      }
    } catch (error) {
      this.globalData.cloudStatus = {
        checked: true,
        available: false,
        initReady: false,
        collections: {},
        error: error && error.message ? error.message : String(error || "CLOUD_UNAVAILABLE")
      }
      console.warn("check cloud setup failed", error)
    }
    return this.globalData.cloudStatus
  },
    async syncAuthenticatedProfile(authState = {}) {
    try {
      await cloudApi.user().fakePhoneLogin({
        nickname: authState.nickname || this.globalData.auth.nickname || "微信用户",
        avatar_url: authState.avatarUrl || "",
        phone: authState.phone || authState.phoneLabel || "13800000000"
      })
      await this.refreshVipStateFromCloud()
      return true
    } catch (error) {
      console.warn("sync authenticated profile failed", error)
      return false
    }
  },
    getCloudStatus() {
    return {
      ...this.globalData.cloudStatus,
      collections: {
        ...(this.globalData.cloudStatus.collections || {})
      }
    }
  },
    async refreshVipStateFromCloud() {
    try {
      const result = await cloudApi.user().getProfile()
      const data = result && result.data ? result.data : {}
      const vip = data.vip || null
      this.setVipState(!!data.is_vip, vip && vip.expires_at)
      return !!data.is_vip
    } catch (error) {
      console.warn("refresh vip state from cloud failed", error)
      return this.getVipState()
    }
  },
    getVipState() {
    const stored = uni.getStorageSync(VIP_STORAGE_KEY)

    if (stored && typeof stored === "object") {
      const expiresAt = Number(stored.expiresAt || 0)
      const valid = !!stored.enabled && (!expiresAt || expiresAt > Date.now())
      this.globalData.isVip = valid
      return valid
    }

    return !!this.globalData.isVip
  },
    setVipState(isVip, expiresAt) {
    this.globalData.isVip = !!isVip
    uni.setStorageSync(VIP_STORAGE_KEY, expiresAt ? {
      enabled: !!isVip,
      expiresAt
    } : this.globalData.isVip)
  },
    setAuthState(authState) {
    this.globalData.auth = {
      isLoggedIn: !!authState.isLoggedIn,
      loginCode: authState.loginCode || this.globalData.auth.loginCode || "",
      nickname: authState.nickname || this.globalData.auth.nickname || "",
      phoneCode: authState.phoneCode || "",
      phoneLabel: authState.phoneLabel || ""
    }

    uni.setStorageSync(AUTH_STORAGE_KEY, this.globalData.auth)
    if (this.globalData.auth.isLoggedIn) {
      Promise.resolve(this.syncAuthenticatedProfile(authState)).catch((error) => {
        console.warn("sync authenticated profile failed", error)
      })
    }
  },
    clearAuthState() {
    this.globalData.auth = {
      isLoggedIn: false,
      loginCode: "",
      nickname: "",
      phoneCode: "",
      phoneLabel: ""
    }

    uni.removeStorageSync(AUTH_STORAGE_KEY)
  }
  }
}
</script>

<style>
page {
  min-height: 100vh;
  background: #fcf8fb;
  color: #1b1b1d;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  font-size: 30rpx;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

view,
text,
image,
button {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
}

button::after {
  border: 0;
}
</style>
