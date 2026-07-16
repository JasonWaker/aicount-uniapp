const uniID = require("uni-id-common")

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

  async submit(data = {}) {
    const uid = await getUid(this)
    const content = String(data.content || "").trim()
    if (!content) throw new Error("FEEDBACK_CONTENT_REQUIRED")
    const payload = {
      user_id: uid,
      type: String(data.type || "general"),
      content,
      contact: String(data.contact || ""),
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      status: "pending",
      created_at: Date.now(),
      updated_at: Date.now()
    }
    const res = await this.db.collection("aicount_feedbacks").add(payload)
    return { code: 0, data: { _id: res.id, ...payload } }
  }
}
