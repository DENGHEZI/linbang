<template>
	<view class="page-container">
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="nav-title">订单支付</text>
			<view class="nav-placeholder"></view>
		</view>

		<view class="user-info-card" v-if="userInfo" @click="goProfile">
			<view class="user-info-row">
				<view class="user-info-avatar">
					<view class="user-avatar-inner"></view>
				</view>
				<view class="user-info-detail">
					<text class="user-info-name">{{ userInfo.nickname }}</text>
					<text class="user-info-meta">学号：{{ userInfo.studentId }} | {{ userInfo.school }}</text>
				</view>
				<view class="user-info-badge" v-if="userInfo.verified">
					<text class="badge-text">已认证</text>
				</view>
				<view class="user-info-edit-icon"></view>
			</view>
		</view>

		<view class="order-summary">
			<view class="order-icon-wrap">
				<view class="order-icon package"></view>
			</view>
			<view class="order-info">
				<text class="order-title">{{ orderInfo.title }}</text>
				<text class="order-desc">{{ orderInfo.desc }}</text>
				<view class="order-id-tag">
					<text class="order-id-text">订单号：{{ orderInfo.orderId }}</text>
				</view>
			</view>
		</view>

		<view class="address-card" v-if="addressInfo">
			<view class="address-header">
				<text class="address-title">配送地址</text>
				<view class="address-edit" @click="goAddress">
					<text class="address-edit-text">修改</text>
				</view>
			</view>
			<view class="address-row">
				<view class="address-icon-wrap">
					<view class="icon-location"></view>
				</view>
				<view class="address-detail">
					<text class="address-name">{{ addressInfo.name }} {{ addressInfo.phone }}</text>
					<text class="address-text">{{ addressInfo.detail }}</text>
				</view>
			</view>
		</view>

		<view class="amount-card">
			<view class="amount-row">
				<text class="amount-label">订单金额</text>
				<text class="amount-value">¥{{ orderInfo.amount }}</text>
			</view>
			<view class="amount-row discount">
				<text class="amount-label discount-label">优惠券抵扣</text>
				<text class="amount-value discount-value">-¥{{ orderInfo.discount }}</text>
			</view>
			<view class="amount-divider"></view>
			<view class="amount-row total">
				<text class="total-label">应付金额</text>
				<view class="total-value-wrap">
					<text class="total-symbol">¥</text>
					<text class="total-amount">{{ finalAmount }}</text>
				</view>
			</view>
		</view>

		<view class="payment-section">
			<text class="section-title">选择支付方式</text>

			<view class="payment-list">
				<view class="payment-item bank" @click="selectPayment('bank')">
					<view class="payment-icon-wrap">
						<view class="payment-icon bank-icon">
							<view class="icon-bank-card"></view>
						</view>
					</view>
					<view class="payment-info">
						<text class="payment-title">{{ currentBank.bankName }}储蓄卡</text>
						<text class="payment-desc">尾号 {{ currentBank.last4 }}</text>
					</view>
					<view class="payment-check" :class="{ checked: selectedPayment === 'bank' }">
						<view class="check-inner" v-if="selectedPayment === 'bank'"></view>
					</view>
					<view class="payment-arrow" @click.stop="showCardList = !showCardList"></view>
				</view>

				<view class="card-list" v-if="selectedPayment === 'bank' && bankCards.length > 0">
					<view 
						class="card-item"
						v-for="(card, index) in bankCards"
						:key="card.id"
						:class="{ active: currentBank.id === card.id }"
						@click="selectCard(index)"
					>
						<view class="card-bank-icon" :style="{ backgroundColor: getBankColor(card.bankCode) }">
							<text class="card-bank-text">{{ card.bankName.charAt(0) }}</text>
						</view>
						<view class="card-info">
							<text class="card-name">{{ card.bankName }}</text>
							<text class="card-last4">•••• {{ card.last4 }}</text>
						</view>
						<view class="card-default-tag" v-if="card.isDefault">默认</view>
						<view class="card-selected-icon" v-if="currentBank.id === card.id">✓</view>
					</view>
				</view>

				<view class="account-detail" v-if="selectedPayment === 'bank'">
					<view class="account-row">
						<text class="account-label">钱包余额</text>
						<text class="account-value highlight">¥{{ currentBalance }}</text>
					</view>
					<view class="account-row">
						<text class="account-label">开户银行</text>
						<text class="account-value">{{ currentBank.bankName }}</text>
					</view>
					<view class="account-row">
						<text class="account-label">银行卡号</text>
						<text class="account-value">{{ currentBank.cardNumber }}</text>
					</view>
					<view class="account-row">
						<text class="account-label">持卡人</text>
						<text class="account-value">{{ currentBank.cardHolder }}</text>
					</view>
					<view class="account-row add-card" @click="goAddBankCard">
						<text class="add-card-text">+ 添加银行卡</text>
					</view>
				</view>

				<view class="payment-item wechat" @click="selectPayment('wechat')">
					<view class="payment-icon-wrap">
						<view class="payment-icon wechat-icon">
							<view class="icon-wechat"></view>
						</view>
					</view>
					<view class="payment-info">
						<text class="payment-title">微信支付</text>
						<text class="payment-desc">使用微信扫码或免密支付</text>
					</view>
					<view class="payment-check" :class="{ checked: selectedPayment === 'wechat' }">
						<view class="check-inner" v-if="selectedPayment === 'wechat'"></view>
					</view>
				</view>

				<view class="qrcode-preview" v-if="selectedPayment === 'wechat'">
					<view class="qrcode-box">
						<view class="qrcode-placeholder">
							<view class="qrcode-grid">
								<view class="qrcode-bottom"></view>
								<view class="qrcode-center-logo"></view>
							</view>
						</view>
						<text class="qrcode-tip">打开微信扫一扫付款</text>
					</view>
				</view>

				<view class="payment-item alipay" @click="selectPayment('alipay')">
					<view class="payment-icon-wrap">
						<view class="payment-icon alipay-icon">
							<view class="icon-alipay"></view>
						</view>
					</view>
					<view class="payment-info">
						<text class="payment-title">支付宝</text>
						<text class="payment-desc">使用支付宝快捷支付</text>
					</view>
					<view class="payment-check" :class="{ checked: selectedPayment === 'alipay' }">
						<view class="check-inner" v-if="selectedPayment === 'alipay'"></view>
					</view>
				</view>

				<view class="qrcode-preview alipay-preview" v-if="selectedPayment === 'alipay'">
					<view class="qrcode-box">
						<view class="qrcode-placeholder">
							<view class="qrcode-grid">
								<view class="qrcode-bottom"></view>
								<view class="qrcode-center-logo"></view>
							</view>
						</view>
						<text class="qrcode-tip">打开支付宝扫一扫付款</text>
					</view>
				</view>
			</view>
		</view>

		<view class="password-section" v-if="showPasswordInput">
			<view class="password-card">
				<view class="password-header">
					<text class="password-title">请输入支付密码</text>
					<view class="password-close" @click="closePassword">
						<view class="icon-close"></view>
					</view>
				</view>
				<view class="password-amount">
					<text class="password-amount-symbol">¥</text>
					<text class="password-amount-value">{{ finalAmount }}</text>
				</view>
				<view class="password-dots">
					<view class="password-dot" v-for="(dot, index) in passwordDots" :key="index" :class="{ filled: index < password.length }">
						<view class="dot-inner" v-if="index < password.length"></view>
					</view>
				</view>
				<view class="password-keyboard">
					<view class="keyboard-row">
						<view class="key-btn" @click="inputPassword('1')"><text class="key-text">1</text></view>
						<view class="key-btn" @click="inputPassword('2')"><text class="key-text">2</text></view>
						<view class="key-btn" @click="inputPassword('3')"><text class="key-text">3</text></view>
					</view>
					<view class="keyboard-row">
						<view class="key-btn" @click="inputPassword('4')"><text class="key-text">4</text></view>
						<view class="key-btn" @click="inputPassword('5')"><text class="key-text">5</text></view>
						<view class="key-btn" @click="inputPassword('6')"><text class="key-text">6</text></view>
					</view>
					<view class="keyboard-row">
						<view class="key-btn" @click="inputPassword('7')"><text class="key-text">7</text></view>
						<view class="key-btn" @click="inputPassword('8')"><text class="key-text">8</text></view>
						<view class="key-btn" @click="inputPassword('9')"><text class="key-text">9</text></view>
					</view>
					<view class="keyboard-row">
						<view class="key-btn empty"></view>
						<view class="key-btn" @click="inputPassword('0')"><text class="key-text">0</text></view>
						<view class="key-btn delete" @click="deletePassword">
							<view class="icon-delete"></view>
						</view>
					</view>
				</view>
				<view class="password-forgot" @click="showToast('忘记密码')">
					<text class="forgot-text">忘记支付密码？</text>
				</view>
			</view>
		</view>

		<view class="bottom-area">
			<view class="agreement-row">
				<view class="checkbox" :class="{ checked: agreementChecked }" @click="toggleAgreement">
					<view class="check-icon" v-if="agreementChecked"></view>
				</view>
				<text class="agreement-text">我已阅读并同意</text>
				<text class="agreement-link" @click="showToast('支付协议')">《支付服务协议》</text>
			</view>
			<view class="pay-btn" :class="{ disabled: !canPay || paying, loading: paying }" @click="handlePay">
				<view class="pay-loading-icon" v-if="paying"></view>
				<text class="pay-btn-text">{{ paying ? '支付中...' : '确认支付 ¥' + finalAmount }}</text>
			</view>
			<view class="security-tip">
				<text class="security-icon">🔒</text>
				<text class="security-text">支付安全由邻寝帮保障</text>
			</view>
		</view>

		<view class="success-animation" v-if="showSuccess" @click="handleSuccessClick">
			<view class="success-mask"></view>
			<view class="success-content">
				<view class="success-check-wrap">
					<view class="success-circle"></view>
					<view class="success-check-mark"></view>
					<view class="success-ring ring1"></view>
					<view class="success-ring ring2"></view>
				</view>
				<text class="success-title">支付成功</text>
				<text class="success-amount">¥{{ finalAmount }}</text>
				<text class="success-desc">订单已支付，正在寻找骑手...</text>
				<view class="success-actions">
					<view class="success-btn" @click.stop="goOrderDetail">
						<text class="success-btn-text">查看订单</text>
					</view>
					<view class="success-btn secondary" @click.stop="goHome">
						<text class="success-btn-text secondary-text">返回首页</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { orderService } from '@/services/order.js'
	import { walletService } from '@/services/wallet.js'
	import { bankCardService } from '@/services/bankCard.js'
	import { initService } from '@/services/init.js'

	export default {
		data() {
			const user = initService.getUser()
			const savedAddress = uni.getStorageSync('default_address') || {}
			return {
				userInfo: user,
				addressInfo: {
					name: user.nickname || '邻寝帮用户',
					phone: user.phone || '138****8888',
					detail: savedAddress.detail || user.school + ' ' + (savedAddress.dorm || '宿舍区')
				},
				orderId: '',
				orderInfo: {
					title: '快递代取配送',
					desc: '从东区菜鸟驿站 → 14栋305',
					orderId: 'DB20260725001',
					amount: 5.00,
					discount: 0
				},
				currentBalance: '0.00',
				currentBank: {
					bankName: '招商银行',
					cardNumber: '6225 **** **** 8888',
					cardHolder: user.nickname || '邻寝帮用户',
					last4: '8888'
				},
				bankCards: [],
				selectedCardIndex: 0,
				showCardList: false,
				selectedPayment: 'bank',
				agreementChecked: true,
				showPasswordInput: false,
				password: '',
				showSuccess: false,
				paying: false,
				paymentError: null,
				_paid: false
			}
		},
		computed: {
			finalAmount() {
				return (this.orderInfo.amount - this.orderInfo.discount).toFixed(2)
			},
			canPay() {
				return this.agreementChecked && !this.showPasswordInput
			},
			passwordDots() {
				return [0, 1, 2, 3, 4, 5]
			}
		},
		methods: {
			async loadUserInfo() {
				try {
					const user = initService.getUser()
					this.userInfo = user
					this.currentBank.cardHolder = user.nickname || '邻寝帮用户'
					
					const savedAddress = uni.getStorageSync('default_address') || {}
					this.addressInfo = {
						name: user.nickname || '邻寝帮用户',
						phone: user.phone || '138****8888',
						detail: savedAddress.detail || user.school + ' ' + (savedAddress.dorm || '宿舍区')
					}
				} catch (e) {
					console.warn('[支付] 加载用户信息失败:', e.message)
				}
			},
			goAddress() {
				uni.navigateTo({
					url: '/pages/address/index',
					success: () => {
						console.log('[支付] 跳转到地址管理页面')
					}
				})
			},
			goProfile() {
				uni.navigateTo({
					url: '/pages/profile/index',
					success: () => {
						console.log('[支付] 跳转到个人中心')
					}
				})
			},
			async loadBalance() {
				await this.loadUserInfo()
				try {
					const result = await walletService.getBalance()
					if (result.errCode === 0) {
						this.currentBalance = result.data.balance
					}
				} catch (e) {
					console.warn('[支付] 加载余额失败:', e.message)
				}
				try {
					const cards = await bankCardService.getCards()
					this.bankCards = cards
					if (cards.length > 0) {
						const def = cards.find(c => c.isDefault) || cards[0]
						this.currentBank = def
					}
				} catch (e) {
					console.warn('[支付] 加载银行卡失败:', e.message)
				}
			},
			goAddBankCard() {
				uni.navigateTo({
					url: '/pages/add-bank-card/index'
				})
			},
			selectCard(index) {
				this.currentBank = this.bankCards[index]
				this.selectedCardIndex = index
				this.showCardList = false
			},
			getBankColor(code) {
				const colors = {
					'CMB': '#CC1931',
					'CCB': '#004B8D',
					'BOC': '#C8102E'
				}
				return colors[code] || '#4A90D9'
			},
			async loadOrderInfo() {
				try {
					const result = await orderService.detail(this.orderId)
					if (result.errCode === 0 && result.data) {
						const order = result.data
						this.orderInfo = {
							title: order.title || `${order.pickupAddress || '取货点'} → ${order.deliveryAddress || '送货点'}`,
							desc: order.description || '',
							orderId: order.orderNo || order._id,
							amount: order.price || order.serviceFee || 5.00,
							discount: 0
						}
					}
				} catch (e) {
					console.warn('[支付] 加载订单信息失败:', e.message)
				}
			},
			goBack() {
				if (this.showPasswordInput) {
					this.closePassword()
					return
				}
				if (this._paid) {
					this.goOrderDetail()
					return
				}
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}
				})
			},
			selectPayment(type) {
				this.selectedPayment = type
			},
			toggleAgreement() {
				this.agreementChecked = !this.agreementChecked
			},
			handlePay() {
				if (!this.canPay || this.paying) return

				if (this.selectedPayment === 'bank') {
					this.showPasswordInput = true
					this.password = ''
				} else {
					const payName = this.selectedPayment === 'wechat' ? '微信' : '支付宝'
					uni.showModal({
						title: '支付确认',
						content: `确定使用${payName}支付 ¥${this.finalAmount} 吗？\n将调起${payName}支付完成付款`,
						confirmText: '立即支付',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								this.processPayment()
							}
						}
					})
				}
			},
			inputPassword(key) {
				if (this.password.length < 6) {
					this.password += key
					if (this.password.length === 6) {
						setTimeout(() => {
							this.processPayment()
						}, 300)
					}
				}
			},
			deletePassword() {
				if (this.password.length > 0) {
					this.password = this.password.slice(0, -1)
				}
			},
			closePassword() {
				this.showPasswordInput = false
				this.password = ''
			},
			async processPayment() {
				if (this.paying) return
				
				this.showPasswordInput = false
				this.password = ''
				this.paying = true
				this.paymentError = null
				
				try {
					uni.showLoading({ title: '支付处理中...' })
					
					const payTypeMap = {
						'wechat': 'wechat',
						'alipay': 'alipay',
						'bank': 'bank'
					}
					
					const result = await paymentService.processPayment({
						orderId: this.orderId,
						orderNo: this.orderInfo.orderId,
						amount: this.finalAmount,
						payType: payTypeMap[this.selectedPayment] || 'bank',
						description: this.orderInfo.title
					})
					
					uni.hideLoading()
					
					if (result.errCode === 0) {
						await this.handlePaymentSuccess()
					} else if (result.errCode === 'USER_CANCEL') {
						uni.showToast({ title: '已取消支付', icon: 'none' })
						this.paying = false
					} else {
						this.paymentError = result.errMsg || '支付失败'
						uni.showModal({
							title: '支付失败',
							content: result.errMsg || '支付过程中出现错误，是否重试？',
							confirmText: '重试',
							cancelText: '返回',
							success: (res) => {
								if (res.confirm) {
									this.paying = false
									this.processPayment()
								} else {
									this.paying = false
									uni.navigateBack()
								}
							}
						})
					}
				} catch (error) {
					uni.hideLoading()
					console.error('[支付] 支付处理失败:', error)
					this.paymentError = error.errMsg || '支付异常'
					this.paying = false
					
					uni.showModal({
						title: '支付异常',
						content: '支付过程中出现异常，是否使用模拟支付继续？',
						confirmText: '模拟支付',
						cancelText: '返回',
						success: async (res) => {
							if (res.confirm) {
								await this.handlePaymentSuccess()
							} else {
								uni.navigateBack()
							}
						}
					})
				}
			},
			async handlePaymentSuccess() {
				try {
					if (this.orderId) {
						try {
							await orderService.updateStatus(this.orderId, 'pending')
							console.log('[支付] 订单状态已更新为 pending')
						} catch (err) {
							console.warn('[支付] 云端状态更新失败:', err.message)
						}
						
						try {
							const ordersData = uni.getStorageSync('orders_data') || []
							const dataIndex = ordersData.findIndex(o => String(o._id) === String(this.orderId))
							if (dataIndex !== -1) {
								ordersData[dataIndex].status = 'pending'
								ordersData[dataIndex].paid_at = Date.now()
								uni.setStorageSync('orders_data', ordersData)
							}
						} catch (e) {
							console.warn('[支付] 更新订单数据失败:', e.message)
						}
						
						try {
							const statusRecords = uni.getStorageSync('order_status') || {}
							statusRecords[this.orderId] = {
								status: 'pending',
								paidAt: Date.now(),
								updatedAt: Date.now()
							}
							uni.setStorageSync('order_status', statusRecords)
						} catch (e) {}
						
						try {
							uni.setStorageSync('order_events', Date.now())
						} catch (e) {}
						
						try {
							const walletResult = await walletService.addExpense(
								`跑腿费支出 - ${this.orderInfo.title}`,
								this.finalAmount,
								this.orderId
							)
							console.log('[支付] 钱包支出记录已添加:', walletResult)
						} catch (walletErr) {
							console.warn('[支付] 钱包记录失败:', walletErr.message)
						}
					}
					
					await this.loadBalance()
					
					this._paid = true
					this.showSuccess = true
					this.paying = false
					uni.vibrateShort({ type: 'light' })
				} catch (error) {
					console.error('[支付] 处理支付结果失败:', error)
					this.paying = false
				}
			},
			handleSuccessClick() {
				this.showSuccess = false
			},
			goOrderDetail() {
				this.showSuccess = false
				uni.switchTab({
					url: '/pages/orders/index',
					success: () => {
						console.log('[支付] 跳转到订单页面成功')
					},
					fail: (err) => {
						console.error('[支付] 跳转失败:', err)
						uni.redirectTo({
							url: '/pages/orders/index'
						})
					}
				})
			},
			goHome() {
				this.showSuccess = false
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			showToast(msg) {
				uni.showToast({
					title: msg,
					icon: 'none'
				})
			}
		},
		onLoad(options) {
			if (options && options.orderId) {
				this.orderId = options.orderId
				this.loadOrderInfo()
			}
		},
		onShow() {
			this.loadBalance()
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		min-height: 100vh;
		background-color: #F5F8FA;
		display: flex;
		flex-direction: column;
		padding-bottom: 48rpx;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 88rpx 28rpx 24rpx;
		background: #fff;
		border-bottom: 2rpx solid #F3F4F6;
	}

	.nav-back {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-back {
		width: 24rpx;
		height: 24rpx;
		border-left: 4rpx solid #1F2937;
		border-bottom: 4rpx solid #1F2937;
		transform: rotate(45deg);
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.nav-placeholder {
		width: 64rpx;
	}

	.user-info-card {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		margin: 20rpx 28rpx 0;
		border-radius: 20rpx;
		padding: 28rpx;
	}

	.user-info-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.user-info-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-avatar-inner {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #fff;
		opacity: 0.9;
	}

	.user-info-detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.user-info-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
	}

	.user-info-meta {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.user-info-badge {
		background: rgba(255, 255, 255, 0.25);
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}

	.badge-text {
		font-size: 22rpx;
		color: #fff;
	}

	.user-info-edit-icon {
		width: 16rpx;
		height: 16rpx;
		border-right: 3rpx solid rgba(255, 255, 255, 0.7);
		border-top: 3rpx solid rgba(255, 255, 255, 0.7);
		transform: rotate(45deg);
		flex-shrink: 0;
	}

	.address-card {
		background: #fff;
		margin: 20rpx 28rpx 0;
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.address-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.address-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.address-edit {
		padding: 8rpx 16rpx;
		background: #EFF6FF;
		border-radius: 16rpx;
	}

	.address-edit-text {
		font-size: 24rpx;
		color: #4A90D9;
	}

	.address-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}

	.address-icon-wrap {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.address-detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.address-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.address-text {
		font-size: 26rpx;
		color: #6B7280;
		line-height: 1.5;
	}

	.order-summary {
		background: #fff;
		padding: 28rpx;
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.order-icon-wrap {
		width: 88rpx;
		height: 88rpx;
		background: #EFF6FF;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.order-icon.package {
		width: 40rpx;
		height: 36rpx;
		border: 4rpx solid #4A90D9;
		border-radius: 6rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 4rpx;
			background: #4A90D9;
		}

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 4rpx;
			height: 100%;
			background: #4A90D9;
		}
	}

	.order-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.order-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.order-desc {
		font-size: 24rpx;
		color: #6B7280;
	}

	.order-id-tag {
		display: inline-flex;
		background: #F9FAFB;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
		width: fit-content;
	}

	.order-id-text {
		font-size: 20rpx;
		color: #9CA3AF;
	}

	.amount-card {
		background: #fff;
		margin: 24rpx 28rpx;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.amount-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12rpx 0;

		&.discount {
			.discount-label { color: #6B7280; }
			.discount-value { color: #22C55E; }
		}

		&.total {
			padding-top: 20rpx;
		}
	}

	.amount-label {
		font-size: 28rpx;
		color: #6B7280;
	}

	.amount-value {
		font-size: 28rpx;
		color: #1F2937;
	}

	.amount-divider {
		height: 2rpx;
		background: #F3F4F6;
		margin: 12rpx 0;
	}

	.total-label {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.total-value-wrap {
		display: flex;
		align-items: baseline;
	}

	.total-symbol {
		font-size: 28rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.total-amount {
		font-size: 44rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.payment-section {
		flex: 1;
		padding: 0 28rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 20rpx;
	}

	.payment-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.payment-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;

		&.active {
			border: 4rpx solid #4A90D9;
		}
	}

	.payment-icon-wrap {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		.bank & { background: #EFF6FF; }
		.wechat & { background: #F0FDF4; }
		.alipay & { background: #FFF7ED; }
	}

	.payment-icon {
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-bank-card {
		width: 40rpx;
		height: 28rpx;
		border: 3rpx solid #4A90D9;
		border-radius: 4rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 14rpx;
			left: 4rpx;
			right: 4rpx;
			height: 3rpx;
			background: #4A90D9;
		}
	}

	.icon-wechat {
		width: 36rpx;
		height: 36rpx;
		background: #22C55E;
		border-radius: 50%;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			width: 8rpx;
			height: 8rpx;
			background: #fff;
			border-radius: 50%;
		}
		&::before { top: 8rpx; left: 8rpx; }
		&::after { top: 8rpx; right: 8rpx; }
	}

	.icon-alipay {
		width: 36rpx;
		height: 36rpx;
		background: #F97316;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 20rpx;
			height: 4rpx;
			background: #fff;
			border-radius: 2rpx;
		}
	}

	.payment-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.payment-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.payment-desc {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.payment-check {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #E5E7EB;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s;

		&.checked {
			border-color: #4A90D9;
			background: #4A90D9;
		}
	}

	.check-inner {
		width: 16rpx;
		height: 8rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.payment-arrow {
		width: 24rpx;
		height: 24rpx;
		border-right: 3rpx solid #9CA3AF;
		border-bottom: 3rpx solid #9CA3AF;
		transform: rotate(-45deg);
		margin-right: 12rpx;
	}

	.card-list {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 16rpx;
		margin-bottom: 16rpx;
	}

	.card-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx;
		background: #fff;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
		border: 2rpx solid transparent;

		&:last-child {
			margin-bottom: 0;
		}

		&.active {
			border-color: #4A90D9;
			background: #EFF6FF;
		}
	}

	.card-bank-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-bank-text {
		font-size: 24rpx;
		font-weight: 700;
		color: #fff;
	}

	.card-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.card-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.card-last4 {
		font-size: 24rpx;
		color: #6B7280;
		font-family: monospace;
	}

	.card-default-tag {
		font-size: 20rpx;
		color: #4A90D9;
		background: #EFF6FF;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.card-selected-icon {
		width: 36rpx;
		height: 36rpx;
		background: #4A90D9;
		border-radius: 50%;
		color: #fff;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.account-detail {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-top: -10rpx;
		margin-bottom: 10rpx;
	}

	.account-row {
		display: flex;
		justify-content: space-between;
		padding: 8rpx 0;
	}

	.account-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.account-value {
		font-size: 24rpx;
		color: #374151;
		font-family: monospace;

		&.highlight {
			color: #4A90D9;
			font-weight: 600;
		}
	}

	.add-card {
		border-top: 1rpx dashed #E5E7EB;
		padding-top: 16rpx;
		margin-top: 16rpx;
		justify-content: center;
	}

	.add-card-text {
		font-size: 26rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.qrcode-preview {
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		margin-top: -10rpx;
		margin-bottom: 10rpx;
		border: 2rpx dashed #E5E7EB;

		&.alipay-preview {
			border-color: #F97316;
		}
	}

	.qrcode-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		margin-top: 24rpx;
	}

	.qrcode-placeholder {
		width: 280rpx;
		height: 280rpx;
		background: #fff;
		border: 4rpx solid #E5E7EB;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.qrcode-grid {
		width: 100%;
		height: 100%;
		background: #fff;
		position: relative;
		background-image: 
			radial-gradient(circle, #1F2937 2rpx, transparent 3rpx),
			radial-gradient(circle, #1F2937 2rpx, transparent 3rpx);
		background-size: 10rpx 10rpx, 14rpx 14rpx;
		background-position: 0 0, 5rpx 5rpx;
	}

	.qrcode-grid::before,
	.qrcode-grid::after {
		content: '';
		position: absolute;
		width: 64rpx;
		height: 64rpx;
		border: 8rpx solid #1F2937;
		background: #fff;
		z-index: 2;
	}

	.qrcode-grid::before {
		top: 0;
		left: 0;
		border-right: none;
		border-bottom: none;
	}

	.qrcode-grid::after {
		top: 0;
		right: 0;
		border-left: none;
		border-bottom: none;
	}

	.qrcode-bottom {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 64rpx;
		height: 64rpx;
		border: 8rpx solid #1F2937;
		border-top: none;
		border-right: none;
		background: #fff;
		z-index: 2;
	}

	.qrcode-center-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 56rpx;
		height: 56rpx;
		background: #fff;
		border: 4rpx solid #E5E7EB;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}

	.qrcode-center-logo::before {
		content: '';
		width: 32rpx;
		height: 32rpx;
		background: #1F2937;
		border-radius: 4rpx;
	}

	.qrcode-center-logo::after {
		content: '';
		position: absolute;
		bottom: 0;
		right: 0;
		width: 60rpx;
		height: 60rpx;
		background: 
			linear-gradient(90deg, #1F2937 50%, transparent 50%) 0 0 / 12rpx 12rpx,
			linear-gradient(0deg, #1F2937 50%, transparent 50%) 0 0 / 12rpx 12rpx;
	}

	.qrcode-tip {
		font-size: 24rpx;
		color: #6B7280;
	}

	.password-section {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 100;
	}

	.password-card {
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding: 32rpx 28rpx;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.password-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32rpx;
	}

	.password-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.password-close {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-close {
		width: 28rpx;
		height: 28rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
		}
		&::before { transform: rotate(45deg); }
		&::after { transform: rotate(-45deg); }
	}

	.password-amount {
		text-align: center;
		margin-bottom: 32rpx;
	}

	.password-amount-symbol {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.password-amount-value {
		font-size: 56rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.password-dots {
		display: flex;
		justify-content: center;
		gap: 16rpx;
		margin-bottom: 32rpx;
	}

	.password-dot {
		width: 60rpx;
		height: 80rpx;
		border: 3rpx solid #E5E7EB;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;

		&.filled {
			border-color: #4A90D9;
			background: #EFF6FF;
		}
	}

	.dot-inner {
		width: 24rpx;
		height: 24rpx;
		background: #4A90D9;
		border-radius: 50%;
		animation: dotPop 0.2s ease;
	}

	@keyframes dotPop {
		0% { transform: scale(0); }
		50% { transform: scale(1.2); }
		100% { transform: scale(1); }
	}

	.password-keyboard {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		margin-bottom: 24rpx;
	}

	.keyboard-row {
		display: flex;
		gap: 8rpx;
	}

	.key-btn {
		flex: 1;
		height: 88rpx;
		background: #F3F4F6;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.1s;

		&:active {
			background: #E5E7EB;
			transform: scale(0.95);
		}

		&.empty {
			background: transparent;
		}

		&.delete {
			background: #F3F4F6;
		}
	}

	.key-text {
		font-size: 40rpx;
		font-weight: 500;
		color: #1F2937;
	}

	.icon-delete {
		width: 36rpx;
		height: 24rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			width: 28rpx;
			height: 16rpx;
			border: 3rpx solid #6B7280;
			border-left: none;
			border-radius: 0 8rpx 8rpx 0;
		}
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			right: 4rpx;
			transform: translateY(-50%);
			width: 20rpx;
			height: 3rpx;
			background: #6B7280;
		}
	}

	.password-forgot {
		text-align: center;
	}

	.forgot-text {
		font-size: 26rpx;
		color: #4A90D9;
	}

	.bottom-area {
		padding: 24rpx 28rpx;
		background: #fff;
		border-top: 2rpx solid #F3F4F6;
	}

	.agreement-row {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 3rpx solid #E5E7EB;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12rpx;
		transition: all 0.2s;

		&.checked {
			background: #4A90D9;
			border-color: #4A90D9;
		}
	}

	.check-icon {
		width: 16rpx;
		height: 8rpx;
		border-left: 3rpx solid #fff;
		border-bottom: 3rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.agreement-text {
		font-size: 24rpx;
		color: #6B7280;
	}

	.agreement-link {
		font-size: 24rpx;
		color: #4A90D9;
	}

	.pay-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 32rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&.disabled {
			opacity: 0.6;
		}
		
		&.loading {
			pointer-events: none;
		}
	}

	.pay-loading-icon {
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

	.pay-btn-text {
		font-size: 34rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 2rpx;
	}
	
	.security-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		margin-top: 24rpx;
	}
	
	.security-icon {
		font-size: 24rpx;
	}
	
	.security-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.success-animation {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.success-content {
		background: #fff;
		border-radius: 32rpx;
		padding: 64rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
		animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		min-width: 560rpx;
	}

	@keyframes successPop {
		0% { transform: scale(0.5); opacity: 0; }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); opacity: 1; }
	}

	.success-check-wrap {
		width: 120rpx;
		height: 120rpx;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	.success-circle {
		position: absolute;
		width: 100%;
		height: 100%;
		background: #22C55E;
		border-radius: 50%;
		animation: circleDraw 0.4s ease;
	}

	@keyframes circleDraw {
		0% { transform: scale(0); }
		100% { transform: scale(1); }
	}

	.success-check-mark {
		width: 48rpx;
		height: 24rpx;
		border-left: 6rpx solid #fff;
		border-bottom: 6rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -12rpx;
		animation: checkDraw 0.4s ease 0.2s both;
		position: relative;
		z-index: 1;
	}

	@keyframes checkDraw {
		0% { opacity: 0; transform: rotate(-45deg) scale(0); }
		100% { opacity: 1; transform: rotate(-45deg) scale(1); }
	}

	.success-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 4rpx solid #22C55E;
		border-radius: 50%;
		opacity: 0;

		&.ring1 { animation: ringExpand 1.5s ease-out infinite; }
		&.ring2 { animation: ringExpand 1.5s ease-out infinite 0.5s; }
	}

	@keyframes ringExpand {
		0% {
			transform: scale(1);
			opacity: 0.6;
		}
		100% {
			transform: scale(1.8);
			opacity: 0;
		}
	}

	.success-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.success-amount {
		font-size: 48rpx;
		font-weight: 700;
		color: #EF4444;
	}

	.success-desc {
		font-size: 26rpx;
		color: #6B7280;
		text-align: center;
	}

	.success-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 16rpx;
	}

	.success-btn {
		background: #4A90D9;
		padding: 20rpx 40rpx;
		border-radius: 20rpx;

		&:active {
			opacity: 0.9;
		}

		&.secondary {
			background: #F3F4F6;
		}
	}

	.success-btn-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #fff;

		&.secondary-text {
			color: #6B7280;
		}
	}
</style>
