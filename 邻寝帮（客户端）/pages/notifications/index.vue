<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">消息通知</text>
			<view class="header-action" @click="markAllRead">
				<text class="action-text">全部已读</text>
			</view>
		</view>

		<view class="tabs-bar">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'all' }"
				@click="switchTab('all')"
			>
				<text class="tab-text">全部</text>
				<view class="tab-badge" v-if="unreadCount > 0 && currentTab === 'all'">
					<text class="badge-num">{{ unreadCount }}</text>
				</view>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'order' }"
				@click="switchTab('order')"
			>
				<text class="tab-text">订单通知</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'system' }"
				@click="switchTab('system')"
			>
				<text class="tab-text">系统通知</text>
			</view>
		</view>

		<scroll-view scroll-y class="content-area" :show-scrollbar="false">
			<view class="notif-list" v-if="filteredList.length > 0">
				<view 
					class="notif-item" 
					v-for="(item, index) in filteredList" 
					:key="item.id"
					:class="{ unread: !item.read }"
					@click="openNotif(item)"
				>
					<view class="notif-icon-wrap" :style="{ backgroundColor: getIconColor(item.type) }">
						<view class="notif-icon" :class="getIconClass(item.type)"></view>
					</view>
					<view class="notif-content">
						<view class="notif-header">
							<text class="notif-title">{{ item.title }}</text>
							<view class="unread-dot" v-if="!item.read"></view>
						</view>
						<text class="notif-desc">{{ item.desc }}</text>
						<view class="notif-meta">
							<text class="notif-time">{{ formatTime(item.time) }}</text>
						</view>
					</view>
					<view class="notif-arrow"></view>
				</view>
			</view>

			<view class="empty-state" v-else>
				<view class="empty-icon"></view>
				<text class="empty-text">暂无消息</text>
				<text class="empty-desc">订单状态更新、系统公告将在此显示</text>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	const NOTIFICATIONS_KEY = 'user_notifications'

	function getDefaultNotifications() {
		return [
			{
				id: 'notif_1',
				type: 'order',
				title: '订单已接单',
				desc: '骑手已接单，预计30分钟内送达',
				time: Date.now() - 1000 * 60 * 30,
				read: false,
				orderId: 'order_001'
			},
			{
				id: 'notif_2',
				type: 'order',
				title: '订单已送达',
				desc: '您的订单已完成，请及时确认收货',
				time: Date.now() - 1000 * 60 * 60 * 2,
				read: false,
				orderId: 'order_002'
			},
			{
				id: 'notif_3',
				type: 'system',
				title: '新用户福利',
				desc: '前十单免服务费特权已激活，快下单体验吧！',
				time: Date.now() - 1000 * 60 * 60 * 24,
				read: true
			},
			{
				id: 'notif_4',
				type: 'system',
				title: '支付安全提醒',
				desc: '请不要在公共场合输入银行卡密码，注意账户安全',
				time: Date.now() - 1000 * 60 * 60 * 48,
				read: true
			}
		]
	}

	export default {
		data() {
			return {
				currentTab: 'all',
				notifications: [],
				bottomSpace: 200
			}
		},
		computed: {
			filteredList() {
				if (this.currentTab === 'all') return this.notifications
				return this.notifications.filter(n => n.type === this.currentTab)
			},
			unreadCount() {
				return this.notifications.filter(n => !n.read).length
			}
		},
		onShow() {
			this.loadNotifications()
		},
		methods: {
			loadNotifications() {
				try {
					let list = uni.getStorageSync(NOTIFICATIONS_KEY)
					if (!list || !Array.isArray(list) || list.length === 0) {
						list = getDefaultNotifications()
						uni.setStorageSync(NOTIFICATIONS_KEY, list)
					}
					this.notifications = list.sort((a, b) => b.time - a.time)
				} catch (e) {
					this.notifications = getDefaultNotifications()
				}
			},
			saveNotifications() {
				try {
					uni.setStorageSync(NOTIFICATIONS_KEY, this.notifications)
				} catch (e) {}
			},
			switchTab(tab) {
				this.currentTab = tab
			},
			getIconColor(type) {
				const colors = {
					order: '#4A90D9',
					system: '#10B981',
					promo: '#F59E0B'
				}
				return colors[type] || '#4A90D9'
			},
			getIconClass(type) {
				const icons = {
					order: 'icon-order',
					system: 'icon-system',
					promo: 'icon-promo'
				}
				return icons[type] || 'icon-order'
			},
			formatTime(time) {
				const diff = Date.now() - time
				const minutes = Math.floor(diff / 60000)
				const hours = Math.floor(diff / 3600000)
				const days = Math.floor(diff / 86400000)

				if (minutes < 1) return '刚刚'
				if (minutes < 60) return minutes + '分钟前'
				if (hours < 24) return hours + '小时前'
				if (days < 7) return days + '天前'

				const date = new Date(time)
				return `${date.getMonth() + 1}月${date.getDate()}日`
			},
			openNotif(item) {
				if (!item.read) {
					item.read = true
					this.saveNotifications()
				}

				if (item.type === 'order' && item.orderId) {
					uni.navigateTo({
						url: '/pages/order-detail/index?id=' + item.orderId
					})
				}
			},
			markAllRead() {
				const unread = this.notifications.filter(n => !n.read)
				if (unread.length === 0) {
					uni.showToast({ title: '已是已读状态', icon: 'none' })
					return
				}
				this.notifications.forEach(n => { n.read = true })
				this.saveNotifications()
				uni.showToast({ title: '已全部标记为已读', icon: 'none' })
			},
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background: #F5F8FA;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: #fff;
		padding: 88rpx 32rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #F3F4F6;
	}

	.back-btn {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-back {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #1F2937;
		border-bottom: 4rpx solid #1F2937;
		transform: rotate(45deg);
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.header-action {
		padding: 12rpx 20rpx;
		background: #EFF6FF;
		border-radius: 20rpx;
	}

	.action-text {
		font-size: 24rpx;
		color: #4A90D9;
	}

	.tabs-bar {
		display: flex;
		background: #fff;
		padding: 0 24rpx;
		border-bottom: 1rpx solid #F3F4F6;
	}

	.tab-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 0;
		position: relative;
		gap: 8rpx;

		&.active {
			.tab-text {
				color: #4A90D9;
				font-weight: 600;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 48rpx;
				height: 4rpx;
				background: #4A90D9;
				border-radius: 2rpx;
			}
		}
	}

	.tab-text {
		font-size: 28rpx;
		color: #6B7280;
	}

	.tab-badge {
		background: #EF4444;
		min-width: 32rpx;
		height: 32rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 8rpx;
	}

	.badge-num {
		font-size: 20rpx;
		color: #fff;
		font-weight: 600;
	}

	.content-area {
		flex: 1;
		padding: 24rpx;
	}

	.notif-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.notif-item {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx 24rpx;
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		position: relative;
		transition: background 0.2s;

		&:active {
			background: #F8FAFC;
		}

		&.unread {
			background: #F8FBFF;
		}
	}

	.notif-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.notif-icon {
		width: 36rpx;
		height: 36rpx;
		position: relative;

		&.icon-order {
			border: 4rpx solid #fff;
			border-radius: 6rpx;

			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 8rpx;
				right: 8rpx;
				height: 3rpx;
				background: #fff;
				box-shadow: 0 10rpx 0 #fff;
			}
		}

		&.icon-system {
			background: #fff;
			border-radius: 50%;

			&::after {
				content: '!';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 24rpx;
				font-weight: 700;
				color: #10B981;
			}
		}

		&.icon-promo {
			width: 24rpx;
			height: 24rpx;
			background: #fff;
			border-radius: 6rpx;
			transform: rotate(45deg);
		}
	}

	.notif-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.notif-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.notif-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.unread-dot {
		width: 16rpx;
		height: 16rpx;
		background: #EF4444;
		border-radius: 50%;
	}

	.notif-desc {
		font-size: 26rpx;
		color: #6B7280;
		line-height: 1.5;
	}

	.notif-meta {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.notif-time {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.notif-arrow {
		width: 16rpx;
		height: 16rpx;
		border-right: 3rpx solid #D1D5DB;
		border-top: 3rpx solid #D1D5DB;
		transform: rotate(45deg);
		margin-top: 20rpx;
		flex-shrink: 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 160rpx 60rpx;
	}

	.empty-icon {
		width: 160rpx;
		height: 160rpx;
		background: #E5E7EB;
		border-radius: 50%;
		margin-bottom: 32rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -60%);
			width: 48rpx;
			height: 56rpx;
			border: 4rpx solid #9CA3AF;
			border-radius: 12rpx 12rpx 12rpx 0;
			transform-origin: center;
		}
	}

	.empty-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #6B7280;
		margin-bottom: 12rpx;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.list-bottom-space {
		height: 100rpx;
	}
</style>
