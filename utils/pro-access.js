const defaultProPlan = {
  id: "pro-template-access",
  title: "Pro 模板权益",
  amount: 1990,
  price: "¥19.9"
}

function requestProAccess(options = {}) {
  const {
    content = "开通 Pro 后即可使用全部高级模板与会员功能。",
    onSuccess,
    plan = defaultProPlan,
    title = "Pro 专属模板"
  } = options

  uni.showModal({
    title,
    content,
    confirmText: "立即开启",
    cancelText: "暂不",
    confirmColor: "#ff8c00",
    success: async ({ confirm }) => {
      if (!confirm) {
        return
      }

      uni.showLoading({ title: "正在开通" })

      try {
        const app = getApp()
        const auth = app.getAuthState ? app.getAuthState() : {}
        const result = await app.getPaymentService().purchasePro(plan, auth)

        app.setVipState(true, Date.now() + 365 * 24 * 60 * 60 * 1000)
        uni.hideLoading()
        uni.showToast({
          title: result && result.mock ? "演示支付成功" : "Pro 已开通",
          icon: "success"
        })

        if (typeof onSuccess === "function") {
          onSuccess(result)
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: "开通未完成", icon: "none" })
      }
    }
  })
}

module.exports = {
  defaultProPlan,
  requestProAccess
}
