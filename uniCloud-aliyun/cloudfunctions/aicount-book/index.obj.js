const uniID = require("uni-id-common")

function now() {
  return Date.now()
}

function cleanBook(data = {}) {
  return {
    system_key: String(data.system_key || data.systemKey || ""),
    title: String(data.title || data.label || "").trim(),
    description: String(data.description || data.desc || "").trim(),
    icon_key: String(data.icon_key || data.icon || ""),
    icon_url: String(data.icon_url || data.iconSrc || ""),
    cover_color: String(data.cover_color || data.coverColor || ""),
    cover_image_url: String(data.cover_image_url || data.coverImage || "")
  }
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
    this.$ = this.db.command
  },

  async list() {
    const uid = await getUid(this)
    const res = await this.db.collection("aicount_books")
      .where({
        is_deleted: false,
        user_id: this.$.in([uid, null, ""])
      })
      .orderBy("sort_order", "asc")
      .orderBy("created_at", "asc")
      .get()
    const visibleBooks = []
    const systemIndexes = {}
    res.data.forEach((item) => {
      if (!item.system_key) {
        visibleBooks.push(item)
        return
      }
      const key = item.system_key
      if (!Object.prototype.hasOwnProperty.call(systemIndexes, key)) {
        systemIndexes[key] = visibleBooks.length
        visibleBooks.push(item)
        return
      }
      if (item.user_id === uid) {
        visibleBooks[systemIndexes[key]] = item
      }
    })
    const orderRes = await this.db.collection("aicount_book_orders")
      .where({ user_id: uid })
      .limit(1)
      .get()
    const order = orderRes.data[0] && Array.isArray(orderRes.data[0].book_ids)
      ? orderRes.data[0].book_ids
      : []
    if (!order.length) {
      return { code: 0, data: visibleBooks }
    }
    const orderIndex = order.reduce((map, id, index) => {
      map[id] = index
      return map
    }, {})
    const ordered = visibleBooks.slice().sort((a, b) => {
      const aKey = a.system_key || a._id
      const bKey = b.system_key || b._id
      const aIndex = Object.prototype.hasOwnProperty.call(orderIndex, aKey) ? orderIndex[aKey] : 9999
      const bIndex = Object.prototype.hasOwnProperty.call(orderIndex, bKey) ? orderIndex[bKey] : 9999
      if (aIndex !== bIndex) return aIndex - bIndex
      return Number(a.sort_order || 0) - Number(b.sort_order || 0)
    })
    return { code: 0, data: ordered }
  },

  async create(data = {}) {
    const uid = await getUid(this)
    const book = cleanBook(data)
    if (!book.title) throw new Error("BOOK_TITLE_REQUIRED")
    const payload = {
      ...book,
      user_id: uid,
      is_default: false,
      is_deleted: false,
      sort_order: Number(data.sort_order || Date.now()),
      created_at: now(),
      updated_at: now()
    }
    if (data._id || data.id) {
      payload._id = data._id || data.id
    }
    const res = await this.db.collection("aicount_books").add(payload)
    return { code: 0, data: { _id: res.id, ...payload } }
  },

  async update(bookId, data = {}) {
    const uid = await getUid(this)
    const book = cleanBook(data)
    if (!bookId) throw new Error("BOOK_ID_REQUIRED")
    const owned = await this.db.collection("aicount_books")
      .where({
        user_id: uid,
        is_default: false,
        ...((book.system_key || !String(bookId).startsWith("custom-"))
          ? { system_key: book.system_key || String(bookId) }
          : { _id: bookId })
      })
      .limit(1)
      .get()
    if (owned.data.length) {
      await this.db.collection("aicount_books").doc(owned.data[0]._id).update({ ...book, updated_at: now() })
      return { code: 0, data: { _id: owned.data[0]._id } }
    }

    const direct = await this.db.collection("aicount_books")
      .where({ _id: bookId, user_id: uid, is_default: false })
      .limit(1)
      .get()
    if (direct.data.length) {
      await this.db.collection("aicount_books").doc(direct.data[0]._id).update({ ...book, updated_at: now() })
      return { code: 0, data: { _id: direct.data[0]._id } }
    }

    if (book.system_key) {
      const payload = {
        ...book,
        user_id: uid,
        is_default: false,
        is_deleted: false,
        sort_order: Number(data.sort_order || Date.now()),
        created_at: now(),
        updated_at: now()
      }
      const result = await this.db.collection("aicount_books").add(payload)
      return { code: 0, data: { upserted_id: result.id } }
    }
    throw new Error("BOOK_NOT_FOUND")
  },

  async remove(bookId) {
    const uid = await getUid(this)
    if (!bookId) throw new Error("BOOK_ID_REQUIRED")
    const direct = await this.db.collection("aicount_books")
      .where({ _id: bookId, user_id: uid, is_default: false, is_deleted: false })
      .limit(1)
      .get()
    if (direct.data.length) {
      await this.db.collection("aicount_books").doc(direct.data[0]._id)
        .update({ is_deleted: true, updated_at: now() })
      return { code: 0 }
    }
    await this.db.collection("aicount_books")
      .where({ system_key: bookId, user_id: uid, is_default: false, is_deleted: false })
      .update({ is_deleted: true, updated_at: now() })
    return { code: 0 }
  },

  async saveOrder(bookIds = []) {
    const uid = await getUid(this)
    const ids = Array.isArray(bookIds) ? bookIds.filter(Boolean) : []
    const existed = await this.db.collection("aicount_book_orders")
      .where({ user_id: uid })
      .limit(1)
      .get()
    const payload = { user_id: uid, book_ids: ids, updated_at: now() }
    if (existed.data.length) {
      await this.db.collection("aicount_book_orders").doc(existed.data[0]._id).update(payload)
    } else {
      await this.db.collection("aicount_book_orders").add({ ...payload, created_at: now() })
    }
    await Promise.all(ids.map((id, index) => this.db.collection("aicount_books")
      .where({ _id: id, user_id: uid })
      .update({ sort_order: index + 100, updated_at: now() })))
    return { code: 0 }
  }
}
