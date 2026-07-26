import React, { useState } from 'react'
import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'

const reasons = ['服务质量不满意', '骑手态度不好', '物品损坏/丢失', '超过时效', '其他原因']

const RefundPage: React.FC = () => {
  const router = useRouter()
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [detail, setDetail] = useState('')

  const handleSubmit = () => {
    if (!selectedReason) {
      Taro.showToast({ title: '请选择退款原因', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '提交中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '退款申请已提交', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }, 1000)
  }

  return (
    <View className={styles.page}>
      <View className={styles.orderInfo}>
        <Text className={styles.orderTitle}>订单 #10086</Text>
        <Text className={styles.orderDesc}>快递代取 · 菜鸟驿站 → 12号楼</Text>
        <View className={styles.orderPrice}>
          <Text className={styles.priceLabel}>申请退款金额</Text>
          <Text className={styles.priceValue}>¥5.00</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>退款原因</Text>
        <View className={styles.reasonList}>
          {reasons.map(reason => (
            <View
              key={reason}
              className={`${styles.reasonItem} ${selectedReason === reason ? styles.selected : ''}`}
              onClick={() => setSelectedReason(reason)}
            >
              <View className={`${styles.radio} ${selectedReason === reason ? styles.radioActive : ''}`}>
                {selectedReason === reason && <View className={styles.radioDot}></View>}
              </View>
              <Text className={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>详细说明</Text>
        <Textarea
          className={styles.detailInput}
          placeholder="请详细描述您遇到的问题..."
          value={detail}
          onInput={e => setDetail(e.detail.value)}
        />
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsIcon}>💡</Text>
        <Text className={styles.tipsText}>温馨提示：退款申请将在 1-3 个工作日内审核完成</Text>
      </View>

      <View className={styles.submitBtn} onClick={handleSubmit}>
        提交退款申请
      </View>
    </View>
  )
}

export default RefundPage