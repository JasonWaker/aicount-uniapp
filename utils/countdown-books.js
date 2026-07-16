const cloudApi = require("../services/cloud-api")

const defaultCountdownBooks = [
  {
    id: "life",
    title: "\u751f\u6d3b",
    desc: "\u8bb0\u5f55\u7410\u788e\u65e5\u5e38\u4e2d\u7684\u7f8e\u597d",
    count: 8,
    icon: "heart",
    iconSrc: "/static/assets/icons/favorite.svg",
    activeIconSrc: "/static/assets/icons/favorite.svg",
    tone: "warm"
  },
  {
    id: "study",
    title: "\u5b66\u4e60",
    desc: "\u4e0d\u79ef\u8dec\u6b65\uff0c\u65e0\u4ee5\u81f3\u5343\u91cc",
    count: 5,
    icon: "school",
    iconSrc: "/static/assets/icons/school.svg",
    activeIconSrc: "/static/assets/icons/school.svg",
    tone: "blue"
  },
  {
    id: "anniversary",
    title: "\u7eaa\u5ff5\u65e5",
    desc: "\u6709\u4e9b\u65e5\u5b50\uff0c\u503c\u5f97\u94ed\u8bb0\u4e00\u751f",
    count: 3,
    icon: "cake",
    iconSrc: "/static/assets/icons/cake.svg",
    activeIconSrc: "/static/assets/icons/cake.svg",
    tone: "red"
  },
  {
    id: "work",
    title: "\u5de5\u4f5c",
    desc: "\u6709\u6761\u4e0d\u7d0a\uff0c\u5954\u8d74\u70ed\u7231",
    count: 12,
    icon: "work",
    iconSrc: "/static/assets/icons/work.svg",
    activeIconSrc: "/static/assets/icons/work.svg",
    tone: "purple"
  },
  {
    id: "travel",
    title: "\u65c5\u884c",
    desc: "\u53bb\u770b\u770b\u8fd9\u4e2a\u4e16\u754c\u5427",
    count: 4,
    icon: "explore",
    iconSrc: "/static/assets/icons/explore.svg",
    activeIconSrc: "/static/assets/icons/explore.svg",
    tone: "green"
  }
]

const CUSTOM_BOOK_STORAGE_KEY = "customCountdownBooks"
const BOOK_ORDER_STORAGE_KEY = "countdownBookOrder"
const BOOK_CACHE_STORAGE_KEY = "cloudCountdownBooks"

function normalizeBook(book, index) {
  const id = book.id || book.system_key || book._id || `custom-${index}`
  const title = book.title || book.label || "\u672a\u547d\u540d\u5012\u6570\u672c"
  const iconSrc = book.iconSrc || book.icon_url || book.icon || "/static/assets/icons/book.svg"
  const createdAt = Number(book.createdAt || book.created_at || 0)
  const updatedAt = Number(book.updatedAt || book.updated_at || createdAt || 0)

  return {
    id,
    _id: book._id || id,
    title,
    label: title,
    desc: book.desc || book.description || "\u7528\u6237\u521b\u5efa\u7684\u5012\u6570\u672c",
    count: Number(book.count || 0),
    icon: book.icon || book.icon_key || id,
    iconSrc,
    activeIconSrc: book.activeIconSrc || iconSrc,
    coverColor: book.coverColor || book.cover_color || "",
    coverImage: book.coverImage || book.cover_image_url || "",
    createdAt,
    updatedAt,
    tone: book.tone || "warm",
    isDefault: !!book.is_default || isDefaultCountdownBook(id)
  }
}

function inferCreatedAt(book, index, total) {
  const explicitTime = Number(book.createdAt || book.created_at || 0)
  if (explicitTime) return explicitTime
  const idTime = /^custom-(\d+)$/.exec(book.id || "")
  if (idTime) return Number(idTime[1])
  return total - index
}

function normalizeCustomBooks(customBooks) {
  const list = Array.isArray(customBooks) ? customBooks : []
  return list.map((book, index) => normalizeBook({
    ...book,
    createdAt: inferCreatedAt(book, index, list.length)
  }, index))
}

function getCachedCloudBooks() {
  try {
    return normalizeCustomBooks(uni.getStorageSync(BOOK_CACHE_STORAGE_KEY) || [])
  } catch (error) {
    return []
  }
}

function getCountdownBooks() {
  const cloudBooks = getCachedCloudBooks()
  if (cloudBooks.length) {
    return applyCountdownBookOrder(cloudBooks)
  }

  const customBooks = uni.getStorageSync(CUSTOM_BOOK_STORAGE_KEY) || []
  const normalizedCustoms = normalizeCustomBooks(customBooks)
  const customById = normalizedCustoms.reduce((map, book) => {
    map[book.id] = book
    return map
  }, {})
  const normalizedDefaults = defaultCountdownBooks.map((book, index) => normalizeBook({
    ...book,
    ...(customById[book.id] || {})
  }, index))
  const customOnlyBooks = normalizedCustoms
    .filter((book) => !isDefaultCountdownBook(book.id))
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))

  return applyCountdownBookOrder(normalizedDefaults.concat(customOnlyBooks))
}

async function refreshCountdownBooksFromCloud() {
  try {
    const res = await cloudApi.book().list()
    const books = (res && res.data ? res.data : []).map((book, index) => normalizeBook(book, index))
    if (books.length) {
      uni.setStorageSync(BOOK_CACHE_STORAGE_KEY, books)
      return applyCountdownBookOrder(books)
    }
  } catch (error) {
    console.warn("refresh books from cloud failed", error)
  }
  return getCountdownBooks()
}

