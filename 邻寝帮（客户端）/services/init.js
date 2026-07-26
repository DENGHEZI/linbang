const USER_KEY = 'user_profile'
const RIDER_KEY = 'rider_profile'
const INIT_FLAG_KEY = 'app_initialized'
const SYNC_QUEUE_KEY = 'cloud_sync_queue'
const SYNC_STATUS_KEY = 'cloud_sync_status'
import bridgeClient from './bridge-client.js'

const DEFAULT_USER = {
  id: 'user_' + Date.now(),
  nickname: '邻寝帮用户',
  avatar: '',
  phone: '138****8888',
  school: '华南理工大学',
  studentId: '20240001',
  verified: false,
  role: 'user',
  balance: 100.00,
  orderCount: 0,
  createdAt: Date.now()
}

const DEFAULT_RIDER = {
  id: 'rider_R001',
  nickname: '骑手小李',
  avatar: '',
  phone: '139****6666',
  school: '华南理工大学',
  studentId: '20230001',
  verified: true,
  isOnline: true,
  rating: 4.9,
  totalOrders: 23,
  completedOrders: 23,
  todayEarnings: 38.50,
  todayOrders: 5,
  totalEarnings: 1286.00,
  weekEarnings: 268.00,
  monthEarnings: 1068.00,
  weekRank: 12,
  joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000
}

function initUser() {
  try {
    let user = uni.getStorageSync(USER_KEY)
    if (!user) {
      user = { ...DEFAULT_USER }
      uni.setStorageSync(USER_KEY, user)
      return user
    }
    let changed = false
    for (const key in DEFAULT_USER) {
      if (!(key in user)) {
        user[key] = DEFAULT_USER[key]
        changed = true
      }
    }
    if (changed) {
      uni.setStorageSync(USER_KEY, user)
    }
    return user
  } catch (e) {
    return { ...DEFAULT_USER }
  }
}

function initRider() {
  try {
    let rider = uni.getStorageSync(RIDER_KEY)
    if (!rider) {
      rider = { ...DEFAULT_RIDER }
      try {
        const user = uni.getStorageSync(USER_KEY)
        if (user && user.school && user.school !== DEFAULT_USER.school) {
          rider.school = user.school
        }
        if (user && user.nickname && user.nickname !== DEFAULT_USER.nickname) {
          rider.nickname = user.nickname
        }
        if (user && user.phone && user.phone !== DEFAULT_USER.phone) {
          rider.phone = user.phone
        }
      } catch (e) {}
      uni.setStorageSync(RIDER_KEY, rider)
      return rider
    }
    let changed = false
    for (const key in DEFAULT_RIDER) {
      if (!(key in rider)) {
        rider[key] = DEFAULT_RIDER[key]
        changed = true
      }
    }
    try {
      const user = uni.getStorageSync(USER_KEY)
      if (user && user.school && rider.school !== user.school) {
        rider.school = user.school
        changed = true
      }
    } catch (e) {}
    if (changed) {
      uni.setStorageSync(RIDER_KEY, rider)
    }
    return rider
  } catch (e) {
    return { ...DEFAULT_RIDER }
  }
}

function addToSyncQueue(type, data) {
  try {
    let queue = uni.getStorageSync(SYNC_QUEUE_KEY) || []
    queue.push({
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    })
    uni.setStorageSync(SYNC_QUEUE_KEY, queue)
  } catch (e) {}
}

async function processSyncQueue() {
  try {
    let queue = uni.getStorageSync(SYNC_QUEUE_KEY) || []
    if (queue.length === 0) return

    const remaining = []
    for (const item of queue) {
      try {
        if (item.type === 'order') {
          await uniCloud.callFunction({
            name: 'orderProxy',
            data: { action: 'add', args: [item.data] }
          })
        } else if (item.type === 'user') {
          await uniCloud.callFunction({
            name: 'userProxy',
            data: { action: 'syncLocalData', args: [item.data] }
          })
        } else if (item.type === 'bankCard') {
          await uniCloud.callFunction({
            name: 'userProxy',
            data: { action: 'addBankCard', args: [item.data] }
          })
        } else if (item.type === 'riderEarnings') {
          await uniCloud.callFunction({
            name: 'userProxy',
            data: { action: 'updateRiderEarnings', args: [item.data.args], riderId: item.data.riderId }
          })
        }
      } catch (e) {
        item.retries = (item.retries || 0) + 1
        if (item.retries < 3) {
          remaining.push(item)
        }
      }
    }
    uni.setStorageSync(SYNC_QUEUE_KEY, remaining)
  } catch (e) {
    console.warn('[init] 同步队列处理失败:', e.message)
  }
}

