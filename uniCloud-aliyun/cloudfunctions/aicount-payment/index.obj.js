const uniID = require("uni-id-common")

function now() {
  return Date.now()
}

function oneYearLater() {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.getTime()
}

async function getUid(context) {
  const fallbackUid = process.env.AICOUNT_DEMO_USER_ID || "demo-user"
  const token = context.getUniIdToken()
  if (!token) return fallbackUid
  try {
    const instance = uniID.createInstance({ clientInfo: context.getClientInfo() })
    const result = await instance.checkToken(token)
    return result.code ? fallbackUid : result.uid
  } catch (error) {
    console.warn("uni-id is not configured, using demo user", error.message)
    return fallbackUid
  }
}

module.exports = {
  _before() {
    this.db = uniCloud.database()
  },

  async createProOrder(plan = {}) {
    const uid = await getUid(this)
    const planId = String(plan.plan_id || plan.id || "pro-year")
    const amountCent = Number(plan.amount_cent || plan.amount || 990)
    const payload = {
      user_id: uid,
      order_no: `pro-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      plan_id: planId,
      amount_cent: amountCent,
      status: "pending",
      pay_params: {},
      created_at: now(),
      updated_at: now()
    }
    const res = await this.db.collection("aicount_payment_orders").add(payload)
    return { code: 0, data: { _id: res.id, ...payload } }
  },

  async mockPaySuccess(orderId) {
    const uid = await getUid(this)
    if (!orderId) throw new Error("ORDER_ID_REQUIRED")
    const orderRes = await this.db.collection("aicount_payment_orders")
      .where({ _id: orderId, user_id: uid })
      .limit(1)
      .get()
    if (!orderRes.data.length) throw new Error("ORDER_NOT_FOUND")
    const order = orderRes.data[0]
    await this.db.collection("aicount_payment_orders").doc(orderId).update({
      status: "paid",
      paid_at: now(),
      updated_at: now()
    })
    const vip = {
      user_id: uid,
      plan_id: order.plan_id,
      status: "active",
      starts_at: now(),
      expires_at: oneYearLater(),
      created_at: now(),
      updated_at: now()
    }
    await this.db.collection("aicount_vip_subscriptions").add(vip)
    return { code: 0, data: vip }
  },

  async getVipState() {
    const uid = await getUid(this)
    const res = await this.db.collection("aicount_vip_subscriptions")
      .where({
        user_id: uid,
        status: "active",
        expires_at: this.db.command.gt(now())
      })
      .orderBy("expires_at", "desc")
      .limit(1)
      .get()
    return { code: 0, data: { is_vip: res.data.length > 0, vip: res.data[0] || null } }
  }
}
