import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface Order {
  id: string
  orderNo: string
  type: string
  pickup: string
  delivery: string
  rider: string
  status: 'pending' | 'delivering' | 'completed' | 'cancelled'
  price: number
  createTime: string
}

const orders: Order[] = [
  {
    id: '1',
    orderNo: 'DD20250723001',
    type: '快递代取',
    pickup: '菜鸟驿站',
    delivery: '12号楼',
    rider: '小王同学',
    status: 'delivering',
    price: 5.00,
    createTime: '2025-07-23 12:45:00'
  },
  {
    id: '2',
    orderNo: 'DD20250723002',
    type: '食堂代买',
    pickup: '二食堂',
    delivery: '5号楼302',
    rider: '张小凡',
    status: 'completed',
    price: 3.00,
    createTime: '2025-07-23 11:20:00'
  },
  {
    id: '3',
    orderNo: 'DD20250723003',
    type: '即时速递',
    pickup: '图书馆',
    delivery: '3号楼',
    rider: '无人接单',
    status: 'pending',
    price: 8.00,
    createTime: '2025-07-23 10:05:00'
  },
  {
    id: '4',
    orderNo: 'DD20250722004',
    type: '代办事务',
    pickup: '行政楼',
    delivery: '6号楼',
    rider: '李同学',
    status: 'completed',
    price: 10.00,
    createTime: '2025-07-22 16:30:00'
  },
  {
    id: '5',
    orderNo: 'DD20250721005',
    type: '快递代取',
    pickup: '菜鸟驿站',
    delivery: '8号楼',
    rider: '无人接单',
    status: 'cancelled',
    price: 4.00,
    createTime: '2025-07-21 09:15:00'
  }
]

const statusMap = {
  pending: { text: '待接单', color: '#F59E0B' },
  delivering: { text: '配送中', color: '#1E3A5F' },
  completed: { text: '已完成', color: '#059669' },
  cancelled: { text: '已取消', color: '#6B7280' }
}

const OrderTablePage: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<string>('all')

  const filteredOrders = activeStatus === 'all'
    ? orders
    : orders.filter(o => o.status === activeStatus)

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    pending: orders.filter(o => o.status === 'pending').length
  }

  const handleOrderDetail = (order: Order) => {
    Taro.showModal({
      title: '订单详情',
      content: `订单号: ${order.orderNo}\n类型: ${order.type}\n状态: ${statusMap[order.status].text}\n金额: ¥${order.price.toFixed(2)}`,
      showCancel: false
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>订单管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>总订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待接单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#1E3A5F' }}>{stats.delivering}</Text>
            <Text className={styles.statLabel}>配送中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#059669' }}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.tableContainer}>
        <View className={styles.tableHeader}>
          <Text className={styles.th}>订单号</Text>
          <Text className={styles.th}>类型</Text>
          <Text className={styles.th}>骑手</Text>
          <Text className={styles.th}>金额</Text>
          <Text className={styles.th}>状态</Text>
        </View>
        <ScrollView scrollY className={styles.tableBody}>
          {filteredOrders.map(order => (
            <View
              key={order.id}
              className={styles.tableRow}
              onClick={() => handleOrderDetail(order)}
            >
              <Text className={styles.td} style={{ maxWidth: '140rpx' }}>{order.orderNo.slice(-8)}</Text>
              <Text className={styles.td}>{order.type}</Text>
              <Text className={styles.td} style={{ maxWidth: '100rpx' }}>{order.rider}</Text>
              <Text className={styles.td}>¥{order.price.toFixed(2)}</Text>
              <Text className={styles.td} style={{ color: statusMap[order.status].color, fontWeight: 500 }}>
                {statusMap[order.status].text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export default OrderTablePage