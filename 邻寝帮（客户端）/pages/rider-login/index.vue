<template>
	<view class="page-container">
		<view class="brand-area">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>

			<view class="role-switch">
				<view class="role-tab" :class="{ active: currentRole === 'user' }" @click="switchRole('user')">
					<text class="role-tab-text">用户端</text>
				</view>
				<view class="role-tab" :class="{ active: currentRole === 'rider' }" @click="switchRole('rider')">
					<text class="role-tab-text">骑手端</text>
				</view>
				<view class="role-indicator" :style="{ left: currentRole === 'user' ? '0' : '50%' }"></view>
			</view>

			<view class="logo-wrap">
				<view class="logo-icon">
					<view class="icon-bike-svg"></view>
				</view>
			</view>
			<text class="brand-name">骑手工作台</text>
			<text class="brand-slogan">接单配送，自由赚钱，随叫随到</text>
		</view>

		<view class="login-area">
			<view class="login-card">
				<view class="tab-row">
					<view
						class="tab-item"
						:class="{ active: currentTab === 'code' }"
						@click="switchTab('code')"
					>
						<text class="tab-text">验证码登录</text>
					</view>
					<view
						class="tab-item"
						:class="{ active: currentTab === 'pwd' }"
						@click="switchTab('pwd')"
					>
						<text class="tab-text">账号登录</text>
					</view>
				</view>

				<view class="demo-btn" @click="demoLogin">
					<view class="icon-bolt"></view>
					<text class="demo-btn-text">体验模式 - 快速接单</text>
				</view>

				<view class="form-content" v-if="currentTab === 'code'">
					<view class="form-item">
						<text class="prefix">+86</text>
						<input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
					</view>
					<view class="form-item-row">
						<view class="form-item flex">
							<input class="form-input" v-model="form.code" placeholder="验证码" type="number" />
						</view>
						<view class="code-btn" :class="{ disabled: codeCountdown > 0 }" @click="getCode">
							<text class="code-btn-text">{{ codeBtnText }}</text>
						</view>
					</view>
					<view class="primary-btn" @click="handleLogin('code')">
						<text class="primary-btn-text">登录骑手端</text>
					</view>
				</view>

				<view class="form-content" v-else>
					<view class="form-item">
						<view class="icon-user"></view>
						<input class="form-input" v-model="form.account" placeholder="手机号/工号" />
					</view>
					<view class="form-item">
						<view class="icon-lock"></view>
						<input class="form-input" v-model="form.password" placeholder="请输入密码" type="password" />
					</view>
					<view class="primary-btn" @click="handleLogin('pwd')">
						<text class="primary-btn-text">登录骑手端</text>
					</view>
				</view>

				<view class="agreement">
					<text class="agreement-text">登录即同意 </text>
					<text class="agreement-link" @click="showToast('服务协议')">《骑手服务协议》</text>
					<text class="agreement-text"> 和 </text>
					<text class="agreement-link" @click="showToast('隐私政策')">《隐私政策》</text>
				</view>
			</view>

			<view class="entry-row">
				<view class="entry-item" @click="goRiderRegister">
					<text class="entry-text">成为骑手？</text>
					<text class="entry-link">立即注册</text>
				</view>
				<view class="entry-divider"></view>
				<view class="entry-item" @click="goUserLogin">
					<view class="icon-user-switch"></view>
					<text class="entry-text">切换到用户端</text>
				</view>
			</view>

			<view class="support-area">
				<view class="support-item" @click="contactService">
					<view class="icon-headset"></view>
					<text class="support-text">联系客服</text>
				</view>
				<view class="support-item" @click="showToast('帮助中心')">
					<view class="icon-help"></view>
					<text class="support-text">帮助中心</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentRole: 'rider',
				currentTab: 'code',
				form: {
					phone: '',
					code: '',
					account: '',
					password: ''
				},
				codeCountdown: 0
			}
		},
		computed: {
			codeBtnText() {
				if (this.codeCountdown > 0) {
					return `${this.codeCountdown}s`
				}
				return '获取验证码'
			}
		},
		methods: {
			switchRole(role) {
				if (role === 'user') {
					uni.redirectTo({
						url: '/pages/login/index'
					})
				}
			},
			switchTab(tab) {
				this.currentTab = tab
			},
			getCode() {
				if (!this.form.phone || !/^1[3-9]\d{9}$/.test(this.form.phone)) {
					uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
					return
				}
				if (this.codeCountdown > 0) return

				uni.showToast({ title: '验证码已发送', icon: 'success' })
				this.codeCountdown = 60
				const timer = setInterval(() => {
					this.codeCountdown--
					if (this.codeCountdown <= 0) {
						clearInterval(timer)
					}
				}, 1000)
			},
			demoLogin() {
				uni.setStorageSync('rider_logged_in', 'true')
				uni.setStorageSync('rider_name', '骑手小李')
				uni.setStorageSync('rider_id', 'R001')
				uni.showToast({ title: '欢迎回来！', icon: 'success' })
				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/rider-home/index'
					})
				}, 1200)
			},
			handleLogin(type) {
				if (type === 'code') {
					if (!this.form.phone) {
						uni.showToast({ title: '请输入手机号', icon: 'none' })
						return
					}
					if (!this.form.code) {
						uni.showToast({ title: '请输入验证码', icon: 'none' })
						return
					}
				} else {
					if (!this.form.account || !this.form.password) {
						uni.showToast({ title: '请填写账号信息', icon: 'none' })
						return
					}
				}
				this.demoLogin()
			},
			goRiderRegister() {
				uni.showToast({ title: '骑手注册功能开发中', icon: 'none' })
			},
			goUserLogin() {
				uni.redirectTo({
					url: '/pages/login/index'
				})
			},
			contactService() {
				uni.navigateTo({
					url: '/pages/customer-service/index'
				})
			},
			showToast(msg) {
				uni.showToast({
					title: msg,
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

	.brand-area {
		height: 480rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #2C5282 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: -100rpx;
		left: -80rpx;
		width: 360rpx;
		height: 360rpx;
		background: rgba(255, 255, 255, 0.1);
	}

	.deco-circle-2 {
		bottom: -60rpx;
		right: -40rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.08);
	}

	.role-switch {
		position: absolute;
		top: 80rpx;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 40rpx;
		padding: 6rpx;
		width: 360rpx;
		backdrop-filter: blur(10px);
		z-index: 2;
	}

	.role-tab {
		flex: 1;
		padding: 16rpx 0;
		text-align: center;
		border-radius: 36rpx;
		position: relative;
		z-index: 1;
		transition: all 0.3s;

		&.active {
			.role-tab-text {
				color: #4A90D9;
				font-weight: 700;
			}
		}
	}

	.role-tab-text {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.3s;
	}

	.role-indicator {
		position: absolute;
		top: 6rpx;
		bottom: 6rpx;
		left: 6rpx;
		width: calc(50% - 6rpx);
		background: #fff;
		border-radius: 36rpx;
		transition: left 0.3s ease;
		z-index: 0;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.logo-wrap {
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		padding: 28rpx;
		border-radius: 50%;
		margin-bottom: 28rpx;
		backdrop-filter: blur(10px);
		position: relative;
		z-index: 1;
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8rpx); }
	}

	.logo-icon {
		width: 96rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-bike-svg {
		width: 72rpx;
		height: 48rpx;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			bottom: 0;
			width: 32rpx;
			height: 32rpx;
			border: 5rpx solid #fff;
			border-radius: 50%;
		}

		&::after {
			content: '';
			position: absolute;
			right: 0;
			bottom: 0;
			width: 32rpx;
			height: 32rpx;
			border: 5rpx solid #fff;
			border-radius: 50%;
		}
	}

	.brand-name {
		font-size: 44rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 6rpx;
		position: relative;
		z-index: 1;
	}

	.brand-slogan {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 12rpx;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.login-area {
		flex: 1;
		padding: 0 28rpx;
		margin-top: -60rpx;
		position: relative;
		z-index: 2;
	}

	.login-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 40rpx 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		border: 2rpx solid #fff;
		overflow: hidden;
	}

	.tab-row {
		display: flex;
		border-bottom: 2rpx solid #F3F4F6;
		margin-bottom: 32rpx;
	}

	.tab-item {
		flex: 1;
		padding: 24rpx 0;
		text-align: center;
		position: relative;
		transition: all 0.2s;

		&.active {
			.tab-text {
				color: #4A90D9;
				font-weight: 700;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: -2rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 80rpx;
				height: 4rpx;
				background: #4A90D9;
				border-radius: 2rpx;
			}
		}
	}

	.tab-text {
		font-size: 28rpx;
		color: #9CA3AF;
		font-weight: 500;
	}

	.demo-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		margin-bottom: 32rpx;
		transition: all 0.2s;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.25);

		&:active {
			transform: scale(0.98);
		}
	}

	.icon-bolt {
		width: 20rpx;
		height: 32rpx;
		background: #fff;
		clip-path: polygon(50% 0%, 80% 45%, 55% 55%, 70% 100%, 20% 60%, 45% 50%, 30% 0%);
	}

	.demo-btn-text {
		font-size: 28rpx;
		font-weight: 700;
		color: #fff;
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.form-item {
		background: #F9FAFB;
		border-radius: 24rpx;
		padding: 28rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.flex {
			flex: 1;
		}
	}

	.form-item-row {
		display: flex;
		gap: 16rpx;
		align-items: center;
	}

	.prefix {
		font-size: 28rpx;
		color: #9CA3AF;
		padding-right: 20rpx;
		border-right: 2rpx solid #E5E7EB;
	}

	.form-input {
		flex: 1;
		font-size: 28rpx;
		color: #1F2937;
	}

	.code-btn {
		padding: 24rpx 28rpx;
		background: transparent;
		border-radius: 24rpx;
		transition: all 0.2s;

		&.disabled {
			opacity: 0.6;
		}
	}

	.code-btn-text {
		font-size: 26rpx;
		font-weight: 700;
		color: #4A90D9;
		white-space: nowrap;
	}

	.primary-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		padding: 28rpx;
		text-align: center;
		margin-top: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.25);
		transition: opacity 0.2s;

		&:active {
			opacity: 0.9;
		}
	}

	.primary-btn-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 4rpx;
	}

	.icon-user {
		width: 32rpx;
		height: 32rpx;
		background: #9CA3AF;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
		flex-shrink: 0;
	}

	.icon-lock {
		width: 28rpx;
		height: 32rpx;
		background: #9CA3AF;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
		flex-shrink: 0;
	}

	.agreement {
		display: flex;
		justify-content: center;
		margin-top: 32rpx;
		flex-wrap: wrap;
	}

	.agreement-text {
		font-size: 22rpx;
		color: #9CA3AF;
		line-height: 1.6;
	}

	.agreement-link {
		font-size: 22rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.entry-row {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40rpx;
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.entry-item {
		display: flex;
		align-items: center;
		gap: 8rpx;

		&:active {
			opacity: 0.7;
		}
	}

	.entry-text {
		font-size: 26rpx;
		color: #6B7280;
	}

	.entry-link {
		font-size: 26rpx;
		font-weight: 700;
		color: #4A90D9;
		margin-left: 8rpx;
	}

	.entry-divider {
		width: 2rpx;
		height: 32rpx;
		background: #E5E7EB;
		margin: 0 32rpx;
	}

	.icon-user-switch {
		width: 28rpx;
		height: 28rpx;
		background: #4A90D9;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.support-area {
		display: flex;
		justify-content: center;
		gap: 64rpx;
		margin-top: 40rpx;
		padding-bottom: 48rpx;
	}

	.support-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;

		&:active {
			opacity: 0.7;
		}
	}

	.icon-headset {
		width: 48rpx;
		height: 48rpx;
		border: 4rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 16rpx;
			height: 8rpx;
			background: #9CA3AF;
			border-radius: 0 0 8rpx 8rpx;
		}
	}

	.icon-help {
		width: 36rpx;
		height: 36rpx;
		border: 4rpx solid #9CA3AF;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 4rpx;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 50%;
			box-shadow: 0 -10rpx 0 #9CA3AF, 0 10rpx 0 #9CA3AF;
		}
	}

	.support-text {
		font-size: 24rpx;
		color: #9CA3AF;
	}
</style>
