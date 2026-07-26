<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-arrow-left"></view>
			</view>
			<text class="header-title">我的钱包</text>
			<view class="header-placeholder"></view>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false">
			<view class="balance-card">
				<text class="balance-label">可用余额 (元)</text>
				<view class="balance-row">
					<text class="balance-symbol">¥</text>
					<text class="balance-amount">{{ balance }}</text>
				</view>
				<view class="balance-stats">
					<view class="stat-item">
						<text class="stat-value income">+{{ totalIncome }}</text>
						<text class="stat-label">总收入</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-value expense">-{{ totalExpense }}</text>
						<text class="stat-label">总支出</text>
					</view>
				</view>
				<view class="balance-actions">
					<view class="action-btn primary" @click="handleRecharge">
						<text class="action-text primary">充值</text>
					</view>
					<view class="action-btn secondary" @click="handleWithdraw">
						<text class="action-text secondary">提现</text>
					</view>
				</view>
			</view>

			<view class="transaction-section">
				<view class="section-header">
					<text class="section-title">收支明细</text>
				</view>

				<view class="transaction-list" v-if="transactions.length > 0">
					<view
						class="transaction-item"
						v-for="(item, index) in transactions"
						:key="index"
						@click="viewDetail(item)"
					>
						<view class="tx-icon-wrap" :class="item.iconBg">
							<view v-if="item.iconType === 'package'" class="tx-icon icon-package"></view>
							<view v-else-if="item.iconType === 'wallet'" class="tx-icon icon-wallet-plus"></view>
							<view v-else-if="item.iconType === 'food'" class="tx-icon icon-food"></view>
							<view v-else-if="item.iconType === 'shopping'" class="tx-icon icon-shopping"></view>
							<view v-else-if="item.iconType === 'transfer'" class="tx-icon icon-transfer"></view>
						</view>
						<view class="tx-info">
							<text class="tx-desc">{{ item.desc }}</text>
							<text class="tx-time">{{ item.time }}</text>
						</view>
						<view class="tx-amount" :class="item.type">
							<text class="tx-amount-text">{{ item.type === 'expense' ? '-' : '+' }}{{ item.amount }}</text>
						</view>
					</view>
				</view>
				
				<view class="empty-state" v-else>
					<view class="empty-icon"></view>
					<text class="empty-text">暂无交易记录</text>
					<text class="empty-hint">完成订单后将自动记录收支</text>
				</view>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { walletService } from '@/services/wallet.js'

	export default {
		data() {
			return {
				balance: '0.00',
				totalIncome: '0.00',
				totalExpense: '0.00',
				transactions: [],
				loading: false
			}
		},
		async onLoad() {
			await this.loadWallet()
		},
		async onShow() {
			await this.loadWallet()
		},
		methods: {
			async loadWallet() {
				this.loading = true
				try {
					const [balanceResult, txResult] = await Promise.all([
						walletService.getBalance(),
						walletService.getTransactionsList({ limit: 20 })
					])
					
					if (balanceResult.errCode === 0) {
						this.balance = balanceResult.data.balance
						this.totalIncome = balanceResult.data.totalIncome
						this.totalExpense = balanceResult.data.totalExpense
					}
					
					if (txResult.errCode === 0) {
						this.transactions = txResult.data.list.map(tx => ({
							...tx,
							iconType: this.getIconType(tx.category),
							iconBg: tx.type === 'expense' ? 'bg-blue' : 'bg-green',
							time: tx.timeText
						}))
					}
				} catch (e) {
					console.error('加载钱包数据失败:', e)
				} finally {
					this.loading = false
				}
			},
			getIconType(category) {
				const iconMap = {
					'recharge': 'wallet',
					'withdraw': 'wallet',
					'order': 'package',
					'earn': 'transfer',
					'food': 'food',
					'shopping': 'shopping'
				}
				return iconMap[category] || 'package'
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}
				})
			},
			handleRecharge() {
				uni.navigateTo({
					url: '/pages/recharge/index'
				})
			},
			handleWithdraw() {
				uni.showModal({
					title: '余额提现',
					editable: true,
					placeholderText: '请输入提现金额',
					success: async (res) => {
						if (res.confirm && res.content) {
							const amount = parseFloat(res.content)
							if (isNaN(amount) || amount <= 0) {
								uni.showToast({ title: '请输入有效金额', icon: 'none' })
								return
							}
							
							uni.showLoading({ title: '提现中...' })
							try {
								const result = await walletService.withdraw(amount)
								uni.hideLoading()
								
								if (result.errCode === 0) {
									uni.showToast({ title: '提现成功', icon: 'success' })
									this.balance = result.data.balance
									await this.loadWallet()
								} else {
									uni.showToast({ 
										title: result.errMsg || '提现失败', 
										icon: 'none' 
									})
								}
							} catch (e) {
								uni.hideLoading()
								uni.showToast({ title: '提现失败', icon: 'none' })
							}
						}
					}
				})
			},
			viewDetail(item) {
				uni.showToast({
					title: item.desc,
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #F5F8FA;
		display: flex;
		flex-direction: column;
	}

	.header {
		background-color: #4A90D9;
		height: 88rpx;
		padding: 0 28rpx;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding-top: calc(var(--status-bar-height, 0px) + 20rpx);
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-arrow-left {
		width: 16rpx;
		height: 16rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
		transform: rotate(45deg);
		margin-left: 8rpx;
	}

	.header-title {
		flex: 1;
		font-size: 34rpx;
		font-weight: 700;
		color: #FFFFFF;
		text-align: center;
	}

	.header-placeholder {
		width: 56rpx;
		height: 56rpx;
	}

	.content {
		flex: 1;
		padding-bottom: 40rpx;
	}

	.balance-card {
		margin: 28rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #3A7BC8 100%);
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8rpx 32rpx rgba(74, 144, 217, 0.25);
	}

	.balance-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 12rpx;
	}

	.balance-row {
		display: flex;
		align-items: baseline;
		margin-bottom: 40rpx;
	}

	.balance-symbol {
		font-size: 36rpx;
		font-weight: 500;
		color: #FFFFFF;
		margin-right: 4rpx;
	}

	.balance-amount {
		font-size: 64rpx;
		font-weight: 700;
		color: #FFFFFF;
		letter-spacing: 2rpx;
	}

	.balance-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 16rpx;
		padding: 20rpx 32rpx;
		margin: 24rpx 0;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
	}

	.stat-value {
		font-size: 32rpx;
		font-weight: 600;
		color: #FFFFFF;

		&.income {
			color: #86EFAC;
		}

		&.expense {
			color: #FCA5A5;
		}
	}

	.stat-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.stat-divider {
		width: 2rpx;
		height: 48rpx;
		background: rgba(255, 255, 255, 0.3);
		margin: 0 64rpx;
	}

	.balance-actions {
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.15s;

		&:active {
			transform: scale(0.97);
		}

		&.primary {
			background: #FFFFFF;
		}

		&.secondary {
			background: rgba(255, 255, 255, 0.2);
			border: 2rpx solid rgba(255, 255, 255, 0.3);
		}
	}

	.action-text {
		font-size: 28rpx;
		font-weight: 600;

		&.primary {
			color: #4A90D9;
		}

		&.secondary {
			color: #FFFFFF;
		}
	}

	.transaction-section {
		margin: 0 28rpx;
		background: #FFFFFF;
		border-radius: 24rpx 24rpx 0 0;
		padding: 32rpx 28rpx;
		min-height: 400rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.transaction-list {
		display: flex;
		flex-direction: column;
	}

	.transaction-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 2rpx solid #F3F4F6;
		transition: background 0.2s;

		&:last-child {
			border-bottom: none;
		}

		&:active {
			background-color: #F9FAFB;
		}
	}

	.tx-icon-wrap {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		flex-shrink: 0;

		&.bg-blue {
			background-color: #EFF6FF;
		}

		&.bg-green {
			background-color: #F0FDF4;
		}

		&.bg-orange {
			background-color: #FFF7ED;
		}

		&.bg-purple {
			background-color: #FAF5FF;
		}
	}

	.tx-icon {
		width: 36rpx;
		height: 36rpx;
		position: relative;
	}

	.icon-package {
		width: 32rpx;
		height: 28rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 3rpx;
			background: #4A90D9;
			transform: translateY(-50%);
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			width: 3rpx;
			height: 12rpx;
			background: #4A90D9;
			transform: translateX(-50%);
		}
	}

	.icon-wallet-plus {
		width: 32rpx;
		height: 24rpx;
		border: 3rpx solid #4ECDC4;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			right: 2rpx;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 6rpx;
			background: #4ECDC4;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			top: -10rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 3rpx;
			height: 10rpx;
			background: #4ECDC4;
		}
	}

	.icon-food {
		width: 28rpx;
		height: 32rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx 4rpx 2rpx 2rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 4rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 14rpx;
			height: 3rpx;
			background: #4A90D9;
			border-radius: 2rpx;
		}

		&::after {
			content: '';
			position: absolute;
			top: 4rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 3rpx;
			height: 8rpx;
			background: #4A90D9;
		}
	}

	.icon-shopping {
		width: 32rpx;
		height: 28rpx;
		border: 3rpx solid #F97316;
		border-radius: 4rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: -8rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 10rpx;
			border: 3rpx solid #F97316;
			border-bottom: none;
			border-radius: 8rpx 8rpx 0 0;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 6rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 8rpx;
			height: 8rpx;
			background: #F97316;
			border-radius: 50%;
		}
	}

	.icon-transfer {
		width: 32rpx;
		height: 24rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 20rpx;
			height: 3rpx;
			background: #A78BFA;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			right: 0;
			width: 20rpx;
			height: 3rpx;
			background: #A78BFA;
		}
	}

	.tx-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		min-width: 0;
	}

	.tx-desc {
		font-size: 28rpx;
		color: #1F2937;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tx-time {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.tx-amount {
		flex-shrink: 0;
	}

	.tx-amount-text {
		font-size: 30rpx;
		font-weight: 700;

		color: #EF4444;
	}

	.tx-amount.income .tx-amount-text {
		color: #4A90D9;
	}

	.tx-amount.expense .tx-amount-text {
		color: #EF4444;
	}

	.list-bottom-space {
		height: 48rpx;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
	}

	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		background: #F3F4F6;
		border-radius: 50%;
		margin-bottom: 24rpx;
		position: relative;

		&::before {
			content: '💰';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 56rpx;
		}
	}

	.empty-text {
		font-size: 28rpx;
		color: #9CA3AF;
		margin-bottom: 12rpx;
	}

	.empty-hint {
		font-size: 24rpx;
		color: #D1D5DB;
	}
</style>