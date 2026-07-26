const AI_CHAT_SESSION_KEY = 'ai_chat_session'

function getLocalSession() {
  try {
    return uni.getStorageSync(AI_CHAT_SESSION_KEY)
  } catch (e) {
    return null
  }
}

function saveLocalSession(session) {
  try {
    uni.setStorageSync(AI_CHAT_SESSION_KEY, session)
  } catch (e) {
    console.error('[aiChat] 保存会话失败:', e)
  }
}

function clearLocalSession() {
  try {
    uni.removeStorageSync(AI_CHAT_SESSION_KEY)
  } catch (e) {}
}

function generateLocalSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
}

async function callCloud(action, data) {
  try {
    const res = await uniCloud.callFunction({
      name: 'aiChat',
      data: { action, data }
    })
    if (res.result && res.result.errCode === 0) {
      return res.result
    }
    throw new Error(res.result ? res.result.errMsg : '调用失败')
  } catch (e) {
    console.warn('[aiChat] 云端调用失败，使用本地:', e.message)
    return null
  }
}

const LOCAL_REPLIES = {
  '订单状态查询': '您可以在"我的订单"页面查看所有订单状态。每个订单会显示当前进度，包括待接单、配送中、已完成等状态。请问您想查询哪个订单？',
  '费用说明': '我们的定价标准如下：小型快递¥2起、中型快递¥3起、食堂代买¥3起。实际费用根据距离和重量等因素由接单时协商确定，下单时会显示预估费用。新用户前10单免服务费哦！',
  '投诉建议': '非常抱歉给您带来不好的体验！请详细描述您遇到的问题，包括订单编号、具体情况等，我们会尽快为您处理。您也可以拨打创作者电话19976889490或添加微信zy1118dh联系我们。',
  '如何下单': '下单步骤：1. 选择服务类型（快递代取/食堂代买等）；2. 填写取件地址和送达地址；3. 填写物品信息和备注；4. 提交订单并付款。简单四步即可完成！',
  '退款流程': '退款流程：1. 进入"我的订单"页面；2. 选择需要退款的订单；3. 点击"申请退款"按钮；4. 选择退款原因并提交；5. 等待客服审核；6. 审核通过后款项将原路退回。',
  '骑手认证': '成为骑手步骤：1. 在个人中心点击"切换到骑手端"；2. 完成实名认证（需上传身份证和学生证）；3. 等待平台审核（通常1-3个工作日）；4. 审核通过后即可开始接单。',
  '优惠券使用': '新用户注册即享10单免服务费优惠！下单时系统自动匹配可用优惠券，也可在确认订单页面手动选择。优惠券不可叠加使用，每单限用一张。',
  '支付问题': '如支付遇到问题：1. 检查银行卡余额是否充足；2. 确认网络连接正常；3. 尝试更换支付方式（微信/支付宝/银行卡）。如仍无法解决，请联系创作者电话19976889490或微信zy1118dh。'
}

const INTENT_MAP = {
  '订单状态查询': ['订单', '状态', '查询', '进度'],
  '费用说明': ['费用', '价格', '多少钱', '定价'],
  '投诉建议': ['投诉', '差评', '举报', '建议'],
  '如何下单': ['下单', '怎么用', '如何', '使用'],
  '退款流程': ['退款', '退钱', '退单'],
  '骑手认证': ['骑手', '跑腿', '接单', '认证'],
  '优惠券使用': ['优惠券', '优惠', '折扣'],
  '支付问题': ['支付', '付款', '余额', '充值'],
  '联系客服': ['电话', '微信', '客服', '联系', '人工']
}

function getLocalReply(text) {
  if (!text) return { reply: '请问有什么可以帮您？', intent: 'unknown' }
  
  if (LOCAL_REPLIES[text]) {
    return { reply: LOCAL_REPLIES[text], intent: text }
  }
  
  const lowered = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(INTENT_MAP)) {
    for (const kw of keywords) {
      if (lowered.includes(kw.toLowerCase())) {
        return { reply: LOCAL_REPLIES[intent], intent }
      }
    }
  }
  
  return {
    reply: '感谢您的咨询！如需人工帮助，请联系创作者电话19976889490或微信zy1118dh。',
    intent: 'unknown'
  }
}

export const aiChatService = {
  async createSession(orderId) {
    const localSessionId = generateLocalSessionId()
    
    const result = await callCloud('createSession', { orderId })
    
    if (result) {
      const session = {
        sessionId: result.data.sessionId,
        messages: [result.data.message],
        orderId: orderId || null,
        createdAt: Date.now()
      }
      saveLocalSession(session)
      return { errCode: 0, data: session }
    }
    
    const session = {
      sessionId: localSessionId,
      messages: [{
        role: 'ai',
        content: '您好！我是邻寝帮AI智能客服，很高兴为您服务。我可以帮您解答订单状态、费用说明、退款流程、骑手认证等问题。如需人工服务，可随时拨打创作者电话 19976889490 或添加微信 zy1118dh。请问有什么可以帮您？',
        timestamp: Date.now()
      }],
      orderId: orderId || null,
      createdAt: Date.now()
    }
    saveLocalSession(session)
    return { errCode: 0, data: session }
  },

  async sendMessage(sessionId, content, orderId) {
    const session = getLocalSession()
    if (!session) {
      return { errCode: 'SESSION_NOT_FOUND', errMsg: '请先创建会话' }
    }
    
    const result = await callCloud('sendMessage', {
      sessionId,
      content,
      orderId
    })
    
    if (result) {
      session.messages.push(result.data.userMessage, result.data.aiMessage)
      session.updatedAt = Date.now()
      saveLocalSession(session)
      return {
        errCode: 0,
        data: {
          userMessage: result.data.userMessage,
          aiMessage: result.data.aiMessage
        }
      }
    }
    
    const { reply, intent } = getLocalReply(content)
    const userMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    }
    const aiMessage = {
      role: 'ai',
      content: reply,
      timestamp: Date.now(),
      intent
    }
    
    session.messages.push(userMessage, aiMessage)
    session.updatedAt = Date.now()
    saveLocalSession(session)
    
    return {
      errCode: 0,
      data: {
        userMessage,
        aiMessage
      }
    }
  },

  async getSession(sessionId) {
    const result = await callCloud('getSession', { sessionId })
    if (result) {
      return result
    }
    const session = getLocalSession()
    return session ? { errCode: 0, data: session } : { errCode: 'NOT_FOUND' }
  },

  async getAIReply(text) {
    const result = await callCloud('getAIReply', { content: text })
    if (result) {
      return result.data
    }
    return getLocalReply(text)
  },

  getLocalSession() {
    return getLocalSession()
  },

  clearSession() {
    clearLocalSession()
  }
}
