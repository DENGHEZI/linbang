<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">账户充值</text>
			<view class="header-placeholder"></view>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false">
			<view class="balance-card">
				<view class="balance-info">
					<text class="balance-label">当前余额</text>
					<view class="balance-amount-row">
						<text class="balance-symbol">¥</text>
						<text class="balance-value">{{ currentBalance }}</text>
					</view>
				</view>
			</view>

			<view class="section">
				<text class="section-title">选择充值金额</text>
				<view class="amount-grid">
					<view 
						class="amount-item" 
						v-for="(item, index) in amountOptions" 
						:key="index"
						:class="{ active: selectedAmount === item.value }"
						@click="selectAmount(item.value)"
					>
						<view class="amount-badge" v-if="item.badge">{{ item.badge }}</view>
						<text class="amount-value">¥{{ item.value }}</text>
						<text class="amount-desc">{{ item.desc }}</text>
						<view class="amount-check" v-if="selectedAmount === item.value">
							<text class="check-icon">✓</text>
						</view>
					</view>
				</view>
			</view>

			<view class="section custom-section">
				<text class="section-title">自定义金额</text>
				<view class="custom-input-row">
					<text class="currency-symbol">¥</text>
					<input 
						class="amount-input" 
						type="digit" 
						v-model="customAmount"
						placeholder="请输入充值金额"
						@blur="validateCustomAmount"
					/>
					<view class="input-clear" v-if="customAmount" @click="clearCustomAmount">
						<text class="clear-icon">×</text>
					</view>
				</view>
				<text class="input-tip">单笔充值最低1元，最高500元</text>
			</view>

			<view class="section payment-section">
				<text class="section-title">支付方式</text>
				<view class="payment-method">
					<view class="method-icon-wrap bank">
						<view class="icon-bank-card"></view>
					</view>
					<view class="method-info">
						<text class="method-title">交通银行储蓄卡</text>
						<text class="method-desc">尾号 4881</text>
					</view>
					<view class="method-tag">默认</view>
				</view>
			</view>

			<view class="section agreement-section">
				<view class="agreement-row">
					<view class="checkbox" :class="{ checked: agreed }" @click="toggleAgreement">
						<view class="check-icon" v-if="agreed"></view>
					</view>
					<text class="agreement-text">我已阅读并同意</text>
					<text class="agreement-link" @click="showAgreement">《充值协议》</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<view class="footer">
			<view class="selected-info" v-if="finalAmount > 0">
				<text class="selected-label">充值金额</text>
				<text class="selected-value">¥{{ finalAmount.toFixed(2) }}</text>
			</view>
			<view 
				class="recharge-btn" 
				:class="{ disabled: !canRecharge || recharging }"
				@click="handleRecharge"
			>
				<view class="loading-icon" v-if="recharging"></view>
				<text class="btn-text">{{ recharging ? '充值中...' : '确认充值' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { walletService } from '@/services/wallet.js'
	import { paymentService } from '@/services/payment.js'

	export default {
		data() {
			return {
				currentBalance: '0.00',
				selectedAmount: 0,
				customAmount: '',
				agreed: true,
				recharging: false,
				amountOptions: [
					{ value: 10, desc: '小额充值', badge: null },
					{ value: 30, desc: '常用金额', badge: null },
					{ value: 50, desc: '推荐', badge: '推荐' },
					{ value: 100, desc: '大额充值', badge: null },
					{ value: 200, desc: '超值优惠', badge: '送2元' },
					{ value: 500, desc: '最高充值', badge: '送5元' }
				]
			}
		},
		computed: {
			finalAmount() {
				if (this.customAmount) {
					return parseFloat(this.customAmount) || 0
				}
				return this.selectedAmount
			},
			canRecharge() {
				return this.agreed && this.finalAmount >= 1 && this.finalAmount <= 500
			}
		},
		async onLoad() {
			await this.loadBalance()
		},
		methods: {
			async loadBalance() {
				try {
					const result = await walletService.getBalance()
					if (result.errCode === 0) {
						this.currentBalance = result.data.balance
					}
				} catch (e) {
					console.error('加载余额失败:', e)
				}
			},
			selectAmount(value) {
				this.selectedAmount = value
				this.customAmount = ''
			},
			validateCustomAmount() {
				if (this.customAmount) {
					const amount = parseFloat(this.customAmount)
					if (isNaN(amount) || amount < 1) {
						uni.showToast({ title: '最低充值1元', icon: 'none' })
						this.customAmount = ''
						return
					}
					if (amount > 500) {
						uni.showToast({ title: '最高充值500元', icon: 'none' })
						this.customAmount = '500'
					}
					this.selectedAmount = 0
				}
			},
			clearCustomAmount() {
				this.customAmount = ''
			},
			toggleAgreement() {
				this.agreed = !this.agreed
			},
			showAgreement() {
				uni.showModal({
					title: '充值协议',
					content: '1. 充值金额将存入您的账户余额\n2. 充值金额仅限用于跑腿服务费用\n3. 充值成功后不支持退款\n4. 如有问题请联系客服',
					showCancel: false,
					confirmText: '我已阅读'
				})
			},
			goBack() {
				uni.navigateBack()
			},
			async handleRecharge() {
				if (!this.canRecharge || this.recharging) return

				const amount = this.finalAmount
				
				uni.showModal({
					title: '确认充值',
					content: `您将充值 ¥${amount.toFixed(2)}\n支付方式：交通银行储蓄卡(尾号4881)\n是否确认？`,
					confirmText: '确认支付',
					cancelText: '取消',
					success: async (res) => {
						if (res.confirm) {
							await this.processRecharge(amount)
						}
					}
				})
			},
			async processRecharge(amount) {
				this.recharging = true
				
				try {
					uni.showLoading({ title: '正在支付...' })
					
					const result = await paymentService.processPayment({
						orderId: 'recharge_' + Date.now(),
						orderNo: 'RC' + Date.now(),
						amount: amount.toFixed(2),
						payType: 'bank',
						description: '账户充值'
					})
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						await this.completeRecharge(amount)
					} else if (result.errCode === 'USER_CANCEL') {
						uni.showToast({ title: '已取消充值', icon: 'none' })
					} else {
						uni.showModal({
							title: '支付失败',
							content: result.errMsg || '支付过程中出现错误',
							showCancel: false
						})
					}
				} catch (error) {
					uni.hideLoading()
					uni.showModal({
						title: '充值失败',
						content: error.errMsg || '网络异常，请重试',
						showCancel: false
					})
				} finally {
					this.recharging = false
				}
			},
			async completeRecharge(amount) {
				try {
					const result = await walletService.recharge(amount)
					
					if (result.errCode === 0) {
						this.currentBalance = result.data.balance
						
						uni.showModal({
							title: '充值成功',
							content: `已成功充值 ¥${amount.toFixed(2)}\n当前余额：¥${this.currentBalance}`,
							showCancel: false,
							confirmText: '完成',
							success: (res) => {
								if (res.confirm) {
									uni.navigateBack()
								}
							}
						})
					}
				} catch (e) {
					uni.showModal({
						title: '系统异常',
						content: '充值可能已成功，如未到账请联系客服',
						showCancel: false
					})
				}
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 88rpx 32rpx 24rpx;
		background: #fff;
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

	.header-placeholder {
		width: 64rpx;
	}

	.content {
		flex: 1;
		padding: 24rpx;
	}

	.balance-card {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
	}

	.balance-info {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.balance-label {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.balance-amount-row {
		display: flex;
		align-items: baseline;
		gap: 8rpx;
	}

	.balance-symbol {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}

	.balance-value {
		font-size: 56rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 2rpx;
	}

	.section {
		background: #fff;
		border-radius: 20rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #1F2937;
		display: block;
		margin-bottom: 24rpx;
	}

	.amount-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.amount-item {
		position: relative;
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 32rpx 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.active {
			background: #EFF6FF;
			border-color: #4A90D9;
		}
	}

	.amount-badge {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		background: linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%);
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.amount-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.amount-desc {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.amount-check {
		position: absolute;
		top: 12rpx;
		right: 12rpx;
		width: 36rpx;
		height: 36rpx;
		background: #4A90D9;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		font-size: 22rpx;
		color: #fff;
		font-weight: 700;
	}

	.custom-section {
		.input-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
		}
	}

	.custom-input-row {
		display: flex;
		align-items: center;
		background: #F5F8FA;
		border-radius: 16rpx;
		padding: 0 24rpx;
		height: 96rpx;
	}

	.currency-symbol {
		font-size: 40rpx;
		font-weight: 600;
		color: #6B7280;
		margin-right: 16rpx;
	}

	.amount-input {
		flex: 1;
		height: 96rpx;
		font-size: 36rpx;
		color: #1F2937;
	}

	.input-clear {
		width: 48rpx;
		height: 48rpx;
		background: #D1D5DB;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-icon {
		font-size: 28rpx;
		color: #fff;
	}

	.input-tip {
		font-size: 24rpx;
		color: #9CA3AF;
		margin-top: 16rpx;
		display: block;
	}

	.payment-section {
		padding: 32rpx;
	}

	.payment-method {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.method-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.method-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.method-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.method-desc {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.method-tag {
		font-size: 22rpx;
		color: #4A90D9;
		background: #EFF6FF;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
	}

	.agreement-section {
		background: transparent;
		padding: 0;
	}

	.agreement-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.checkbox {
		width: 36rpx;
		height: 36rpx;
		border: 2rpx solid #D1D5DB;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.checked {
			background: #4A90D9;
			border-color: #4A90D9;
		}
	}

	.check-icon {
		width: 16rpx;
		height: 10rpx;
		border-left: 3rpx solid #fff;
		border-bottom: 3rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.agreement-text {
		font-size: 26rpx;
		color: #6B7280;
	}

	.agreement-link {
		font-size: 26rpx;
		color: #4A90D9;
	}

	.bottom-space {
		height: 200rpx;
	}

	.footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		padding: 24rpx 32rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.selected-info {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.selected-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.selected-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.recharge-btn {
		flex: 1;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);

		&.disabled {
			opacity: 0.5;
			pointer-events: none;
		}
	}

	.loading-icon {
		width: 32rpx;
		height: 32rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.btn-text {
		font-size: 34rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 2rpx;
	}

	.icon-bank-card {
		width: 40rpx;
		height: 40rpx;
		position: relative;
		
		&::before {
			content: '💳';
			font-size: 36rpx;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
</style>
