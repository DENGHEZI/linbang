const PAYMENT_CONFIG_KEY = 'payment_config'
const PAYMENT_RECORD_KEY = 'payment_records'

function generateTimeStamp() {
  return Math.floor(Date.now() / 1000).toString()
}

function generateNonceStr() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generatePaySign(params, secretKey) {
  const sortedKeys = Object.keys(params).sort()
  let signStr = ''
  sortedKeys.forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      signStr += key + '=' + params[key] + '&'
    }
  })
  signStr = signStr.substring(0, signStr.length - 1)
  
  signStr += '&key=' + secretKey
  
  let hash = 0
  for (let i = 0; i < signStr.length; i++) {
    const char = signStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
}

function getPaymentConfig() {
  try {
    let config = uni.getStorageSync(PAYMENT_CONFIG_KEY)
    if (!config) {
      config = {
        appId: 'wx_local_appid',
        mchId: '1600000000',
        apiKey: 'your_api_key_here',
        notifyUrl: 'https://your-domain.com/api/payment/notify'
      }
      uni.setStorageSync(PAYMENT_CONFIG_KEY, config)
    }
    return config
  } catch (e) {
    return {
      appId: 'wx_local_appid',
      mchId: '1600000000',
      apiKey: 'your_api_key_here',
      notifyUrl: 'https://your-domain.com/api/payment/notify'
    }
  }
}

function savePaymentRecord(record) {
  try {
    const records = uni.getStorageSync(PAYMENT_RECORD_KEY) || []
    records.unshift(record)
    uni.setStorageSync(PAYMENT_RECORD_KEY, records.slice(0, 100))
  } catch (e) {
    console.error('[payment] 保存支付记录失败:', e)
  }
}

export const paymentService = {
  async createPayment(params) {
    const { orderId, orderNo, amount, payType = 'wechat', description } = params
    
    if (!orderId || !amount) {
      return { errCode: 'PARAM_ERROR', errMsg: '参数不完整' }
    }

    const config = getPaymentConfig()
    const timeStamp = generateTimeStamp()
    const nonceStr = generateNonceStr()
    const package_str = `prepay_id=${nonceStr}`
    
    const signParams = {
      appId: config.appId,
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: package_str,
      signType: 'MD5'
    }
    
    const paySign = generatePaySign(signParams, config.apiKey)

    return {
      errCode: 0,
      errMsg: '创建支付单成功',
      data: {
        orderId,
        orderNo,
        amount: Number(amount).toFixed(2),
        payType,
        description: description || '跑腿服务费用',
        timeStamp,
        nonceStr,
        package: package_str,
        signType: 'MD5',
        paySign
      }
    }
  },

  async requestWechatPay(paymentData) {
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType,
        paySign: paymentData.paySign,
        success: (res) => {
          resolve({
            errCode: 0,
            errMsg: '支付成功',
            data: res
          })
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) {
            resolve({ errCode: 'USER_CANCEL', errMsg: '用户取消支付' })
          } else {
            reject({ errCode: 'PAY_ERROR', errMsg: err.errMsg || '支付失败', data: err })
          }
        }
      })
    })
  },

  async requestAlipay(paymentData) {
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'alipay',
        orderInfo: paymentData.orderInfo || JSON.stringify({
          out_trade_no: paymentData.orderNo,
          total_amount: paymentData.amount,
          subject: paymentData.description,
          product_code: 'QUICK_MSECURITY_PAY'
        }),
        success: (res) => {
          resolve({
            errCode: 0,
            errMsg: '支付成功',
            data: res
          })
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) {
            resolve({ errCode: 'USER_CANCEL', errMsg: '用户取消支付' })
          } else {
            reject({ errCode: 'PAY_ERROR', errMsg: err.errMsg || '支付失败', data: err })
          }
        }
      })
    })
  },

  async requestBankPay(paymentData) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '银行卡支付',
        content: `确认使用交通银行储蓄卡(尾号4881)支付 ¥${paymentData.amount} 吗？`,
        success: (res) => {
          if (res.confirm) {
            setTimeout(() => {
              resolve({ errCode: 0, errMsg: '支付成功' })
            }, 1500)
          } else {
            resolve({ errCode: 'USER_CANCEL', errMsg: '用户取消支付' })
          }
        }
      })
    })
  },

  async processPayment(params) {
    const { orderId, orderNo, amount, payType, description } = params

    const createResult = await this.createPayment({
      orderId,
      orderNo,
      amount,
      payType,
      description
    })

    if (createResult.errCode !== 0) {
      return createResult
    }

    const paymentData = createResult.data
    
    try {
      let payResult
      
      switch (payType) {
        case 'wechat':
          payResult = await this.requestWechatPay(paymentData)
          break
        case 'alipay':
          payResult = await this.requestAlipay(paymentData)
          break
        case 'bank':
          payResult = await this.requestBankPay(paymentData)
          break
        default:
          payResult = await this.requestBankPay(paymentData)
      }

      if (payResult.errCode === 0) {
        savePaymentRecord({
          orderId,
          orderNo,
          amount: paymentData.amount,
          payType,
          status: 'success',
          paidAt: Date.now()
        })
      }

      return payResult
    } catch (error) {
      savePaymentRecord({
        orderId,
        orderNo,
        amount: paymentData.amount,
        payType,
        status: 'failed',
        errorMsg: error.errMsg,
        failedAt: Date.now()
      })

      return {
        errCode: 'PAY_ERROR',
        errMsg: error.errMsg || '支付失败，请重试'
      }
    }
  },

  async getPaymentRecords() {
    try {
      return uni.getStorageSync(PAYMENT_RECORD_KEY) || []
    } catch (e) {
      return []
    }
  },

  async updateConfig(config) {
    const current = getPaymentConfig()
    const updated = { ...current, ...config }
    uni.setStorageSync(PAYMENT_CONFIG_KEY, updated)
    return { errCode: 0, errMsg: '配置已更新', data: updated }
  },

  getConfig() {
    return getPaymentConfig()
  }
}
