<template>
	<view class="page-container">
		<view class="brand-area">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>
			<view class="deco-circle deco-circle-3"></view>

			<view class="logo-wrap">
				<view class="logo-icon"></view>
			</view>
			<text class="brand-name">邻寝帮</text>
			<text class="brand-slogan">取快递、带三餐，邻寝帮随叫随到</text>
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
					<view class="icon-wand"></view>
					<text class="demo-btn-text">体验模式 - 快速免密进入</text>
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
						<text class="primary-btn-text">登录</text>
					</view>
				</view>

				<view class="form-content" v-else>
					<view class="form-item">
						<view class="icon-user"></view>
						<input class="form-input" v-model="form.account" placeholder="手机号/用户名" />
					</view>
					<view class="form-item">
						<view class="icon-lock"></view>
						<input class="form-input" v-model="form.password" placeholder="请输入密码" type="password" />
					</view>
					<view class="primary-btn" @click="handleLogin('pwd')">
						<text class="primary-btn-text">登录</text>
					</view>
				</view>

				<view class="agreement">
					<text class="agreement-text">登录即同意 </text>
					<text class="agreement-link" @click="showToast('服务协议')">《用户服务协议》</text>
					<text class="agreement-text"> 和 </text>
					<text class="agreement-link" @click="showToast('隐私政策')">《隐私政策》</text>
				</view>
			</view>

			<view class="other-login">
				<view class="divider-row">
					<view class="divider-line"></view>
					<text class="divider-text">其他登录方式</text>
					<view class="divider-line"></view>
				</view>
				<view class="wechat-btn" @click="handleWechatLogin">
					<view class="wechat-icon">
						<view class="wechat-icon-inner">
							<view class="wx-ball wx-ball-left"></view>
							<view class="wx-ball wx-ball-right"></view>
							<view class="wx-eye wx-eye-left"></view>
							<view class="wx-eye wx-eye-right"></view>
							<view class="wx-mouth"></view>
						</view>
					</view>
					<text class="wechat-text">微信登录</text>
				</view>
				<view class="wechat-register-entry" @click="goWechatRegister">
					<text class="wechat-register-text">使用微信注册</text>
				</view>
			</view>

			<view class="register-entry" @click="goRegister">
				<text class="register-text">还没有账号？</text>
				<text class="register-link">立即注册账号</text>
			</view>

			<view class="bottom-entry" @click="goRiderLogin">
				<view class="icon-bike"></view>
				<text class="bottom-text">切换到骑手端</text>
				<view class="icon-arrow-right"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 'code',
				form: {
					phone: '',
					code: '',
					account: '',
					password: ''
				},
				codeCountdown: 0,
				wechatLoading: false
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
				uni.setStorageSync('campus_user_logged_in', 'true')
				uni.setStorageSync('campus_user_name', '体验用户')
				uni.showToast({ title: '欢迎回来！体验模式已开启', icon: 'success' })
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
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
			handleWechatLogin() {
				if (this.wechatLoading) return
				this.wechatLoading = true
				uni.showLoading({ title: '正在唤起微信...' })
				setTimeout(() => {
					uni.hideLoading()
					this.wechatLoading = false
					uni.showModal({
						title: '微信授权',
						content: '是否允许邻寝帮获取您的微信公开信息？',
						confirmText: '同意',
						cancelText: '拒绝',
						success: (res) => {
							if (res.confirm) {
								uni.showLoading({ title: '授权中...' })
								setTimeout(() => {
									uni.hideLoading()
									uni.showToast({ title: '微信登录成功', icon: 'success' })
									uni.setStorageSync('campus_user_logged_in', 'true')
									uni.setStorageSync('campus_user_name', '微信用户')
									setTimeout(() => {
										uni.switchTab({
											url: '/pages/index/index'
										})
									}, 1200)
								}, 1000)
							}
						}
					})
				}, 800)
			},
			goWechatRegister() {
				uni.navigateTo({
					url: '/pages/register/index?type=wechat'
				})
			},
			goRegister() {
				uni.navigateTo({
					url: '/pages/register/index'
				})
			},
			goRiderLogin() {
				uni.showToast({ title: '切换到骑手端', icon: 'none' })
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
		height: 440rpx;
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
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
		top: -80rpx;
		left: -80rpx;
		width: 320rpx;
		height: 320rpx;
		background: rgba(255, 255, 255, 0.1);
	}

	.deco-circle-2 {
		top: 160rpx;
		right: -40rpx;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.06);
	}

	.deco-circle-3 {
		bottom: -60rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 280rpx;
		height: 280rpx;
		background: rgba(255, 255, 255, 0.04);
	}

	.logo-wrap {
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		padding: 24rpx;
		border-radius: 48rpx;
		margin-bottom: 24rpx;
		backdrop-filter: blur(10px);
		position: relative;
		z-index: 1;
	}

	.logo-icon {
		width: 80rpx;
		height: 80rpx;
		background: #fff;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 6.7 1.4z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.brand-name {
		font-size: 48rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 6rpx;
		position: relative;
		z-index: 1;
	}

	.brand-slogan {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 16rpx;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.login-area {
		flex: 1;
		padding: 0 28rpx;
		margin-top: -80rpx;
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
		background: #EFF6FF;
		border: 2rpx solid #BFDBFE;
		border-radius: 24rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		margin-bottom: 32rpx;
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.icon-wand {
		width: 28rpx;
		height: 28rpx;
		background: #4A90D9;
		clip-path: polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%);
	}

	.demo-btn-text {
		font-size: 26rpx;
		font-weight: 700;
		color: #4A90D9;
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
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.2);
		transition: all 0.2s;

		&:active {
			opacity: 0.9;
			transform: scale(0.98);
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

	.other-login {
		margin-top: 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.divider-row {
		display: flex;
		align-items: center;
		width: 100%;
		margin-bottom: 32rpx;
	}

	.divider-line {
		flex: 1;
		height: 2rpx;
		background: linear-gradient(to right, transparent, #E5E7EB, transparent);
	}

	.divider-text {
		font-size: 24rpx;
		color: #9CA3AF;
		padding: 0 24rpx;
	}

	.wechat-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 120rpx;
		height: 120rpx;
		background: #07C160;
		border-radius: 50%;
		box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.25);
		transition: all 0.2s;

		&:active {
			transform: scale(0.92);
			box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
		}
	}

	.wechat-icon {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wechat-icon-inner {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.wx-ball {
		position: absolute;
		border-radius: 50%;
		background: #fff;
	}

	.wx-ball-left {
		width: 32rpx;
		height: 32rpx;
		left: 0;
		top: 4rpx;
	}

	.wx-ball-right {
		width: 24rpx;
		height: 24rpx;
		right: 0;
		bottom: 2rpx;
		background: rgba(255, 255, 255, 0.85);
	}

	.wx-eye {
		position: absolute;
		width: 5rpx;
		height: 5rpx;
		border-radius: 50%;
		background: #07C160;
	}

	.wx-eye-left {
		left: 10rpx;
		top: 14rpx;
	}

	.wx-eye-right {
		left: 22rpx;
		top: 14rpx;
	}

	.wx-mouth {
		position: absolute;
		left: 16rpx;
		top: 24rpx;
		width: 16rpx;
		height: 6rpx;
		border-bottom: 2rpx solid #07C160;
		border-radius: 0 0 50% 50%;
	}

	.wechat-text {
		font-size: 24rpx;
		color: #374151;
		margin-top: 16rpx;
		font-weight: 500;
	}

	.wechat-register-entry {
		margin-top: 24rpx;
		padding: 12rpx 32rpx;
		background: #fff;
		border-radius: 32rpx;
		border: 2rpx solid #07C160;
		transition: all 0.2s;

		&:active {
			transform: scale(0.96);
			background: #E8F8EE;
		}
	}

	.wechat-register-text {
		font-size: 24rpx;
		color: #07C160;
		font-weight: 500;
	}

	.register-entry {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 48rpx;
	}

	.register-text {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.register-link {
		font-size: 26rpx;
		font-weight: 700;
		color: #4A90D9;
		margin-left: 12rpx;
	}

	.bottom-entry {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 48rpx 0;
		gap: 12rpx;
	}

	.bottom-text {
		font-size: 26rpx;
		font-weight: 500;
		color: #9CA3AF;
	}

	.icon-bike {
		width: 28rpx;
		height: 20rpx;
		background: #9CA3AF;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-2v-2h-7v2H6.5c-.66 0-1.21.42-1.42 1.01C4.48 6.69 4 7.75 4 9v5c0 1.1.9 2 2 2h.02c.4 1.71 1.68 3.13 3.38 3.48L11 18l2.43-4.2c.51.23 1.07.35 1.65.35H16V14H12.84l-2.22 3.84-.45-1.54 2.32-4.02c.5-.87 1.46-1.43 2.51-1.43h1V7h1.28l.72 2h1.5l-.72-2h.62zm-2.92 7c-.83 0-1.5-.67-1.5-1.5S15.17 10 16 10s1.5.67 1.5 1.5S16.83 13 16 13zM8 13H7V8h3V6H6c-.33 0-.64.09-.91.24L4.26 7.69C4.47 7.27 4.93 7 5.47 7H6v6H4v-1H3v2h5v-1zm.5 1c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11s1.5.67 1.5 1.5S9.33 14 8.5 14z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-arrow-right {
		width: 14rpx;
		height: 14rpx;
		border-right: 3rpx solid #9CA3AF;
		border-top: 3rpx solid #9CA3AF;
		transform: rotate(45deg);
	}
</style>