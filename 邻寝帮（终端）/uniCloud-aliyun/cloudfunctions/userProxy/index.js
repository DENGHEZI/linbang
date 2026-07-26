const db = uniCloud.database()
const dbCmd = db.command

const ALLOWED_BANKS = [
  { code: 'CMB', name: '招商银行', prefix: '622588', color: '#CC1931' },
  { code: 'CCB', name: '建设银行', prefix: '622280', color: '#004B8D' },
  { code: 'BOC', name: '中国银行', prefix: '621785', color: '#C8102E' }
]

function maskCardNumber(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  if (num.length < 4) return cardNumber
  return num.slice(0, 4) + ' **** **** ' + num.slice(-4)
}

function getLast4(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  return num.slice(-4)
}

function detectBank(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  for (const bank of ALLOWED_BANKS) {
    if (num.startsWith(bank.prefix)) {
      return bank
    }
  }
  const firstDigit = num.charAt(0)
  if (firstDigit === '6') return ALLOWED_BANKS[0]
  if (firstDigit === '4') return ALLOWED_BANKS[1]
  return ALLOWED_BANKS[0]
}

async function ensureUser(userId) {
  if (!userId) return null
  const result = await db.collection('user-profile').where({ user_id: userId }).get()
  if (result.data && result.data.length > 0) {
    return result.data[0]
  }
  const defaultProfile = {
    user_id: userId,
    nickname: '邻寝帮用户',
    avatar: '',
    phone: '',
    school: '',
    student_id: '',
    verified: false,
    role: 'user',
    balance: 100.00,
    order_count: 0,
    total_orders: 0,
    rating: 5.0,
    created_at: Date.now(),
    updated_at: Date.now()
  }
  const addResult = await db.collection('user-profile').add(defaultProfile)
  if (addResult.id) {
    return { ...defaultProfile, _id: addResult.id }
  }
  return null
}

