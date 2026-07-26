const WALLET_KEY = 'wallet_data'
const TRANSACTION_KEY = 'wallet_transactions'

function getWalletData() {
  try {
    const data = uni.getStorageSync(WALLET_KEY)
    if (!data) {
      const initialData = {
        balance: 100.00,
        totalIncome: 0,
        totalExpense: 0,
        updated_at: Date.now()
      }
      uni.setStorageSync(WALLET_KEY, initialData)
      syncBalanceToUserProfile(initialData.balance)
      return initialData
    }
    return data
  } catch (e) {
    return { balance: 100.00, totalIncome: 0, totalExpense: 0 }
  }
}

function syncBalanceToUserProfile(balance) {
  try {
    const userProfile = uni.getStorageSync('user_profile')
    if (userProfile) {
      userProfile.balance = Number(balance)
      userProfile.updated_at = Date.now()
      uni.setStorageSync('user_profile', userProfile)
    }
  } catch (e) {
    console.warn('[wallet] 同步余额到用户资料失败:', e.message)
  }
}

function saveWalletData(data) {
  try {
    uni.setStorageSync(WALLET_KEY, data)
    syncBalanceToUserProfile(data.balance)
  } catch (e) {
    console.error('[wallet] 保存钱包数据失败:', e)
  }
}

function getTransactions() {
  try {
    return uni.getStorageSync(TRANSACTION_KEY) || []
  } catch (e) {
    return []
  }
}

function saveTransactions(list) {
  try {
    uni.setStorageSync(TRANSACTION_KEY, list)
  } catch (e) {
    console.error('[wallet] 保存交易记录失败:', e)
  }
}

function formatMoney(amount) {
  return Number(amount).toFixed(2)
}

