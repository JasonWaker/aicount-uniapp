function getWindowMetrics() {
  if (uni.getWindowInfo) {
    return uni.getWindowInfo()
  }

  return uni.getSystemInfoSync()
}

function getDeviceMetrics() {
  return {
    ...(uni.getDeviceInfo ? uni.getDeviceInfo() : {}),
    ...(uni.getAppBaseInfo ? uni.getAppBaseInfo() : {}),
    ...getWindowMetrics()
  }
}

module.exports = {
  getDeviceMetrics,
  getWindowMetrics
}