function updateSyncStatus(status, message) {
  try {
    uni.setStorageSync(SYNC_STATUS_KEY, {
      status,
      message,
      updated_at: Date.now()
    })
  } catch (e) {}
}

export const initService = {
  async init() {
    try {
      updateSyncStatus('initializing', '正在初始化...')
      
      const user = initUser()
      const rider = initRider()
      
      const walletData = uni.getStorageSync('wallet_data')
      if (!walletData) {
        uni.setStorageSync('wallet_data', {
          balance: 100.00,
          totalIncome: 0,
          totalExpense: 0,
          updated_at: Date.now()
        })
      } else {
        let walletChanged = false
        const defaults = { balance: 100.00, totalIncome: 0, totalExpense: 0 }
        for (const key in defaults) {
          if (!(key in walletData)) {
            walletData[key] = defaults[key]
            walletChanged = true
          }
        }
        if (walletChanged) {
          uni.setStorageSync('wallet_data', walletData)
        }
      }
      
      const transactions = uni.getStorageSync('wallet_transactions')
      if (!transactions || transactions.length === 0) {
        uni.setStorageSync('wallet_transactions', [])
      }
      
      const bankCards = uni.getStorageSync('bank_cards')
      if (!bankCards || bankCards.length === 0) {
        uni.setStorageSync('bank_cards', [{
          id: 'card_default',
          bankCode: 'CMB',
          bankName: '招商银行',
          cardNumber: '6225 **** **** 8888',
          cardHolder: '邻寝帮用户',
          last4: '8888',
          isDefault: true,
          created_at: Date.now()
        }])
      }
      
      if (!uni.getStorageSync('orders_data')) {
        uni.setStorageSync('orders_data', [])
      }
      if (!uni.getStorageSync('order_status')) {
        uni.setStorageSync('order_status', {})
      }
      if (!uni.getStorageSync('rider_pending_orders')) {
        uni.setStorageSync('rider_pending_orders', [])
      }
      if (!uni.getStorageSync('rider_completed_orders')) {
        uni.setStorageSync('rider_completed_orders', [])
      }
      if (!uni.getStorageSync('rider_settled_orders')) {
        uni.setStorageSync('rider_settled_orders', [])
      }
      if (!uni.getStorageSync('campus_custom_school')) {
        uni.setStorageSync('campus_custom_school', '')
      }
      if (!uni.getStorageSync('campus_custom_schools')) {
        uni.setStorageSync('campus_custom_schools', [])
      }
      
      uni.setStorageSync(INIT_FLAG_KEY, true)
      
      const cloudOk = await this.checkCloudConnection()
      if (cloudOk) {
        updateSyncStatus('syncing', '正在同步数据到云端...')
        await this.syncAllToCloud()
        updateSyncStatus('synced', '数据已同步到云端')
      } else {
        updateSyncStatus('local_only', '云端未连接，数据仅本地保存')
      }
      
      return {
        errCode: 0,
        data: { user, rider, cloudReady: cloudOk }
      }
    } catch (e) {
      console.error('[init] 初始化失败:', e)
      updateSyncStatus('error', '初始化失败: ' + e.message)
      return { errCode: -1, errMsg: e.message }
    }
  },

  async checkCloudConnection() {
    try {
      const result = await uniCloud.callFunction({
        name: 'orderProxy',
        data: { action: 'ping' }
      })
      if (result && result.result && result.result.errCode === 0) {
        console.log('[init] 云端连接成功')
        return true
      }
      console.warn('[init] 云端返回异常:', result?.result?.errMsg)
      return false
    } catch (e) {
      console.warn('[init] 云端连接失败:', e.message)
      console.warn('[init] 请在HBuilderX中:')
      console.warn('  1. 右键 uniCloud-aliyun -> 关联云服务空间')
      console.warn('  2. 右键 cloudfunctions -> 上传部署所有云函数')
      console.warn('  3. 右键 database -> 上传所有DB Schema')
      return false
    }
  },

  async syncAllToCloud() {
    console.log('[init] 开始全量同步数据到云端...')
    try {
      const user = initUser()
      await this.syncUserToCloud(user)
      await this.syncAllOrdersToCloud()
      await this.syncBankCardsToCloud()
      await processSyncQueue()
      console.log('[init] 全量同步完成')
    } catch (e) {
      console.warn('[init] 全量同步异常:', e.message)
    }
  },

  async syncAllOrdersToCloud() {
    try {
      const orders = uni.getStorageSync('orders_data') || []
      if (orders.length === 0) {
        return
      }
      
      let syncedCount = 0
      for (const order of orders) {
        if (order._id && order._id.startsWith('local_')) {
          try {
            const result = await uniCloud.callFunction({
              name: 'orderProxy',
              data: {
                action: 'add',
                args: [{
                  ...order,
                  _id: undefined
                }]
              }
            })
            if (result && result.result && result.result.errCode === 0) {
              order._id = result.result.data.id
              syncedCount++
            }
          } catch (e) {
            addToSyncQueue('order', { ...order, _id: undefined })
          }
        }
      }
      
      uni.setStorageSync('orders_data', orders)
      if (syncedCount > 0) {
        console.log('[init] 已同步', syncedCount, '个订单到云端')
      }
    } catch (e) {
      console.warn('[init] 订单同步异常:', e.message)
    }
  },

  async syncBankCardsToCloud() {
    try {
      const cards = uni.getStorageSync('bank_cards') || []
      for (const card of cards) {
        if (card._id && card._id.startsWith('local_')) {
          try {
            await uniCloud.callFunction({
              name: 'userProxy',
              data: {
                action: 'addBankCard',
                args: [{
                  bankCode: card.bankCode,
                  cardNumber: card.cardNumber,
                  cardHolder: card.cardHolder
                }]
              }
            })
          } catch (e) {
            addToSyncQueue('bankCard', {
              bankCode: card.bankCode,
              cardNumber: card.cardNumber,
              cardHolder: card.cardHolder
            })
          }
        }
      }
    } catch (e) {
      console.warn('[init] 银行卡同步异常:', e.message)
    }
  },

  async syncUserToCloud(userData) {
    try {
      const data = userData || initUser()
      const walletData = uni.getStorageSync('wallet_data')
      const result = await uniCloud.callFunction({
        name: 'userProxy',
        data: {
          action: 'syncLocalData',
          args: [{
            nickname: data.nickname,
            phone: data.phone,
            school: data.school,
            studentId: data.studentId,
            verified: data.verified,
            balance: walletData?.balance ?? data.balance,
            orderCount: data.orderCount
          }]
        }
      })
      if (result.result && result.result.errCode === 0) {
        console.log('[init] 用户数据已同步到云端')
        return true
      }
    } catch (e) {
      addToSyncQueue('user', {
        nickname: (userData || {}).nickname,
        phone: (userData || {}).phone,
        school: (userData || {}).school,
        studentId: (userData || {}).studentId,
        verified: (userData || {}).verified,
        balance: (userData || {}).balance,
        orderCount: (userData || {}).orderCount
      })
      console.warn('[init] 用户数据云端同步失败:', e.message)
    }
    return false
  },

  async loadUserFromCloud() {
    try {
      const result = await uniCloud.callFunction({
        name: 'userProxy',
        data: { action: 'getUser', args: [] }
      })
      if (result.result && result.result.errCode === 0 && result.result.data) {
        const cloudUser = result.result.data
        const localUser = initUser()
        const walletData = uni.getStorageSync('wallet_data') || {}
        
        const merged = {
          ...localUser,
          nickname: cloudUser.nickname || localUser.nickname,
          phone: cloudUser.phone || localUser.phone,
          school: cloudUser.school || localUser.school,
          studentId: cloudUser.student_id || localUser.studentId,
          verified: cloudUser.verified !== undefined ? cloudUser.verified : localUser.verified,
          role: cloudUser.role || localUser.role,
          balance: cloudUser.balance !== undefined ? cloudUser.balance : (walletData.balance || localUser.balance),
          orderCount: cloudUser.order_count || localUser.orderCount,
          updated_at: Date.now()
        }
        uni.setStorageSync(USER_KEY, merged)
        
        if (cloudUser.balance !== undefined) {
          walletData.balance = cloudUser.balance
          uni.setStorageSync('wallet_data', walletData)
        }
        
        return merged
      }
    } catch (e) {
      console.warn('[init] 从云端加载用户数据失败:', e.message)
    }
    return initUser()
  },

  getUser() {
    const user = initUser()
    try {
      const walletData = uni.getStorageSync('wallet_data')
      if (walletData && walletData.balance !== undefined) {
        user.balance = Number(walletData.balance)
      }
    } catch (e) {}
    return user
  },

  async updateUser(updates) {
    try {
      const user = initUser()
      const walletData = uni.getStorageSync('wallet_data')
      if (walletData && walletData.balance !== undefined) {
        user.balance = Number(walletData.balance)
      }
      const updated = { ...user, ...updates, updated_at: Date.now() }
      uni.setStorageSync(USER_KEY, updated)
      
      bridgeClient.saveUser(updated).then(() => {}).catch(() => {})
      
      if (updates.school) {
        try {
          let rider = uni.getStorageSync(RIDER_KEY)
          if (rider) {
            rider.school = updates.school
            if (updates.nickname) rider.nickname = updates.nickname
            if (updates.phone) rider.phone = updates.phone
            uni.setStorageSync(RIDER_KEY, rider)
          }
        } catch (e) {}
      }
      
      const cloudOk = await this.checkCloudConnection()
      if (cloudOk) {
        await this.syncUserToCloud(updated)
      } else {
        addToSyncQueue('user', updates)
      }
      
      return updated
    } catch (e) {
      return null
    }
  },

  getRider() {
    return initRider()
  },

  updateRider(updates) {
    try {
      const rider = initRider()
      const updated = { ...rider, ...updates, updated_at: Date.now() }
      uni.setStorageSync(RIDER_KEY, updated)
      return updated
    } catch (e) {
      return null
    }
  },

  async addRiderEarnings(amount, orderId) {
    try {
      const rider = initRider()
      const today = new Date()
      const lastEarningDate = uni.getStorageSync('rider_last_earning_date')
      const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      
      if (lastEarningDate !== todayStr) {
        rider.todayEarnings = 0
        rider.todayOrders = 0
        uni.setStorageSync('rider_last_earning_date', todayStr)
      }
      
      rider.todayEarnings = Number((rider.todayEarnings + amount).toFixed(2))
      rider.todayOrders += 1
      rider.totalEarnings = Number((rider.totalEarnings + amount).toFixed(2))
      rider.weekEarnings = Number(((rider.weekEarnings || 0) + amount).toFixed(2))
      rider.monthEarnings = Number(((rider.monthEarnings || 0) + amount).toFixed(2))
      rider.completedOrders += 1
      rider.totalOrders += 1
      
      const updated = { ...rider, updated_at: Date.now() }
      uni.setStorageSync(RIDER_KEY, updated)
      
      const cloudOk = await this.checkCloudConnection()
      if (cloudOk) {
        await this.syncRiderEarningsToCloud(amount, orderId, rider.id)
      } else {
        addToSyncQueue('riderEarnings', { args: [amount, orderId], riderId: rider.id })
      }
      
      return updated
    } catch (e) {
      return null
    }
  },

  async syncRiderEarningsToCloud(amount, orderId, riderId) {
    try {
      const result = await uniCloud.callFunction({
        name: 'userProxy',
        data: {
          action: 'updateRiderEarnings',
          args: [amount, orderId],
          riderId: riderId
        }
      })
      if (result.result && result.result.errCode === 0) {
        console.log('[init] 骑手收益已同步到云端')
      }
    } catch (e) {
      console.warn('[init] 骑手收益云端同步失败:', e.message)
    }
  },

  getSyncStatus() {
    try {
      return uni.getStorageSync(SYNC_STATUS_KEY) || { status: 'unknown', message: '未知', updated_at: 0 }
    } catch (e) {
      return { status: 'unknown', message: '未知', updated_at: 0 }
    }
  },

  async forceSyncNow() {
    updateSyncStatus('syncing', '强制同步中...')
    const cloudOk = await this.checkCloudConnection()
    if (!cloudOk) {
      updateSyncStatus('error', '云端连接失败，请先在HBuilderX中部署云函数')
      return { errCode: -1, errMsg: '云端连接失败' }
    }
    await this.syncAllToCloud()
    updateSyncStatus('synced', '强制同步完成')
    return { errCode: 0, errMsg: '同步完成' }
  },

  resetAll() {
    try {
      uni.removeStorageSync(USER_KEY)
      uni.removeStorageSync(RIDER_KEY)
      uni.removeStorageSync(INIT_FLAG_KEY)
      uni.removeStorageSync(SYNC_QUEUE_KEY)
      uni.removeStorageSync(SYNC_STATUS_KEY)
      uni.removeStorageSync('wallet_data')
      uni.removeStorageSync('wallet_transactions')
      uni.removeStorageSync('bank_cards')
      uni.removeStorageSync('rider_today_earnings')
      uni.removeStorageSync('rider_today_orders')
      uni.removeStorageSync('rider_total_earnings')
      uni.removeStorageSync('rider_settled_orders')
      uni.removeStorageSync('orders_data')
      uni.removeStorageSync('order_status')
      uni.removeStorageSync('order_events')
      uni.removeStorageSync('ai_chat_session')
      uni.removeStorageSync('campus_custom_school')
      uni.removeStorageSync('campus_custom_schools')
      uni.removeStorageSync('payment_config')
      uni.removeStorageSync('payment_records')
      uni.removeStorageSync('services_initialized')
      uni.removeStorageSync('providers_initialized')
      
      return { errCode: 0, errMsg: '已重置所有数据' }
    } catch (e) {
      return { errCode: -1, errMsg: e.message }
    }
  }
}