function getTimeString(ts) {
  const date = ts ? new Date(ts) : new Date()
  const now = new Date()
  const diff = now - date
  const oneDay = 24 * 60 * 60 * 1000
  
  if (diff < 60 * 60 * 1000) {
    return '刚刚'
  } else if (diff < oneDay) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return hours + '小时前'
  } else if (diff < oneDay * 2) {
    return '昨天'
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${min}`
  }
}

async function callCloud(action, args) {
  try {
    const result = await uniCloud.callFunction({
      name: 'userProxy',
      data: { action, args }
    })
    if (result.result && result.result.errCode === 0) {
      return result.result.data
    }
    return null
  } catch (e) {
    console.warn('[wallet] 云端调用失败，使用本地:', e.message)
    return null
  }
}

function normalizeCloudTx(cloudTx) {
  if (!cloudTx) return null
  const ts = cloudTx.created_at ? new Date(cloudTx.created_at).getTime() : Date.now()
  return {
    _id: cloudTx._id,
    type: cloudTx.type,
    category: cloudTx.category,
    desc: cloudTx.description || '',
    amount: formatMoney(cloudTx.amount),
    orderId: cloudTx.related_id || null,
    created_at: ts,
    timeText: getTimeString(ts)
  }
}

export const walletService = {
  async getBalance() {
    const localData = getWalletData()
    try {
      const cloudData = await callCloud('getBalance', [])
      if (cloudData) {
        const newBalance = Number(cloudData.balance)
        localData.balance = newBalance
        localData.updated_at = Date.now()
        saveWalletData(localData)
        syncBalanceToUserProfile(newBalance)
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            balance: formatMoney(newBalance),
            totalIncome: formatMoney(localData.totalIncome),
            totalExpense: formatMoney(localData.totalExpense)
          }
        }
      }
    } catch (e) {
      console.warn('[wallet] 云端获取余额失败，使用本地数据')
    }
    syncBalanceToUserProfile(localData.balance)
    return {
      errCode: 0,
      errMsg: '获取成功',
      data: {
        balance: formatMoney(localData.balance),
        totalIncome: formatMoney(localData.totalIncome),
        totalExpense: formatMoney(localData.totalExpense)
      }
    }
  },

  async addTransaction(transaction) {
    if (!transaction || !transaction.type || !transaction.amount) {
      return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
    }

    const amount = Number(transaction.amount)
    if (amount <= 0) {
      return { errCode: 'PARAM_ERROR', errMsg: '金额必须大于0' }
    }

    const wallet = getWalletData()
    const transactions = getTransactions()

    const newTransaction = {
      _id: 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: transaction.type,
      category: transaction.category || 'general',
      desc: transaction.desc || '交易',
      amount: formatMoney(amount),
      orderId: transaction.orderId || null,
      created_at: Date.now(),
      timeText: getTimeString()
    }

    let newBalance = wallet.balance

    if (transaction.type === 'expense') {
      if (wallet.balance < amount) {
        return { errCode: 'INSUFFICIENT', errMsg: '余额不足' }
      }
      newBalance = Number((wallet.balance - amount).toFixed(2))
      wallet.totalExpense = Number((wallet.totalExpense + amount).toFixed(2))
    } else if (transaction.type === 'income') {
      newBalance = Number((wallet.balance + amount).toFixed(2))
      wallet.totalIncome = Number((wallet.totalIncome + amount).toFixed(2))
    }

    wallet.balance = newBalance
    wallet.updated_at = Date.now()
    saveWalletData(wallet)

    transactions.unshift(newTransaction)
    saveTransactions(transactions.slice(0, 100))

    try {
      await callCloud('updateBalance', [transaction.type === 'expense' ? -amount : amount, transaction.category])
      await callCloud('addTransaction', [{
        type: transaction.type,
        amount: amount,
        category: transaction.category || 'order_fee',
        description: transaction.desc || '',
        related_id: transaction.orderId || '',
        balance_after: newBalance
      }])
    } catch (e) {
      console.warn('[wallet] 云端交易记录失败，已保存在本地')
    }

    return {
      errCode: 0,
      errMsg: '交易成功',
      data: {
        transaction: newTransaction,
        balance: formatMoney(newBalance)
      }
    }
  },

  async addExpense(desc, amount, orderId) {
    return this.addTransaction({
      type: 'expense',
      category: 'order',
      desc,
      amount,
      orderId
    })
  },

  async addIncome(desc, amount, orderId) {
    return this.addTransaction({
      type: 'income',
      category: 'earn',
      desc,
      amount,
      orderId
    })
  },

  async getTransactionsList(params = {}) {
    const { type, limit = 50 } = params
    let list = getTransactions()

    try {
      const cloudData = await callCloud('getTransactions', [limit])
      if (cloudData && Array.isArray(cloudData)) {
        const cloudTxList = cloudData.map(normalizeCloudTx).filter(Boolean)
        const localIds = new Set(list.map(t => t._id))
        const merged = [...cloudTxList, ...list.filter(t => !localIds.has(t._id))]
        if (merged.length > 0) {
          saveTransactions(merged)
          list = merged
        }
      }
    } catch (e) {
      console.warn('[wallet] 云端获取交易记录失败，使用本地数据')
    }

    if (type) {
      list = list.filter(t => t.type === type)
    }

    list = list.slice(0, limit)

    return {
      errCode: 0,
      errMsg: '获取成功',
      data: { list, total: list.length }
    }
  },

  async recharge(amount) {
    const result = await this.addTransaction({
      type: 'income',
      category: 'recharge',
      desc: '账户充值',
      amount
    })
    return result
  },

  async withdraw(amount) {
    const wallet = getWalletData()
    if (wallet.balance < amount) {
      return { errCode: 'INSUFFICIENT', errMsg: '余额不足' }
    }
    return this.addTransaction({
      type: 'expense',
      category: 'withdraw',
      desc: '余额提现',
      amount
    })
  },

  async clearAll() {
    uni.removeStorageSync(WALLET_KEY)
    uni.removeStorageSync(TRANSACTION_KEY)
    return { errCode: 0, errMsg: '已清空' }
  },

  async initializeMockData() {
    const wallet = {
      balance: 128.50,
      totalIncome: 112.00,
      totalExpense: 83.50,
      updated_at: Date.now()
    }
    saveWalletData(wallet)

    const now = Date.now()
    const mockTransactions = [
      {
        _id: 'tx_mock_1',
        type: 'expense',
        category: 'order',
        desc: '跑腿费支出 - 快递代取',
        amount: '5.00',
        orderId: null,
        created_at: now - 2 * 60 * 60 * 1000,
        timeText: getTimeString(now - 2 * 60 * 60 * 1000)
      },
      {
        _id: 'tx_mock_2',
        type: 'income',
        category: 'recharge',
        desc: '充值成功',
        amount: '100.00',
        orderId: null,
        created_at: now - 26 * 60 * 60 * 1000,
        timeText: getTimeString(now - 26 * 60 * 60 * 1000)
      },
      {
        _id: 'tx_mock_3',
        type: 'expense',
        category: 'order',
        desc: '跑腿费支出 - 食堂代买',
        amount: '3.00',
        orderId: null,
        created_at: now - 3 * 24 * 60 * 60 * 1000,
        timeText: getTimeString(now - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'tx_mock_4',
        type: 'expense',
        category: 'order',
        desc: '跑腿费支出 - 超市代购',
        amount: '8.50',
        orderId: null,
        created_at: now - 5 * 24 * 60 * 60 * 1000,
        timeText: getTimeString(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'tx_mock_5',
        type: 'income',
        category: 'recharge',
        desc: '充值成功',
        amount: '50.00',
        orderId: null,
        created_at: now - 7 * 24 * 60 * 60 * 1000,
        timeText: getTimeString(now - 7 * 24 * 60 * 60 * 1000)
      }
    ]
    saveTransactions(mockTransactions)

    return { errCode: 0, errMsg: '初始化成功' }
  },

  async syncToCloud() {
    try {
      const wallet = getWalletData()
      const transactions = getTransactions()
      await callCloud('addTransaction', [{
        type: 'expense',
        amount: 0,
        category: 'sync',
        description: '本地数据同步',
        balance_after: wallet.balance
      }])
      return { errCode: 0 }
    } catch (e) {
      return { errCode: -1, errMsg: e.message }
    }
  }
}
