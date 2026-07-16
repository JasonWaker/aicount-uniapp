const cloudApi = require("./cloud-api")

const DEFAULT_TIMEOUT = 12000

let config = {
  endpoint: "",
  headers: {},
  mockEnabled: true,
  mockDelay: 800,
  timeout: DEFAULT_TIMEOUT,
  useCloudOrder: true
}

function configurePaymentService(nextConfig = {}) {
  config = {
    ...config,
    ...nextConfig,
    headers: {
      ...config.headers,
      ...(nextConfig.headers || {})
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestCloudOrder(plan = {}) {
  const res = await cloudApi.payment().createProOrder({
    plan_id: plan.id || plan.plan_id || "pro-year",
    amount_cent: Number(plan.amount_cent || plan.amount || 990)
  })
  const order = res && res.data ? res.data : null
  if (!order || !order._id) {
    throw new Error("Cloud payment order failed")
  }
  return {
    mock: true,
    cloud: true,
    orderId: order._id,
    orderNo: order.order_no,
    planId: order.plan_id,
    amount: order.amount_cent
  }
}

function requestLegacyOrder(plan, user) {
  return new Promise((resolve, reject) => {
    if (!config.endpoint) {
      if (config.mockEnabled) {
        setTimeout(() => {
          resolve({
            mock: true,
            orderId: `mock-order-${Date.now()}`,
            planId: plan.id,
            amount: plan.amount,
            user
          })
        }, config.mockDelay)
        return
      }

      const error = new Error("Payment endpoint is not configured")
      error.code = "PAYMENT_NOT_CONFIGURED"
      reject(error)
      return
    }

    uni.request({
      url: config.endpoint,
      method: "POST",
      header: config.headers,
      timeout: config.timeout,
      data: {
        feature: "pro-subscription",
        planId: plan.id,
        amount: plan.amount,
        user
      },
      success: ({ statusCode, data }) => {
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`Payment order failed with status ${statusCode}`))
          return
        }
        resolve(data && (data.payment || data.payParams || data))
      },
      fail: reject
    })
  })
}

async function requestOrder(plan, user) {
  if (config.useCloudOrder) {
    try {
      return await requestCloudOrder(plan, user)
    } catch (error) {
      console.warn("cloud payment order failed, fallback to legacy mock", error)
    }
  }
  return requestLegacyOrder(plan, user)
}

function invokeWechatPayment(payment) {
  return new Promise((resolve, reject) => {
    if (payment && payment.mock) {
      setTimeout(() => {
        resolve({
          errMsg: "requestPayment:ok",
          mock: true,
          cloud: !!payment.cloud,
          orderId: payment.orderId
        })
      }, config.mockDelay)
      return
    }

    if (!payment || !payment.timeStamp || !payment.nonceStr || !payment.package || !payment.paySign) {
      reject(new Error("Invalid WeChat payment parameters"))
      return
    }

    uni.requestPayment({
      timeStamp: String(payment.timeStamp),
      nonceStr: payment.nonceStr,
      package: payment.package,
      signType: payment.signType || "RSA",
      paySign: payment.paySign,
      success: resolve,
      fail: reject
    })
  })
}

async function purchasePro(plan, user) {
  const payment = await requestOrder(plan, user)
  const result = await invokeWechatPayment(payment)

  if (payment.cloud && payment.orderId) {
    await cloudApi.payment().mockPaySuccess(payment.orderId)
  } else if (payment.mock) {
    await delay(200)
  }

  return {
    success: true,
    mock: !!(payment && payment.mock),
    cloud: !!(payment && payment.cloud),
    orderId: (result && result.orderId) || payment.orderId || ""
  }
}

module.exports = {
  configurePaymentService,
  invokeWechatPayment,
  purchasePro,
  requestOrder
}
