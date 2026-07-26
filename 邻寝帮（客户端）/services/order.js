const STORAGE_KEY = 'orders_data'
const USER_KEY = 'user_profile'
const EVENT_KEY = 'order_events'
const CLOUD_SYNC_KEY = 'cloud_sync_queue'
import bridgeClient from './bridge-client.js'

const RANDOM_TABLE = [
  23, 45, 67, 89, 12, 34, 56, 78, 90, 11,
  33, 55, 77, 99, 22, 44, 66, 88, 10, 31,
  53, 75, 97, 14, 36, 58, 80, 13, 35, 57,
  79, 91, 24, 46, 68, 82, 15, 37, 59, 71,
  93, 26, 48, 60, 84, 16, 38, 50, 72, 94,
  27, 49, 61, 83, 17, 39, 51, 73, 95, 28,
  40, 62, 85, 18, 32, 54, 76, 98, 29, 41,
  63, 86, 19, 42, 64, 87, 20, 43, 65, 81
]

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

let cloudAvailable = null
let cloudChecked = false

function getOrders() {
  try {
    return uni.getStorageSync(STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

function saveOrders(orders) {
  try {
    uni.setStorageSync(STORAGE_KEY, orders)
    console.log('[orderService] 保存订单成功，共', orders.length, '条')
  } catch (e) {
    console.error('保存订单失败:', e)
  }
}

function notifyOrderChanged() {
  try {
    const timestamp = Date.now()
    uni.setStorageSync(EVENT_KEY, timestamp)
    console.log('[orderService] 通知订单变更:', timestamp)
  } catch (e) {}
}

export function onOrderChanged(callback) {
  if (typeof callback !== 'function') return
  if (!onOrderChanged._callbacks) {
    onOrderChanged._callbacks = []
  }
  onOrderChanged._callbacks.push(callback)
  
  if (!onOrderChanged._timer) {
    onOrderChanged._lastEvent = uni.getStorageSync(EVENT_KEY)
    onOrderChanged._timer = setInterval(() => {
      const currentEvent = uni.getStorageSync(EVENT_KEY)
      if (currentEvent && currentEvent !== onOrderChanged._lastEvent) {
        onOrderChanged._lastEvent = currentEvent
        if (onOrderChanged._callbacks) {
          onOrderChanged._callbacks.forEach(cb => {
            try { cb() } catch (e) {}
          })
        }
      }
    }, 1000)
  }
}

export function offOrderChanged() {
  if (onOrderChanged._timer) {
    clearInterval(onOrderChanged._timer)
    onOrderChanged._timer = null
  }
  onOrderChanged._callbacks = []
}

function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  let randomPart = ''
  for (let i = 0; i < 4; i++) {
    const tableIndex = RANDOM_TABLE[Math.floor(Math.random() * RANDOM_TABLE.length)]
    randomPart += tableIndex.toString().padStart(2, '0')
  }

  let charPart = ''
  for (let i = 0; i < 3; i++) {
    charPart += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }

  return `NO${year}${month}${day}${hours}${minutes}${seconds}${randomPart}${charPart}`
}

function getCurrentTimeString() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

async function getCurrentLocation() {
  return new Promise((resolve) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          address: ''
        })
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

function addToSyncQueue(action, method, args) {
  try {
    const queue = uni.getStorageSync(CLOUD_SYNC_KEY) || []
    queue.push({
      action,
      method,
      args: JSON.stringify(args),
      retries: 0,
      created_at: Date.now()
    })
    uni.setStorageSync(CLOUD_SYNC_KEY, queue)
  } catch (e) {}
}

function getSyncQueue() {
  try {
    return uni.getStorageSync(CLOUD_SYNC_KEY) || []
  } catch (e) {
    return []
  }
}

async function checkCloudAvailable() {
  if (cloudChecked) return cloudAvailable
  cloudChecked = true
  try {
    const result = await uniCloud.callFunction({
      name: 'orderProxy',
      data: { action: 'ping' }
    })
    cloudAvailable = result && result.result && result.result.errCode === 0
  } catch (error) {
    cloudAvailable = false
  }
  return cloudAvailable
}

async function tryCloud(method, ...args) {
  if (cloudAvailable === false) {
    return null
  }
  
  if (!cloudChecked) {
    await checkCloudAvailable()
    if (cloudAvailable === false) {
      return null
    }
  }
  
  try {
    const result = await uniCloud.callFunction({
      name: 'orderProxy',
      data: {
        action: method,
        args: args
      }
    })
    if (result && result.result) {
      cloudAvailable = true
      return result.result
    }
    return null
  } catch (error) {
    cloudAvailable = false
    console.warn(`云函数调用失败 [${method}]:`, error.message)
    return null
  }
}

async function syncToCloud() {
  const queue = getSyncQueue()
  if (queue.length === 0) return

  const newQueue = []
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i]
    try {
      const args = JSON.parse(item.args)
      const result = await uniCloud.callFunction({
        name: 'orderProxy',
        data: {
          action: item.method,
          args: args
        }
      })
      if (result && result.result && result.result.errCode === 0) {
        cloudAvailable = true
      } else {
        item.retries++
        if (item.retries < 5) newQueue.push(item)
      }
    } catch (e) {
      item.retries++
      if (item.retries < 5) newQueue.push(item)
    }
  }

  uni.setStorageSync(CLOUD_SYNC_KEY, newQueue)
}