function applyCountdownBookOrder(books) {
  const order = uni.getStorageSync(BOOK_ORDER_STORAGE_KEY) || []
  if (!Array.isArray(order) || !order.length) return books

  const bookById = books.reduce((map, book) => {
    map[book.id] = book
    return map
  }, {})
  const orderedBooks = order.map((id) => bookById[id]).filter(Boolean)
  const orderedIds = orderedBooks.reduce((map, book) => {
    map[book.id] = true
    return map
  }, {})
  return orderedBooks.concat(books.filter((book) => !orderedIds[book.id]))
}

function saveCountdownBookOrder(bookIds) {
  const ids = Array.isArray(bookIds)
    ? bookIds.filter((id) => typeof id === "string" && id)
    : []

  uni.setStorageSync(BOOK_ORDER_STORAGE_KEY, ids)
  try {
    cloudApi.book().saveOrder(ids)
  } catch (error) {
    console.warn("save book order to cloud failed", error)
  }
}

function getCountdownBookById(bookId) {
  return getCountdownBooks().find((book) => book.id === bookId || book._id === bookId) || null
}

function isDefaultCountdownBook(bookId) {
  return defaultCountdownBooks.some((book) => book.id === bookId)
}

function getCustomCountdownBooks() {
  return getCountdownBooks().filter((book) => !book.isDefault && !isDefaultCountdownBook(book.id))
}

function getCustomCountdownBookById(bookId) {
  return getCustomCountdownBooks().find((book) => book.id === bookId || book._id === bookId) || null
}

function upsertLocalBook(normalized) {
  const books = getCountdownBooks().filter((item) => item.id !== normalized.id && item._id !== normalized._id)
  const nextBooks = books.concat(normalized)
  uni.setStorageSync(BOOK_CACHE_STORAGE_KEY, nextBooks)

  const customBooks = getCustomCountdownBooks().filter((item) => item.id !== normalized.id)
  uni.setStorageSync(CUSTOM_BOOK_STORAGE_KEY, customBooks.concat(normalized))
}

function toCloudBookPayload(normalized) {
  return {
    _id: normalized._id || normalized.id,
    id: normalized._id || normalized.id,
    system_key: isDefaultCountdownBook(normalized.id) ? normalized.id : "",
    title: normalized.title,
    description: normalized.desc,
    icon_key: normalized.icon,
    icon_url: normalized.iconSrc,
    cover_color: normalized.coverColor,
    cover_image_url: normalized.coverImage,
    sort_order: normalized.createdAt
  }
}

async function persistBookToCloud(normalized, isExisting) {
  const payload = toCloudBookPayload(normalized)
  if (isExisting) {
    const result = await cloudApi.book().update(normalized._id || normalized.id, payload)
    if (result && result.data && result.data.upserted_id) {
      normalized._id = result.data.upserted_id
    }
    return result
  }
  const result = await cloudApi.book().create(payload)
  if (result && result.data && result.data._id) {
    normalized._id = result.data._id
  }
  return result
}

function saveCustomCountdownBook(book) {
  const now = Date.now()
  const normalized = normalizeBook({
    ...book,
    id: book.id || `custom-${now}`,
    _id: book._id || book.id || `custom-${now}`,
    createdAt: book.createdAt || now,
    updatedAt: now
  })

  upsertLocalBook(normalized)
  Promise.resolve(persistBookToCloud(normalized, !!(book.id || book._id))).catch((error) => {
    console.warn("save book to cloud failed", error)
  })
  return normalized
}

async function saveCustomCountdownBookAsync(book) {
  const now = Date.now()
  const normalized = normalizeBook({
    ...book,
    id: book.id || `custom-${now}`,
    _id: book._id || book.id || `custom-${now}`,
    createdAt: book.createdAt || now,
    updatedAt: now
  })
  upsertLocalBook(normalized)
  await persistBookToCloud(normalized, !!(book.id || book._id))
  upsertLocalBook(normalized)
  return normalized
}

function deleteCustomCountdownBook(bookId) {
  const fallbackBook = getCountdownBookById(bookId)
  const nextBooks = getCountdownBooks().filter((book) => book.id !== bookId && book._id !== bookId)
  uni.setStorageSync(BOOK_CACHE_STORAGE_KEY, nextBooks)
  uni.setStorageSync(CUSTOM_BOOK_STORAGE_KEY, nextBooks.filter((book) => !book.isDefault))
  try {
    const cloudBookId = fallbackBook && isDefaultCountdownBook(fallbackBook.id)
      ? fallbackBook.id
      : (fallbackBook && fallbackBook._id ? fallbackBook._id : bookId)
    Promise.resolve(cloudApi.book().remove(cloudBookId)).catch((error) => {
      console.warn("delete book from cloud failed", error)
    })
  } catch (error) {
    console.warn("delete book from cloud failed", error)
  }
  return fallbackBook
}

function getSelectedCountdownBook() {
  const books = getCountdownBooks()
  const stored = uni.getStorageSync("selectedCountdownBook")

  if (!stored) return books[0]

  const matched = books.find((book) => book.id === stored.id || book._id === stored._id || book.title === stored.title || book.title === stored.label)
  return matched || normalizeBook(stored)
}

module.exports = {
  BOOK_CACHE_STORAGE_KEY,
  BOOK_ORDER_STORAGE_KEY,
  CUSTOM_BOOK_STORAGE_KEY,
  deleteCustomCountdownBook,
  defaultCountdownBooks,
  getCustomCountdownBookById,
  getCustomCountdownBooks,
  getCountdownBookById,
  getCountdownBooks,
  getSelectedCountdownBook,
  isDefaultCountdownBook,
  refreshCountdownBooksFromCloud,
  saveCountdownBookOrder,
  saveCustomCountdownBook,
  saveCustomCountdownBookAsync
}
