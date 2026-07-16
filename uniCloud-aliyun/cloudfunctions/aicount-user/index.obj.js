const uniID = require("uni-id-common")

function now() {
  return Date.now()
}

function maskPhone(phone) {
  const value = String(phone || "")
  if (value.length < 7) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
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

  async getProfile() {
    const uid = await getUid(this)
    const profileRes = await this.db.collection("aicount_user_profiles")
      .where({ user_id: uid })
      .limit(1)
      .get()
    const vipRes = await this.db.collection("aicount_vip_subscriptions")
      .where({
        user_id: uid,
        status: "active",
        expires_at: this.db.command.gt(now())
      })
      .limit(1)
      .get()

    return {
      code: 0,
      data: {
        user_id: uid,
        profile: profileRes.data[0] || null,
        is_vip: vipRes.data.length > 0,
        vip: vipRes.data[0] || null
      }
    }
  },

  async upsertProfile(profile = {}) {
    const uid = await getUid(this)
    const payload = {
      user_id: uid,
      nickname: String(profile.nickname || "").trim(),
      avatar_url: String(profile.avatar_url || ""),
      phone_mask: profile.phone ? maskPhone(profile.phone) : String(profile.phone_mask || ""),
      updated_at: now()
    }

    const existed = await this.db.collection("aicount_user_profiles")
      .where({ user_id: uid })
      .limit(1)
      .get()

    if (existed.data.length) {
      await this.db.collection("aicount_user_profiles").doc(existed.data[0]._id).update(payload)
      return { code: 0, data: { _id: existed.data[0]._id, ...existed.data[0], ...payload } }
    }

    payload.created_at = now()
    const addRes = await this.db.collection("aicount_user_profiles").add(payload)
    return { code: 0, data: { _id: addRes.id, ...payload } }
  },

  async fakePhoneLogin(payload = {}) {
    const uid = await getUid(this)
    const profile = {
      nickname: payload.nickname || "微信用户",
      avatar_url: payload.avatar_url || "",
      phone: payload.phone || "13800000000"
    }
    const normalized = {
      user_id: uid,
      nickname: String(profile.nickname || "").trim(),
      avatar_url: String(profile.avatar_url || ""),
      phone_mask: maskPhone(profile.phone),
      updated_at: now()
    }
    const existed = await this.db.collection("aicount_user_profiles")
      .where({ user_id: uid })
      .limit(1)
      .get()
    if (existed.data.length) {
      await this.db.collection("aicount_user_profiles").doc(existed.data[0]._id).update(normalized)
      return { code: 0, data: { _id: existed.data[0]._id, ...normalized } }
    }
    normalized.created_at = now()
    const result = await this.db.collection("aicount_user_profiles").add(normalized)
    return { code: 0, data: { _id: result.id, ...normalized } }
  }
}