exports.main = async (event, context) => {
  const { action, args = [] } = event
  const clientInfo = context.getClientInfo ? context.getClientInfo() : {}
  const userId = event.userId || clientInfo.uid || 'local_user'

  try {
    switch (action) {
      case 'ping': {
        return { errCode: 0, errMsg: 'pong' }
      }


      case 'getUser': {
        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }
        return { errCode: 0, data: user }
      }

      case 'updateUser': {
        const [updates] = args
        if (!updates) return { errCode: 'PARAM_ERROR', errMsg: '缺少更新数据' }

        const allowedFields = ['nickname', 'avatar', 'phone', 'school', 'student_id', 'verified', 'role']
        const filtered = {}
        for (const key of allowedFields) {
          if (key in updates) filtered[key] = updates[key]
        }

        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }

        const result = await db.collection('user-profile').doc(user._id).update({
          ...filtered,
          updated_at: Date.now()
        })

        if (result.updated === 0) {
          return { errCode: 'UPDATE_FAILED', errMsg: '更新失败' }
        }

        const updated = await db.collection('user-profile').doc(user._id).get()
        return { errCode: 0, data: updated.data[0] }
      }

      case 'getBalance': {
        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }
        return {
          errCode: 0,
          data: {
            balance: user.balance || 0,
            updated_at: user.updated_at
          }
        }
      }

      case 'updateBalance': {
        const [amount, reason] = args
        if (typeof amount !== 'number') return { errCode: 'PARAM_ERROR', errMsg: '金额参数错误' }

        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }

        const newBalance = Math.max(0, Number(((user.balance || 0) + amount).toFixed(2)))

        await db.collection('user-profile').doc(user._id).update({
          balance: newBalance,
          updated_at: Date.now()
        })

        if (amount !== 0) {
          await db.collection('wallet-transaction').add({
            user_id: userId,
            type: amount > 0 ? 'income' : 'expense',
            amount: Math.abs(amount),
            category: reason || 'order_fee',
            balance_after: newBalance,
            created_at: Date.now()
          })
        }

        return { errCode: 0, data: { balance: newBalance } }
      }

      case 'getBankCards': {
        const result = await db.collection('bank-card').where({ user_id: userId }).get()
        return { errCode: 0, data: result.data || [] }
      }

      case 'addBankCard': {
        const [params] = args
        const { bankCode, cardNumber, cardHolder } = params || {}

        if (!bankCode || !cardNumber || !cardHolder) {
          return { errCode: 'PARAM_ERROR', errMsg: '请填写完整信息' }
        }

        const bank = ALLOWED_BANKS.find(b => b.code === bankCode)
        if (!bank) {
          return { errCode: 'BANK_NOT_ALLOWED', errMsg: '仅支持招商银行、建设银行、中国银行' }
        }

        const num = cardNumber.replace(/\s/g, '')
        if (!/^\d{16,19}$/.test(num)) {
          return { errCode: 'INVALID_CARD', errMsg: '银行卡号格式不正确' }
        }

        const last4 = getLast4(cardNumber)
        const existing = await db.collection('bank-card').where({
          user_id: userId,
          last4: last4
        }).get()

        if (existing.data && existing.data.length > 0) {
          return { errCode: 'DUPLICATE_CARD', errMsg: '该银行卡已存在' }
        }

        const cardsResult = await db.collection('bank-card').where({ user_id: userId }).get()
        const cards = cardsResult.data || []
        const isDefault = cards.length === 0

        const newCard = {
          user_id: userId,
          bank_code: bankCode,
          bank_name: bank.name,
          card_number: maskCardNumber(cardNumber),
          card_holder: cardHolder,
          last4: last4,
          is_default: isDefault,
          created_at: Date.now(),
          updated_at: Date.now()
        }

        const addResult = await db.collection('bank-card').add(newCard)
        if (addResult.id) {
          newCard._id = addResult.id
        }

        return { errCode: 0, data: newCard }
      }

      case 'deleteBankCard': {
        const [cardId] = args
        if (!cardId) return { errCode: 'PARAM_ERROR', errMsg: '缺少银行卡ID' }

        const result = await db.collection('bank-card').doc(cardId).remove()
        if (result.deleted === 0) {
          return { errCode: 'NOT_FOUND', errMsg: '银行卡不存在' }
        }

        return { errCode: 0, errMsg: '删除成功' }
      }

      case 'setDefaultCard': {
        const [cardId] = args
        if (!cardId) return { errCode: 'PARAM_ERROR', errMsg: '缺少银行卡ID' }

        await db.collection('bank-card').where({ user_id: userId }).update({
          is_default: false,
          updated_at: Date.now()
        })

        const result = await db.collection('bank-card').doc(cardId).update({
          is_default: true,
          updated_at: Date.now()
        })

        if (result.updated === 0) {
          return { errCode: 'NOT_FOUND', errMsg: '银行卡不存在' }
        }

        return { errCode: 0, errMsg: '设置成功' }
      }

      case 'getDefaultCard': {
        const result = await db.collection('bank-card').where({
          user_id: userId,
          is_default: true
        }).get()

        let card = (result.data && result.data[0]) || null
        if (!card) {
          const allResult = await db.collection('bank-card').where({ user_id: userId }).limit(1).get()
          card = (allResult.data && allResult.data[0]) || null
        }

        return { errCode: 0, data: card }
      }

      case 'getTransactions': {
        const [limit] = args
        const result = await db.collection('wallet-transaction')
          .where({ user_id: userId })
          .orderBy('created_at', 'desc')
          .limit(limit || 20)
          .get()

        return { errCode: 0, data: result.data || [] }
      }

      case 'addTransaction': {
        const [txData] = args
        if (!txData || !txData.type || !txData.amount) {
          return { errCode: 'PARAM_ERROR', errMsg: '交易参数不完整' }
        }

        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }

        const newBalance = user.balance || 0
        const tx = {
          user_id: userId,
          type: txData.type,
          amount: txData.amount,
          category: txData.category || 'order_fee',
          description: txData.description || '',
          related_id: txData.related_id || '',
          balance_after: newBalance,
          created_at: Date.now()
        }

        const result = await db.collection('wallet-transaction').add(tx)
        return { errCode: 0, data: { ...tx, _id: result.id } }
      }

      case 'syncLocalData': {
        const [localData] = args
        if (!localData) return { errCode: 'PARAM_ERROR', errMsg: '缺少本地数据' }

        const user = await ensureUser(userId)
        if (!user) return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }

        const updates = {}
        if (localData.balance !== undefined) updates.balance = localData.balance
        if (localData.orderCount !== undefined) updates.order_count = localData.orderCount
        if (localData.nickname) updates.nickname = localData.nickname
        if (localData.phone) updates.phone = localData.phone
        if (localData.school) updates.school = localData.school
        if (localData.studentId) updates.student_id = localData.studentId
        if (localData.verified !== undefined) updates.verified = localData.verified
        updates.updated_at = Date.now()

        if (Object.keys(updates).length > 1) {
          await db.collection('user-profile').doc(user._id).update(updates)
        }

        if (localData.bankCards && Array.isArray(localData.bankCards)) {
          for (const card of localData.bankCards) {
            if (!card._id) {
              await db.collection('bank-card').add({
                user_id: userId,
                bank_code: card.bankCode,
                bank_name: card.bankName,
                card_number: card.cardNumber,
                card_holder: card.cardHolder,
                last4: card.last4,
                is_default: card.isDefault || false,
                created_at: card.created_at || Date.now(),
                updated_at: Date.now()
              })
            }
          }
        }

        const refreshed = await db.collection('user-profile').doc(user._id).get()
        return { errCode: 0, data: refreshed.data[0] }
      }

      case 'getRider': {
        const riderId = event.riderId || userId
        const result = await db.collection('user-profile').where({ user_id: riderId }).get()
        if (result.data && result.data.length > 0) {
          return { errCode: 0, data: result.data[0] }
        }
        const defaultRider = {
          user_id: riderId,
          nickname: '骑手小李',
          role: 'rider',
          verified: true,
          rating: 4.9,
          order_count: 23,
          total_orders: 23,
          balance: 0,
          created_at: Date.now(),
          updated_at: Date.now()
        }
        const addResult = await db.collection('user-profile').add(defaultRider)
        if (addResult.id) {
          defaultRider._id = addResult.id
        }
        return { errCode: 0, data: defaultRider }
      }

      case 'updateRiderEarnings': {
        const [amount, orderId] = args
        if (typeof amount !== 'number') return { errCode: 'PARAM_ERROR', errMsg: '金额参数错误' }

        const riderId = event.riderId || userId
        let rider = (await db.collection('user-profile').where({ user_id: riderId }).get()).data

        if (!rider || rider.length === 0) {
          const defaultRider = {
            user_id: riderId,
            nickname: '骑手小李',
            role: 'rider',
            rating: 4.9,
            order_count: 0,
            total_orders: 0,
            balance: 0,
            created_at: Date.now(),
            updated_at: Date.now()
          }
          const addResult = await db.collection('user-profile').add(defaultRider)
          rider = [{ ...defaultRider, _id: addResult.id }]
        }

        const riderDoc = rider[0]
        const newOrderCount = (riderDoc.order_count || 0) + 1
        const newTotalOrders = (riderDoc.total_orders || 0) + 1

        await db.collection('user-profile').doc(riderDoc._id).update({
          order_count: newOrderCount,
          total_orders: newTotalOrders,
          balance: Number(((riderDoc.balance || 0) + amount).toFixed(2)),
          updated_at: Date.now()
        })

        return { errCode: 0, data: { orderCount: newOrderCount, totalOrders: newTotalOrders } }
      }

      case 'listUsers': {
        const [params = {}] = args
        const { page = 1, pageSize = 20, role, keyword } = params

        let query = {}
        if (role) query.role = role

        if (keyword) {
          const keywordReg = new RegExp(keyword, 'i')
          query = {
            ...query,
            $or: [
              { nickname: keywordReg },
              { phone: keywordReg },
              { school: keywordReg }
            ]
          }
        }

        const countResult = await db.collection('user-profile').where(query).count()
        const total = countResult.total

        const list = await db.collection('user-profile')
          .where(query)
          .orderBy('created_at', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get()

        return {
          errCode: 0,
          errMsg: '获取成功',
          data: { list: list.data || [], total, page, pageSize }
        }
      }

      case 'deleteUser': {
        const [userId] = args
        if (!userId) return { errCode: 'PARAM_ERROR', errMsg: '缺少用户ID' }

        const result = await db.collection('user-profile').doc(userId).remove()
        if (result.deleted === 0) {
          return { errCode: 'NOT_FOUND', errMsg: '用户不存在' }
        }

        return { errCode: 0, errMsg: '删除成功' }
      }

      default:
        return { errCode: 'UNKNOWN_ACTION', errMsg: `未知操作: ${action}` }
    }
  } catch (e) {
    console.error('[userProxy] Error:', e)
    return { errCode: -1, errMsg: e.message }
  }
}
