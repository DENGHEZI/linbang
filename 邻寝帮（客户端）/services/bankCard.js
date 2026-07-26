const BANK_CARDS_KEY = 'bank_cards'
const ALLOWED_BANKS = [
  { code: 'CMB', name: '招商银行', prefix: '622588', color: '#CC1931' },
  { code: 'CCB', name: '建设银行', prefix: '622280', color: '#004B8D' },
  { code: 'BOC', name: '中国银行', prefix: '621785', color: '#C8102E' }
]

function getBankCards() {
  try {
    let cards = uni.getStorageSync(BANK_CARDS_KEY)
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      cards = [
        {
          id: 'card_' + Date.now(),
          bankCode: 'CMB',
          bankName: '招商银行',
          cardNumber: '6225 **** **** 8888',
          cardHolder: '邻寝帮用户',
          last4: '8888',
          isDefault: true,
          created_at: Date.now()
        }
      ]
      uni.setStorageSync(BANK_CARDS_KEY, cards)
    }
    return cards
  } catch (e) {
    return []
  }
}

function saveBankCards(cards) {
  try {
    uni.setStorageSync(BANK_CARDS_KEY, cards)
  } catch (e) {
    console.error('[bankCards] 保存银行卡失败:', e)
  }
}

function getBankByCode(code) {
  return ALLOWED_BANKS.find(b => b.code === code)
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

function isValidCardNumber(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  return /^\d{16,19}$/.test(num)
}

function maskCardNumber(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  if (num.length < 4) return cardNumber
  return num.slice(0, 4) + ' **** **** ' + num.slice(-4)
}

function getLast4(cardNumber) {
  const num = cardNumber.replace(/\s/g, '')
  return num.slice(-4)
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
    console.warn('[bankCards] 云端调用失败，使用本地:', e.message)
    return null
  }
}

function normalizeCloudCard(cloudCard) {
  if (!cloudCard) return null
  return {
    id: cloudCard._id || cloudCard.id,
    bankCode: cloudCard.bank_code,
    bankName: cloudCard.bank_name,
    cardNumber: cloudCard.card_number,
    cardHolder: cloudCard.card_holder,
    last4: cloudCard.last4,
    isDefault: cloudCard.is_default,
    created_at: cloudCard.created_at
  }
}

export const bankCardService = {
  getAllowedBanks() {
    return [...ALLOWED_BANKS]
  },

  async getCards() {
    const localCards = getBankCards()
    try {
      const cloudData = await callCloud('getBankCards', [])
      if (cloudData && Array.isArray(cloudData)) {
        const normalized = cloudData.map(normalizeCloudCard).filter(Boolean)
        if (normalized.length > 0) {
          saveBankCards(normalized)
          return normalized
        }
      }
    } catch (e) {
      console.warn('[bankCards] 云端获取失败，使用本地数据')
    }
    return localCards
  },

  async getDefaultCard() {
    try {
      const cloudData = await callCloud('getDefaultCard', [])
      if (cloudData) {
        return normalizeCloudCard(cloudData)
      }
    } catch (e) {
      console.warn('[bankCards] 云端获取默认卡失败')
    }
    const cards = getBankCards()
    return cards.find(c => c.isDefault) || cards[0] || null
  },

  async addCard(params) {
    const { bankCode, cardNumber, cardHolder } = params

    if (!bankCode || !cardNumber || !cardHolder) {
      return { errCode: 'PARAM_ERROR', errMsg: '请填写完整信息' }
    }

    const bank = getBankByCode(bankCode)
    if (!bank) {
      return { errCode: 'BANK_NOT_ALLOWED', errMsg: '仅支持招商银行、建设银行、中国银行的银行卡' }
    }

    if (!isValidCardNumber(cardNumber)) {
      return { errCode: 'INVALID_CARD', errMsg: '银行卡号格式不正确' }
    }

    const last4 = getLast4(cardNumber)
    const cards = getBankCards()
    const duplicate = cards.find(c => c.last4 === last4)
    if (duplicate) {
      return { errCode: 'DUPLICATE_CARD', errMsg: '该银行卡已存在' }
    }

    const newCard = {
      id: 'card_' + Date.now(),
      bankCode,
      bankName: bank.name,
      cardNumber: maskCardNumber(cardNumber),
      cardHolder,
      last4,
      isDefault: cards.length === 0,
      created_at: Date.now()
    }

    try {
      const cloudData = await callCloud('addBankCard', [{ bankCode, cardNumber, cardHolder }])
      if (cloudData) {
        newCard.id = cloudData._id || newCard.id
        newCard.isDefault = cloudData.is_default !== undefined ? cloudData.is_default : newCard.isDefault
      }
    } catch (e) {
      console.warn('[bankCards] 云端添加银行卡失败，使用本地存储')
    }

    cards.push(newCard)
    saveBankCards(cards)

    return { errCode: 0, errMsg: '添加成功', data: newCard }
  },

  async deleteCard(cardId) {
    let cards = getBankCards()
    const card = cards.find(c => c.id === cardId)
    if (!card) {
      return { errCode: 'NOT_FOUND', errMsg: '银行卡不存在' }
    }

    try {
      await callCloud('deleteBankCard', [cardId])
    } catch (e) {
      console.warn('[bankCards] 云端删除银行卡失败，使用本地删除')
    }

    cards = cards.filter(c => c.id !== cardId)
    if (card.isDefault && cards.length > 0) {
      cards[0].isDefault = true
      try {
        await callCloud('setDefaultCard', [cards[0].id])
      } catch (e) {}
    }
    saveBankCards(cards)
    return { errCode: 0, errMsg: '删除成功' }
  },

  async setDefault(cardId) {
    const cards = getBankCards()
    const card = cards.find(c => c.id === cardId)
    if (!card) {
      return { errCode: 'NOT_FOUND', errMsg: '银行卡不存在' }
    }

    try {
      await callCloud('setDefaultCard', [cardId])
    } catch (e) {
      console.warn('[bankCards] 云端设置默认卡失败，使用本地设置')
    }

    cards.forEach(c => { c.isDefault = (c.id === cardId) })
    saveBankCards(cards)
    return { errCode: 0, errMsg: '设置成功', data: card }
  },

  validateCardNumber(cardNumber) {
    return {
      valid: isValidCardNumber(cardNumber),
      bank: detectBank(cardNumber)
    }
  },

  getBankByCode(code) {
    return getBankByCode(code)
  }
}