export const orderService = {
  async add(data) {
    const {
      category, itemType, itemWeight, title, description,
      pickupAddress, deliveryAddress, pickupLocation, deliveryLocation,
      pickupTimeRange, price, urgency, deliveryTime, images, remark,
      contactPhone, userName
    } = data

    if (!category || !itemType || !title || !pickupAddress || !deliveryAddress || !price) {
      return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
    }

    const userInfo = uni.getStorageSync(USER_KEY) || {}
    const orderPrice = Number(price) || 5
    const platformFee = orderPrice * 0.02
    const serviceFee = orderPrice * 0.1
    const riderIncome = orderPrice - platformFee - serviceFee

    const currentLocation = await getCurrentLocation()
    const currentTime = getCurrentTimeString()

    const orderNo = generateOrderNo()
    const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

    const orderData = {
      _id: localId,
      orderNo,
      user_id: userInfo.uid || 'local_user',
      user_name: userName || userInfo.name || '',
      category,
      itemType,
      itemWeight: itemWeight || 'light',
      title,
      description: description || '',
      pickupAddress,
      deliveryAddress,
      pickupLocation: pickupLocation || currentLocation || null,
      deliveryLocation: deliveryLocation || null,
      pickupTimeRange: pickupTimeRange || null,
      price: orderPrice,
      serviceFee: Math.round(serviceFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      riderIncome: Math.round(riderIncome * 100) / 100,
      urgency: urgency || 'normal',
      deliveryTime: deliveryTime || '',
      images: images || [],
      remark: remark || '',
      contactPhone: contactPhone || '',
      status: 'pending_payment',
      rider_id: null,
      rider_name: '',
      rider_phone: '',
      created_at: Date.now(),
      created_time: currentTime,
      updated_at: Date.now(),
      location: currentLocation
    }

    const orders = getOrders()
    orders.unshift(orderData)
    saveOrders(orders)
    notifyOrderChanged()
    console.log('[orderService] 订单已保存到本地存储，订单ID:', orderData._id, '订单号:', orderNo)

    bridgeClient.saveOrder(orderData).then(bridgeResult => {
      if (bridgeResult) {
        console.log('[orderService] 桥接服务器同步成功')
      } else {
        console.warn('[orderService] 桥接服务器不可用，订单仅本地保存')
      }
    }).catch(() => {})

    const cloudResult = await tryCloud('add', orderData)
    console.log('[orderService] 云端下单结果:', cloudResult)
    
    if (cloudResult && cloudResult.errCode === 0) {
      if (cloudResult.data && cloudResult.data.id) {
        orderData._id = cloudResult.data.id
        saveOrders(getOrders().map(o => o._id === localId ? orderData : o))
        console.log('[orderService] 订单ID已更新为云端ID:', orderData._id)
      }
    } else {
      addToSyncQueue('add', 'add', [orderData])
      console.log('[orderService] 订单已添加到同步队列，等待云端同步')
    }

    return {
      errCode: 0,
      errMsg: '下单成功',
      data: {
        id: orderData._id,
        orderNo,
        price: orderPrice,
        serviceFee: orderData.serviceFee,
        platformFee: orderData.platformFee,
        location: currentLocation,
        synced: !!cloudResult
      }
    }
  },

  async acceptOrder(id, riderInfo = {}) {
    const orders = getOrders()
    const index = orders.findIndex(o => o._id === id)
    if (index === -1) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
    if (orders[index].status !== 'pending') {
      return { errCode: 'INVALID_STATUS', errMsg: '订单状态不正确，无法接单' }
    }

    orders[index] = {
      ...orders[index],
      status: 'accepted',
      rider_id: riderInfo.rider_id || null,
      rider_name: riderInfo.rider_name || '',
      accepted_at: Date.now(),
      updated_at: Date.now()
    }
    saveOrders(orders)
    
    try {
      const statusRecords = uni.getStorageSync('order_status') || {}
      statusRecords[id] = { status: 'accepted', updatedAt: Date.now() }
      uni.setStorageSync('order_status', statusRecords)
    } catch (e) {}
    
    notifyOrderChanged()
    addToSyncQueue('acceptOrder', 'acceptOrder', [id, riderInfo])

    try {
      await tryCloud('acceptOrder', id, riderInfo)
    } catch (e) {}

    return { errCode: 0, errMsg: '接单成功', data: orders[index] }
  },

  async list(params = {}) {
    const cloudResult = await tryCloud('list', params)
    if (cloudResult && cloudResult.errCode === 0 && cloudResult.data) {
      const localOrders = getOrders()
      const localOnly = localOrders.filter(o => !o._id.startsWith('local_'))
      return {
        errCode: 0,
        errMsg: '获取成功',
        data: {
          list: [...cloudResult.data.list, ...localOnly],
          total: cloudResult.data.total + localOnly.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      }
    }

    const { status, category, page = 1, pageSize = 10, type = 'all', uid } = params
    let orders = getOrders()

    if (type === 'user' && uid) {
      orders = orders.filter(o => o.user_id === uid)
    } else if (type === 'rider' && uid) {
      orders = orders.filter(o => o.rider_id === uid)
    }

    if (status) {
      orders = orders.filter(o => o.status === status)
    }

    if (category) {
      orders = orders.filter(o => o.category === category)
    }

    const total = orders.length
    const start = (page - 1) * pageSize
    const list = orders.slice(start, start + pageSize)

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: { list, total, page, pageSize }
    }
  },

  async detail(id) {
    if (!id) return { errCode: 'PARAM_ERROR', errMsg: '缺少订单ID' }

    const cloudResult = await tryCloud('detail', id)
    if (cloudResult && cloudResult.errCode === 0) {
      return cloudResult
    }

    const orders = getOrders()
    const order = orders.find(o => o._id === id)
    if (!order) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
    
    // 合并取货凭证数据
    try {
      const proofsData = uni.getStorageSync('pickup_proofs')
      if (proofsData && proofsData[id]) {
        order.pickup_proofs = proofsData[id].images || []
        order.pickup_proofs_count = (proofsData[id].images || []).length
        order.proofs_uploaded_at = proofsData[id].uploadedAt
      }
    } catch (e) {}
    
    return { errCode: 0, errMsg: '获取成功', data: order }
  },

  async updateStatus(id, status, extraData = {}) {
    if (!id || !status) return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }

    bridgeClient.updateOrderStatus(id, status, extraData).then(() => {}).catch(() => {})

    const cloudResult = await tryCloud('updateStatus', id, status, extraData)
    if (cloudResult && cloudResult.errCode === 0) {
      const orders = getOrders()
      const index = orders.findIndex(o => o._id === id)
      if (index !== -1) {
        orders[index] = { ...orders[index], status, updated_at: Date.now(), ...extraData }
        saveOrders(orders)
        // 同步更新 order_status 记录
        try {
          const statusRecords = uni.getStorageSync('order_status') || {}
          statusRecords[id] = { status, updatedAt: Date.now() }
          uni.setStorageSync('order_status', statusRecords)
        } catch (e) {}
        notifyOrderChanged()
      }
      return cloudResult
    }

    const orders = getOrders()
    const index = orders.findIndex(o => o._id === id)
    if (index === -1) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }

    const updateData = { status, updated_at: Date.now() }

    if (status === 'accepted' && extraData.rider_id) {
      updateData.rider_id = extraData.rider_id
      updateData.rider_name = extraData.rider_name || ''
      updateData.rider_phone = extraData.rider_phone || ''
      updateData.accepted_at = Date.now()
    }

    if (status === 'picking') {
      updateData.picking_at = Date.now()
      if (extraData.proofsUploaded) updateData.proofsUploaded = extraData.proofsUploaded
      if (extraData.proofsCount) updateData.proofsCount = extraData.proofsCount
    }

    if (status === 'delivered') {
      updateData.delivered_at = Date.now()
    }

    if (status === 'completed') {
      updateData.completed_at = Date.now()
      if (extraData.rating) updateData.rating = extraData.rating
    }

    if (status === 'cancelled') {
      updateData.cancelled_at = Date.now()
      if (extraData.cancelReason) updateData.cancelReason = extraData.cancelReason
    }

    orders[index] = { ...orders[index], ...updateData }
    saveOrders(orders)
    
    // 同步更新 order_status 记录
    try {
      const statusRecords = uni.getStorageSync('order_status') || {}
      statusRecords[id] = {
        status: status,
        updatedAt: Date.now(),
        ...updateData
      }
      uni.setStorageSync('order_status', statusRecords)
    } catch (e) {}
    
    notifyOrderChanged()

    addToSyncQueue('updateStatus', 'updateStatus', [id, status, extraData])

    return { errCode: 0, errMsg: '状态更新成功' }
  },

  async confirmReceipt(id) {
    const orders = getOrders()
    const index = orders.findIndex(o => o._id === id)
    if (index === -1) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }
    if (orders[index].status !== 'delivered' && orders[index].status !== 'completed') {
      return { errCode: 'INVALID_STATUS', errMsg: '订单状态不正确' }
    }

    bridgeClient.updateOrderStatus(id, 'completed', {}).then(() => {}).catch(() => {})

    const cloudResult = await tryCloud('updateStatus', id, 'completed', {})

    orders[index] = {
      ...orders[index],
      status: 'completed',
      completed_at: Date.now(),
      updated_at: Date.now(),
      receipt_confirmed: true
    }
    saveOrders(orders)
    
    // 同步更新 order_status 记录
    try {
      const statusRecords = uni.getStorageSync('order_status') || {}
      statusRecords[id] = {
        status: 'completed',
        updatedAt: Date.now(),
        completed_at: Date.now()
      }
      uni.setStorageSync('order_status', statusRecords)
    } catch (e) {}
    
    notifyOrderChanged()

    addToSyncQueue('updateStatus', 'updateStatus', [id, 'completed', {}])

    return { errCode: 0, errMsg: '确认收货成功', data: orders[index] }
  },

  async grab(id, riderId, riderName = '', riderPhone = '') {
    if (!id || !riderId) return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }

    bridgeClient.updateOrderStatus(id, 'accepted', {
      rider_id: riderId,
      rider_name: riderName,
      rider_phone: riderPhone
    }).then(() => {}).catch(() => {})

    const cloudResult = await tryCloud('grab', id, riderId, riderName, riderPhone)
    if (cloudResult && cloudResult.errCode === 0) {
      const orders = getOrders()
      const index = orders.findIndex(o => o._id === id)
      if (index !== -1) {
        orders[index] = {
          ...orders[index],
          status: 'accepted',
          rider_id: riderId,
          rider_name: riderName,
          rider_phone: riderPhone,
          accepted_at: Date.now(),
          updated_at: Date.now()
        }
        saveOrders(orders)
        notifyOrderChanged()
      }
      return cloudResult
    }

    const orders = getOrders()
    const index = orders.findIndex(o => o._id === id)
    if (index === -1) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }

    const order = orders[index]
    if (order.status !== 'pending') return { errCode: 'STATUS_ERROR', errMsg: '订单已被接单或已取消' }
    if (order.rider_id) return { errCode: 'ALREADY_GRABBED', errMsg: '订单已被其他骑手接走' }

    orders[index] = {
      ...order,
      status: 'accepted',
      rider_id: riderId,
      rider_name: riderName,
      rider_phone: riderPhone,
      accepted_at: Date.now(),
      updated_at: Date.now()
    }
    saveOrders(orders)
    notifyOrderChanged()

    addToSyncQueue('grab', 'grab', [id, riderId, riderName, riderPhone])

    return {
      errCode: 0,
      errMsg: '接单成功',
      data: {
        id,
        orderNo: order.orderNo,
        title: order.title,
        category: order.category,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        price: order.price,
        status: 'accepted'
      }
    }
  },

  async getPendingOrders(params = {}) {
    console.log('[orderService] getPendingOrders 被调用，参数:', params)
    
    try {
      const cloudResult = await tryCloud('getPendingOrders', params)
      console.log('[orderService] 云端获取结果:', cloudResult)
      
      if (cloudResult && cloudResult.errCode === 0) {
        const localOrders = getOrders().filter(o => o.status === 'pending')
        const cloudIds = new Set((cloudResult.data || []).map(o => o._id))
        const localOnly = localOrders.filter(o => !cloudIds.has(o._id))
        console.log('[orderService] 本地待处理订单:', localOrders.length, '云端:', (cloudResult.data || []).length, '仅本地:', localOnly.length)
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: [...(cloudResult.data || []), ...localOnly]
        }
      }
    } catch (e) {
      console.warn('[orderService] 云端获取失败，使用本地数据:', e.message)
    }

    const { category, pageSize = 20 } = params || {}
    let orders = getOrders().filter(o => o.status === 'pending')
    if (category) orders = orders.filter(o => o.category === category)
    orders = orders.slice(0, pageSize)
    console.log('[orderService] 从本地存储获取待处理订单:', orders.length, '条')

    return { errCode: 0, errMsg: '获取成功', data: orders }
  },

  async getDashboard(params = {}) {
    const cloudResult = await tryCloud('getDashboard', params)
    if (cloudResult && cloudResult.errCode === 0 && cloudResult.data) {
      return cloudResult
    }

    const { days = 7 } = params || {}
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000
    const orders = getOrders().filter(o => o.created_at >= startTime)

    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const activeRiders = new Set(orders.map(o => o.rider_id).filter(Boolean)).size
    const platformRevenue = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0)
    const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0)
    const riderIncome = orders.reduce((sum, o) => sum + (o.riderIncome || 0), 0)
    const serviceFee = orders.reduce((sum, o) => sum + (o.serviceFee || 0), 0)

    const ratedOrders = orders.filter(o => o.rating)
    const totalRating = ratedOrders.reduce((sum, o) => sum + (o.rating ? o.rating.score : 5), 0)
    const goodRate = ratedOrders.length > 0 ? Math.round((totalRating / (ratedOrders.length * 5)) * 100) / 100 : 1.0

    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayOrders = orders.filter(o => o.created_at >= dayStart.getTime() && o.created_at < dayEnd.getTime())
      dailyStats.push({
        date: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.price || 0), 0)
      })
    }

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        totalOrders,
        completedOrders,
        activeRiders,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        riderIncome: Math.round(riderIncome * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        goodRate,
        dailyStats,
        topRiders: []
      }
    }
  },

  async countByStatus(params = {}) {
    const cloudResult = await tryCloud('countByStatus', params)
    if (cloudResult && cloudResult.errCode === 0) {
      return cloudResult
    }

    const { userType = 'user', uid, status } = params || {}
    let orders = getOrders()
    if (userType === 'user' && uid) orders = orders.filter(o => o.user_id === uid)
    else if (userType === 'rider' && uid) orders = orders.filter(o => o.rider_id === uid)
    if (status) orders = orders.filter(o => o.status === status)
    return { errCode: 0, errMsg: '获取成功', data: { count: orders.length } }
  },

  async syncPending() {
    await syncToCloud()
    const queue = getSyncQueue()
    return { pendingCount: queue.length }
  },

  async submitReview(orderId, reviewData) {
    try {
      const cloudResult = await tryCloud('submitReview', [orderId, reviewData])
      if (cloudResult && cloudResult.errCode === 0) {
        const orders = getOrders()
        const index = orders.findIndex(o => String(o._id) === String(orderId))
        if (index !== -1) {
          orders[index].rating = reviewData
          orders[index].reviewed_at = Date.now()
          orders[index].updated_at = Date.now()
          saveOrders(orders)
          notifyOrderChanged()
          bridgeClient.saveOrder(orders[index]).then(() => {}).catch(() => {})
        }
        return cloudResult
      }
    } catch (e) {
      console.warn('[orderService] 云端评价失败，使用本地:', e.message)
    }

    const orders = getOrders()
    const index = orders.findIndex(o => String(o._id) === String(orderId))
    if (index === -1) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }

    const order = orders[index]
    if (order.status !== 'completed') {
      return { errCode: 'INVALID_STATUS', errMsg: '订单未完成，无法评价' }
    }
    if (order.rating && order.rating.score) {
      return { errCode: 'ALREADY_REVIEWED', errMsg: '您已评价过该订单' }
    }

    const ratingData = {
      score: reviewData.score,
      dimensions: reviewData.dimensions || {},
      tags: reviewData.tags || [],
      comment: reviewData.comment || '',
      created_at: Date.now()
    }

    orders[index] = {
      ...order,
      rating: ratingData,
      reviewed_at: Date.now(),
      updated_at: Date.now()
    }
    saveOrders(orders)
    notifyOrderChanged()

    bridgeClient.saveOrder(orders[index]).then(() => {}).catch(() => {})

    addToSyncQueue('submitReview', 'submitReview', [orderId, reviewData])

    return {
      errCode: 0,
      errMsg: '评价提交成功',
      data: {
        orderId,
        rating: ratingData
      }
    }
  },

  async getReview(orderId) {
    try {
      const cloudResult = await tryCloud('getReview', [orderId])
      if (cloudResult && cloudResult.errCode === 0) {
        return cloudResult
      }
    } catch (e) {
      console.warn('[orderService] 云端获取评价失败，使用本地:', e.message)
    }

    const orders = getOrders()
    const order = orders.find(o => String(o._id) === String(orderId))
    if (!order) return { errCode: 'NOT_FOUND', errMsg: '订单不存在' }

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        orderId,
        rating: order.rating || null,
        reviewed_at: order.reviewed_at || null
      }
    }
  },

  isCloudAvailable() {
    return cloudAvailable
  }
}

export default orderService
