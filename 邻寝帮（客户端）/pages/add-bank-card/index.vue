<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">添加银行卡</text>
			<view class="header-placeholder"></view>
		</view>

		<scroll-view scroll-y class="content">
			<view class="bank-section">
				<text class="section-title">选择银行</text>
				<view class="bank-list">
					<view 
						class="bank-item" 
						v-for="(bank, index) in allowedBanks" 
						:key="bank.code"
						:class="{ active: selectedBank === bank.code }"
						@click="selectBank(bank.code)"
					>
						<view class="bank-logo" :style="{ backgroundColor: bank.color }">
							<text class="bank-logo-text">{{ bank.name.charAt(0) }}</text>
						</view>
						<view class="bank-info">
							<text class="bank-name">{{ bank.name }}</text>
							<text class="bank-desc">储蓄卡</text>
						</view>
						<view class="bank-check" v-if="selectedBank === bank.code">
							<text class="check-icon">✓</text>
						</view>
					</view>
				</view>
				<view class="bank-notice">
					<text class="notice-icon">ℹ️</text>
					<text class="notice-text">仅支持招商银行、建设银行、中国银行的储蓄卡</text>
				</view>
			</view>

			<view class="form-section">
				<text class="section-title">银行卡信息</text>
				
				<view class="form-item">
					<text class="form-label">持卡人姓名</text>
					<input 
						class="form-input" 
						type="text" 
						v-model="form.cardHolder"
						placeholder="请输入持卡人姓名"
						maxlength="20"
					/>
				</view>

				<view class="form-item">
					<text class="form-label">银行卡号</text>
					<input 
						class="form-input" 
						type="number" 
						v-model="form.cardNumber"
						placeholder="请输入16-19位银行卡号"
						maxlength="19"
						@blur="validateCard"
					/>
					<text class="form-tip" v-if="detectedBank">{{ detectedBank.name }}储蓄卡</text>
					<text class="form-tip error" v-else-if="form.cardNumber && !validCard">卡号格式不正确</text>
				</view>

				<view class="form-item">
					<text class="form-label">确认卡号</text>
					<input 
						class="form-input" 
						type="number" 
						v-model="form.confirmNumber"
						placeholder="请再次输入银行卡号"
						maxlength="19"
					/>
				</view>
			</view>

			<view class="security-section">
				<view class="security-header">
					<text class="security-icon">🔒</text>
					<text class="security-title">安全保障</text>
				</view>
				<text class="security-desc">
					您的银行卡信息经过严格加密处理，仅用于支付扣款，我们不会存储您的CVV码和密码。
				</text>
			</view>

			<view class="agreement-section">
				<view class="checkbox" :class="{ checked: agreed }" @click="toggleAgreement">
					<view class="check-icon" v-if="agreed"></view>
				</view>
				<text class="agreement-text">我已阅读并同意</text>
				<text class="agreement-link" @click="showAgreement">《银行卡支付协议》</text>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<view class="footer">
			<view 
				class="submit-btn" 
				:class="{ disabled: !canSubmit || submitting }"
				@click="handleSubmit"
			>
				<view class="loading-icon" v-if="submitting"></view>
				<text class="btn-text">{{ submitting ? '提交中...' : '确认添加' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { bankCardService } from '@/services/bankCard.js'

	export default {
		data() {
			return {
				allowedBanks: [],
				selectedBank: 'CMB',
				form: {
					cardHolder: '',
					cardNumber: '',
					confirmNumber: ''
				},
				detectedBank: null,
				validCard: false,
				agreed: false,
				submitting: false
			}
		},
		computed: {
			canSubmit() {
				return this.agreed && 
					this.form.cardHolder.length >= 2 && 
					this.form.cardNumber.length >= 16 &&
					this.form.cardNumber === this.form.confirmNumber &&
					this.detectedBank
			}
		},
		onLoad() {
			this.allowedBanks = bankCardService.getAllowedBanks()
		},
		methods: {
			selectBank(code) {
				this.selectedBank = code
			},
			validateCard() {
				if (!this.form.cardNumber || this.form.cardNumber.length < 16) {
					this.validCard = false
					this.detectedBank = null
					return
				}
				const result = bankCardService.validateCardNumber(this.form.cardNumber)
				this.validCard = result.valid
				this.detectedBank = result.bank
				
				if (result.bank && !this.allowedBanks.find(b => b.code === result.bank.code)) {
					this.detectedBank = null
					this.validCard = false
					uni.showToast({
						title: '仅支持招商银行、建设银行、中国银行',
						icon: 'none'
					})
				}
			},
			toggleAgreement() {
				this.agreed = !this.agreed
			},
			showAgreement() {
				uni.showModal({
					title: '银行卡支付协议',
					content: '1. 您确认所绑定的银行卡为您本人合法持有\n2. 您授权本应用从该银行卡扣除相应费用\n3. 您的信息将被严格加密保护\n4. 如需解绑可在支付管理中操作',
					showCancel: false
				})
			},
			goBack() {
				uni.navigateBack()
			},
			async handleSubmit() {
				if (!this.canSubmit || this.submitting) return

				this.submitting = true

				try {
					uni.showLoading({ title: '正在添加...' })

					const result = await bankCardService.addCard({
						bankCode: this.selectedBank,
						cardNumber: this.form.cardNumber,
						cardHolder: this.form.cardHolder
					})

					uni.hideLoading()

					if (result.errCode === 0) {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						uni.showModal({
							title: '添加失败',
							content: result.errMsg || '请检查银行卡信息',
							showCancel: false
						})
					}
				} catch (e) {
					uni.hideLoading()
					uni.showModal({
						title: '系统错误',
						content: '网络异常，请稍后重试',
						showCancel: false
					})
				} finally {
					this.submitting = false
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

	.bank-section, .form-section {
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

	.bank-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.bank-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		background: #F8FAFC;
		border-radius: 16rpx;
		padding: 24rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.active {
			background: #EFF6FF;
			border-color: #4A90D9;
		}
	}

	.bank-logo {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bank-logo-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}

	.bank-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.bank-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.bank-desc {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.bank-check {
		width: 44rpx;
		height: 44rpx;
		background: #4A90D9;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		font-size: 26rpx;
		color: #fff;
		font-weight: 700;
	}

	.bank-notice {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 24rpx;
		padding: 16rpx 20rpx;
		background: #FEF3C7;
		border-radius: 12rpx;
	}

	.notice-icon {
		font-size: 24rpx;
	}

	.notice-text {
		font-size: 24rpx;
		color: #92400E;
	}

	.form-item {
		margin-bottom: 28rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.form-label {
		font-size: 26rpx;
		color: #6B7280;
		display: block;
		margin-bottom: 12rpx;
	}

	.form-input {
		width: 100%;
		height: 88rpx;
		background: #F8FAFC;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 30rpx;
		color: #1F2937;
	}

	.form-tip {
		font-size: 24rpx;
		color: #059669;
		display: block;
		margin-top: 8rpx;

		&.error {
			color: #DC2626;
		}
	}

	.security-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
	}

	.security-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.security-icon {
		font-size: 32rpx;
	}

	.security-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.security-desc {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.agreement-section {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 0 8rpx;
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
	}

	.submit-btn {
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
</style>
