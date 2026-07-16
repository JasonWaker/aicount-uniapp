function getExtension(filePath) {
  const matched = String(filePath || "").match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  const extension = matched ? matched[1].toLowerCase() : "jpg"
  return ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg"
}

function isCloudFileId(value) {
  const text = String(value || "")
  return text.indexOf("cloud://") === 0 || text.indexOf("cloud:") === 0
}

function compressImage(filePath, quality = 80) {
  return new Promise((resolve) => {
    if (!filePath || typeof uni.compressImage !== "function") {
      resolve(filePath)
      return
    }

    uni.compressImage({
      src: filePath,
      quality,
      success: (result) => resolve(result.tempFilePath || filePath),
      fail: () => resolve(filePath)
    })
  })
}

async function uploadCloudFile(filePath, cloudPath) {
  const uploadPath = await compressImage(filePath)
  const result = await uniCloud.uploadFile({
    filePath: uploadPath,
    cloudPath
  })
  const fileID = result && (result.fileID || result.fileId)
  if (!fileID) {
    throw new Error("CLOUD_FILE_UPLOAD_FAILED")
  }
  return {
    fileID,
    filePath: uploadPath
  }
}

async function uploadEventBackground(filePath) {
  const extension = getExtension(filePath)
  const token = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  return uploadCloudFile(filePath, `event-backgrounds/${token}.${extension}`)
}

async function uploadTimelinePhoto(filePath, eventId, index = 0) {
  const extension = getExtension(filePath)
  const safeEventId = String(eventId || "unknown").replace(/[^\w-]/g, "_")
  const token = `${Date.now()}-${index + 1}-${Math.random().toString(16).slice(2, 8)}`
  return uploadCloudFile(filePath, `event-timeline/${safeEventId}/${token}.${extension}`)
}

function getCloudTempFileURL(fileID) {
  return new Promise((resolve, reject) => {
    if (!isCloudFileId(fileID) || typeof uniCloud === "undefined" || typeof uniCloud.getTempFileURL !== "function") {
      resolve(fileID)
      return
    }

    uniCloud.getTempFileURL({
      fileList: [fileID],
      success: (result) => {
        const list = result && result.fileList
        const item = Array.isArray(list) ? list[0] : null
        resolve((item && (item.tempFileURL || item.download_url)) || fileID)
      },
      fail: reject
    })
  })
}

module.exports = {
  getCloudTempFileURL,
  getExtension,
  isCloudFileId,
  uploadEventBackground,
  uploadTimelinePhoto
}
