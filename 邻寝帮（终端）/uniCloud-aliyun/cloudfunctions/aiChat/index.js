'use strict';

const db = uniCloud.database()
const dbCmd = db.command
const $ = dbCmd.aggregate

const AI_REPLIES = {
  '订单状态查询': '您可以在"我的订单"页面查看所有订单状态。每个订单会显示当前进度，包括待接单、配送中、已完成等状态。请问您想查询哪个订单？',
  '费用说明': '我们的定价标准如下：小型快递¥2起、中型快递¥3起、食堂代买¥3起。实际费用根据距离和重量等因素由接单时协商确定，下单时会显示预估费用。新用户前10单免服务费哦！',
  '投诉建议': '非常抱歉给您带来不好的体验！请详细描述您遇到的问题，包括订单编号、具体情况等，我们会尽快为您处理。您也可以拨打创作者电话19976889490或添加微信zy1118dh联系我们。',
  '如何下单': '下单步骤：1. 选择服务类型（快递代取/食堂代买等）；2. 填写取件地址和送达地址；3. 填写物品信息和备注；4. 提交订单并付款。简单四步即可完成！',
  '退款流程': '退款流程：1. 进入"我的订单"页面；2. 选择需要退款的订单；3. 点击"申请退款"按钮；4. 选择退款原因并提交；5. 等待客服审核；6. 审核通过后款项将原路退回。',
  '骑手认证': '成为骑手步骤：1. 在个人中心点击"切换到骑手端"；2. 完成实名认证（需上传身份证和学生证）；3. 等待平台审核（通常1-3个工作日）；4. 审核通过后即可开始接单。',
  '优惠券使用': '新用户注册即享10单免服务费优惠！下单时系统自动匹配可用优惠券，也可在确认订单页面手动选择。优惠券不可叠加使用，每单限用一张。',
  '支付问题': '如支付遇到问题：1. 检查银行卡余额是否充足；2. 确认网络连接正常；3. 尝试更换支付方式（微信/支付宝/银行卡）。如仍无法解决，请联系创作者电话19976889490或微信zy1118dh。'
}

const INTENT_KEYWORDS = {
  '订单状态查询': ['订单', '状态', '查询', '进度', '配送中', '待接单'],
  '费用说明': ['费用', '价格', '多少钱', '定价', '收费', '报价'],
  '投诉建议': ['投诉', '差评', '举报', '建议', '反馈', '不满意'],
  '如何下单': ['下单', '怎么用', '如何', '使用', '发单', '发布'],
  '退款流程': ['退款', '退钱', '退单', '返还', '退货'],
  '骑手认证': ['骑手', '跑腿', '接单', '认证', '成为骑手', '注册骑手'],
  '优惠券使用': ['优惠券', '优惠', '折扣', '代金券', '减免'],
  '支付问题': ['支付', '付款', '余额', '充值', '银行卡', '钱包'],
  '联系客服': ['电话', '微信', '客服', '联系', '人工', '创作者']
}

function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
}

function getAIReply(text) {
  if (!text) return '请问有什么可以帮您？'
  
  const exactReply = AI_REPLIES[text]
  if (exactReply) return { reply: exactReply, intent: text }
  
  const loweredText = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (loweredText.includes(keyword.toLowerCase())) {
        return { reply: AI_REPLIES[intent], intent }
      }
    }
  }
  
  return {
    reply: '感谢您的咨询！我已经记录了您的问题。如果需要更详细的帮助，您可以联系人工客服（创作者电话：19976889490，创作者微信：zy1118dh），他们会尽快为您解答。',
    intent: 'unknown'
  }
}

exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID, USERID } = context

  const userId = USERID || event.userId || 'anonymous'

  switch (action) {
    case 'createSession': {
      try {
        const sessionId = generateSessionId()
        const initialMessage = {
          role: 'ai',
          content: '您好！我是邻寝帮AI智能客服，很高兴为您服务。我可以帮您解答订单状态、费用说明、退款流程、骑手认证等问题。如需人工服务，可随时拨打创作者电话 19976889490 或添加微信 zy1118dh。请问有什么可以帮您？',
          timestamp: Date.now(),
          intent: ''
        }
        
        await db.collection('ai-chat').add({
          user_id: userId,
          session_id: sessionId,
          order_id: data && data.orderId ? data.orderId : null,
          messages: [initialMessage],
          message_count: 1,
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now()
        })
        
        return {
          errCode: 0,
          errMsg: '会话创建成功',
          data: {
            sessionId,
            message: initialMessage
          }
        }
      } catch (e) {
        return { errCode: 'CREATE_ERROR', errMsg: '创建会话失败: ' + e.message }
      }
    }

    case 'sendMessage': {
      try {
        const { sessionId, content, orderId } = data
        
        if (!sessionId || !content) {
          return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
        }
        
        const sessionRes = await db.collection('ai-chat')
          .where({ session_id: sessionId })
          .get()
        
        if (!sessionRes.data || sessionRes.data.length === 0) {
          return { errCode: 'NOT_FOUND', errMsg: '会话不存在' }
        }
        
        const session = sessionRes.data[0]
        const userMessage = {
          role: 'user',
          content: content,
          timestamp: Date.now(),
          intent: ''
        }
        
        const { reply, intent } = getAIReply(content)
        const aiMessage = {
          role: 'ai',
          content: reply,
          timestamp: Date.now(),
          intent
        }
        
        const messages = [...session.messages, userMessage, aiMessage]
        
        await db.collection('ai-chat').doc(session._id).update({
          messages,
          message_count: messages.length,
          updated_at: Date.now()
        })
        
        return {
          errCode: 0,
          errMsg: '发送成功',
          data: {
            userMessage,
            aiMessage,
            sessionId
          }
        }
      } catch (e) {
        return { errCode: 'SEND_ERROR', errMsg: '发送消息失败: ' + e.message }
      }
    }

    case 'getSession': {
      try {
        const { sessionId } = data
        
        let query = {}
        if (sessionId) {
          query.session_id = sessionId
        } else {
          query.user_id = userId
          query.status = 'active'
        }
        
        const res = await db.collection('ai-chat')
          .where(query)
          .orderBy('updated_at', 'desc')
          .limit(1)
          .get()
        
        if (!res.data || res.data.length === 0) {
          return { errCode: 'NOT_FOUND', errMsg: '会话不存在', data: null }
        }
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: res.data[0]
        }
      } catch (e) {
        return { errCode: 'GET_ERROR', errMsg: '获取会话失败: ' + e.message }
      }
    }

    case 'getUserSessions': {
      try {
        const page = (data && data.page) || 1
        const limit = (data && data.limit) || 20
        
        const res = await db.collection('ai-chat')
          .where({ user_id: userId })
          .orderBy('updated_at', 'desc')
          .skip((page - 1) * limit)
          .limit(limit)
          .get()
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            list: res.data,
            page,
            limit,
            total: res.data.length
          }
        }
      } catch (e) {
        return { errCode: 'GET_ERROR', errMsg: '获取会话列表失败: ' + e.message }
      }
    }

    case 'getAllSessions': {
      try {
        const page = (data && data.page) || 1
        const limit = (data && data.limit) || 20
        const status = data && data.status
        
        let query = {}
        if (status) query.status = status
        
        const countResult = await db.collection('ai-chat').where(query).count()
        const total = countResult.total
        
        const res = await db.collection('ai-chat')
          .where(query)
          .orderBy('updated_at', 'desc')
          .skip((page - 1) * limit)
          .limit(limit)
          .get()
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            list: res.data || [],
            page,
            limit,
            total
          }
        }
      } catch (e) {
        return { errCode: 'GET_ERROR', errMsg: '获取会话列表失败: ' + e.message }
      }
    }

    case 'closeSession': {
      try {
        const { sessionId, status = 'resolved' } = data
        
        await db.collection('ai-chat')
          .where({ session_id: sessionId })
          .update({
            status,
            updated_at: Date.now()
          })
        
        return { errCode: 0, errMsg: '会话已关闭' }
      } catch (e) {
        return { errCode: 'CLOSE_ERROR', errMsg: '关闭会话失败: ' + e.message }
      }
    }

    case 'deleteSession': {
      try {
        const { sessionId } = data
        
        const result = await db.collection('ai-chat')
          .where({ session_id: sessionId })
          .remove()
        
        return { errCode: 0, errMsg: '删除成功', data: { deleted: result.deleted } }
      } catch (e) {
        return { errCode: 'DELETE_ERROR', errMsg: '删除会话失败: ' + e.message }
      }
    }

    case 'getAIReply': {
      try {
        const { content } = data
        const { reply, intent } = getAIReply(content)
        
        return {
          errCode: 0,
          errMsg: '获取成功',
          data: {
            reply,
            intent
          }
        }
      } catch (e) {
        return { errCode: 'ERROR', errMsg: '获取回复失败: ' + e.message }
      }
    }

    default:
      return { errCode: 'INVALID_ACTION', errMsg: '未知操作: ' + action }
  }
}
