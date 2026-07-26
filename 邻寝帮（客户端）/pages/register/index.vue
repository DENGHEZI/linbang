<template>
	<view class="page-container">
		<view class="header">
			<view class="deco-circle deco-circle-1"></view>
			<view class="deco-circle deco-circle-2"></view>
			<text class="header-title">邻寝帮</text>
			<text class="header-slogan">取快递、带三餐，邻寝帮随叫随到</text>
		</view>

		<view class="form-wrap">
			<view class="form-card">
				<view class="tab-row">
					<view
						class="tab-item"
						:class="{ active: currentTab === 'phone' }"
						@click="switchTab('phone')"
					>
						<view class="tab-icon tab-icon-phone"></view>
						<text class="tab-text">手机号注册</text>
					</view>
					<view
						class="tab-item"
						:class="{ active: currentTab === 'wechat' }"
						@click="switchTab('wechat')"
					>
						<view class="tab-icon tab-icon-wechat"></view>
						<text class="tab-text">微信号注册</text>
					</view>
				</view>

				<view class="form-content" v-if="currentTab === 'phone'">
					<view class="form-item">
						<view class="item-icon icon-phone"></view>
						<input
							class="form-input"
							v-model="form.phone"
							placeholder="手机号"
							type="number"
							maxlength="11"
						/>
					</view>

					<view class="form-row">
						<view class="form-item flex">
							<view class="item-icon icon-code"></view>
							<input
								class="form-input"
								v-model="form.code"
								placeholder="验证码"
								type="number"
							/>
						</view>
						<view
							class="code-btn"
							:class="{ disabled: codeCountdown > 0 }"
							@click="getCode"
						>
							<text class="code-btn-text">{{ codeBtnText }}</text>
						</view>
					</view>

					<view class="form-item">
						<view class="item-icon icon-lock"></view>
						<input
							class="form-input"
							v-model="form.password"
							placeholder="设置密码 (至少6位)"
							type="password"
						/>
						<view class="input-tip" v-if="form.password" :class="{ strong: pwdStrength >= 3 }">
							<text class="tip-text">{{ pwdStrengthText }}</text>
						</view>
					</view>

					<view class="form-item">
						<view class="item-icon icon-lock"></view>
						<input
							class="form-input"
							v-model="form.confirmPassword"
							placeholder="确认密码"
							type="password"
						/>
					</view>

					<view class="submit-btn" @click="handlePhoneRegister">
						<text class="submit-btn-text">立即注册</text>
					</view>
				</view>

				<view class="form-content" v-else>
					<view class="wechat-banner">
						<view class="wechat-banner-icon">
							<view class="wx-ball wx-ball-l"></view>
							<view class="wx-ball wx-ball-r"></view>
						</view>
						<view class="wechat-banner-text">
							<text class="wechat-banner-title">微信号注册</text>
							<text class="wechat-banner-desc">使用微信号快速注册登录</text>
						</view>
					</view>

					<view class="form-item">
						<view class="item-icon icon-wechat-id"></view>
						<input
							class="form-input"
							v-model="form.wechatId"
							placeholder="请输入微信号"
						/>
					</view>

					<view class="form-item">
						<view class="item-icon icon-lock"></view>
						<input
							class="form-input"
							v-model="form.password"
							placeholder="设置密码 (至少6位)"
							type="password"
						/>
					</view>

					<view class="form-item">
						<view class="item-icon icon-lock"></view>
						<input
							class="form-input"
							v-model="form.confirmPassword"
							placeholder="确认密码"
							type="password"
						/>
					</view>

					<view class="submit-btn wechat-submit" @click="handleWechatRegister">
						<text class="submit-btn-text">微信号注册</text>
					</view>
				</view>

				<view class="agreement">
					<view class="checkbox" :class="{ checked: agreed }" @click="toggleAgree">
						<view class="checkbox-inner" v-if="agreed"></view>
					</view>
					<text class="agreement-text">
						我已阅读并同意
						<text class="agreement-link" @click.stop="showToast('用户协议')">《用户协议》</text>
						和
						<text class="agreement-link" @click.stop="showToast('隐私政策')">《隐私政策》</text>
					</text>
				</view>
			</view>

			<view class="login-entry" @click="goLogin">
				<text class="login-text">已有账号？</text>
				<text class="login-link">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 'phone',
				form: {
					phone: '',
					code: '',
					password: '',
					confirmPassword: '',
					wechatId: ''
				},
				codeCountdown: 0,
				agreed: true
			}
		},
		computed: {
			codeBtnText() {
				if (this.codeCountdown > 0) {
					return `${this.codeCountdown}s`
				}
				return '获取验证码'
			},
			pwdStrength() {
				const pwd = this.form.password
				if (!pwd) return 0
				let strength = 0
				if (pwd.length >= 6) strength++
				if (pwd.length >= 10) strength++
				if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++
				if (/\d/.test(pwd)) strength++
				return Math.min(strength, 3)
			},
			pwdStrengthText() {
				return ['太弱', '一般', '良好', '强'][this.pwdStrength] || ''
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
			toggleAgree() {
				this.agreed = !this.agreed
			},
			handlePhoneRegister() {
				if (!this.agreed) {
					uni.showToast({ title: '请先同意用户协议', icon: 'none' })
					return
				}
				if (!this.form.phone) {
					uni.showToast({ title: '请输入手机号', icon: 'none' })
					return
				}
				if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
					uni.showToast({ title: '手机号格式不正确', icon: 'none' })
					return
				}
				if (!this.form.code) {
					uni.showToast({ title: '请输入验证码', icon: 'none' })
					return
				}
				if (!this.form.password) {
					uni.showToast({ title: '请设置密码', icon: 'none' })
					return
				}
				if (this.form.password.length < 6) {
					uni.showToast({ title: '密码至少 6 位', icon: 'none' })
					return
				}
				if (this.form.password !== this.form.confirmPassword) {
					uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
					return
				}

				uni.showLoading({ title: '注册中...' })
				setTimeout(() => {
					uni.hideLoading()
					uni.showToast({ title: '注册成功！', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/index'
						})
					}, 1200)
				}, 1000)
			},
			handleWechatRegister() {
				if (!this.agreed) {
					uni.showToast({ title: '请先同意用户协议', icon: 'none' })
					return
				}
				if (!this.form.wechatId) {
					uni.showToast({ title: '请输入微信号', icon: 'none' })
					return
				}
				if (!/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(this.form.wechatId)) {
					uni.showToast({ title: '微信号格式不正确', icon: 'none' })
					return
				}
				if (!this.form.password) {
					uni.showToast({ title: '请设置密码', icon: 'none' })
					return
				}
				if (this.form.password.length < 6) {
					uni.showToast({ title: '密码至少 6 位', icon: 'none' })
					return
				}
				if (this.form.password !== this.form.confirmPassword) {
					uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
					return
				}

				uni.showLoading({ title: '注册中...' })
				setTimeout(() => {
					uni.hideLoading()
					uni.showToast({ title: '微信号注册成功！', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/index'
						})
					}, 1200)
				}, 1000)
			},
			goLogin() {
				uni.redirectTo({
					url: '/pages/login/index'
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

	.header {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		height: 320rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #fff;
		position: relative;
		overflow: hidden;
	}

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: -60rpx;
		right: -60rpx;
		width: 240rpx;
		height: 240rpx;
		background: rgba(255, 255, 255, 0.08);
	}

	.deco-circle-2 {
		bottom: -40rpx;
		left: -40rpx;
		width: 180rpx;
		height: 180rpx;
		background: rgba(255, 255, 255, 0.06);
	}

	.header-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 4rpx;
		position: relative;
		z-index: 1;
	}

	.header-slogan {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 12rpx;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.form-wrap {
		flex: 1;
		padding: 0 28rpx;
		margin-top: -48rpx;
		position: relative;
		z-index: 2;
	}

	.form-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 36rpx 28rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.tab-row {
		display: flex;
		background: #F5F8FA;
		border-radius: 20rpx;
		padding: 8rpx;
		margin-bottom: 32rpx;
	}

	.tab-item {
		flex: 1;
		padding: 20rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		border-radius: 16rpx;
		transition: all 0.3s;

		&.active {
			background: #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

			.tab-text {
				color: #4A90D9;
				font-weight: 700;
			}

			.tab-icon {
				opacity: 1;
			}
		}
	}

	.tab-icon {
		width: 32rpx;
		height: 32rpx;
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	.tab-icon-phone {
		background: #4A90D9;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.tab-icon-wechat {
		background: #07C160;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8.691 2C4.768 2 1.5 4.765 1.5 8.403c0 2.03 1.127 3.833 2.883 5.065-.144.516-.514 1.85-.584 2.115-.071.266.106.263.222.192.09-.056 1.437-.975 2.016-1.363.737.215 1.521.331 2.334.331.207 0 .412-.008.614-.023-.129-.431-.198-.883-.198-1.351 0-3.064 2.98-5.549 6.656-5.549.164 0 .327.007.488.02C15.636 4.87 12.498 2 8.691 2zM5.785 6.791c.646 0 1.17.524 1.17 1.17s-.524 1.17-1.17 1.17-1.17-.524-1.17-1.17.524-1.17 1.17-1.17zm5.812 0c.646 0 1.17.524 1.17 1.17s-.524 1.17-1.17 1.17-1.17-.524-1.17-1.17.524-1.17 1.17-1.17zm3.5 2.985c-3.38 0-6.118 2.318-6.118 5.175 0 2.858 2.738 5.176 6.118 5.176.64 0 1.255-.088 1.836-.25.476.32 1.228.83 1.285.866.068.044.178.053.238-.036.047-.07.396-1.427.494-1.904 1.29-.954 2.123-2.386 2.123-3.853 0-2.857-2.737-5.174-6.116-5.174zm-2.07 2.568c.495 0 .896.4.896.895s-.401.896-.896.896-.896-.401-.896-.896.4-.895.896-.895zm4.156 0c.495 0 .896.4.896.895s-.401.896-.896.896-.896-.401-.896-.896.4-.895.896-.895z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.tab-text {
		font-size: 26rpx;
		color: #9CA3AF;
		font-weight: 500;
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.form-item {
		background: #F5F8FA;
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;
		position: relative;

		&.flex {
			flex: 1;
		}
	}

	.form-item:focus-within {
		border-color: #4A90D9;
		background: #fff;
	}

	.form-row {
		display: flex;
		gap: 16rpx;
		align-items: center;
	}

	.item-icon {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
		background: #9CA3AF;
	}

	.icon-phone {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-code {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-lock {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.icon-wechat-id {
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat center;
		mask-size: contain;
	}

	.form-input {
		flex: 1;
		font-size: 28rpx;
		color: #1F2937;
	}

	.input-tip {
		flex-shrink: 0;

		&.strong .tip-text {
			color: #10B981;
		}
	}

	.tip-text {
		font-size: 22rpx;
		color: #F59E0B;
		font-weight: 500;
	}

	.code-btn {
		padding: 24rpx 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.disabled {
			opacity: 0.5;
		}
	}

	.code-btn-text {
		font-size: 24rpx;
		color: #4A90D9;
		font-weight: 600;
		white-space: nowrap;
	}

	.submit-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 20rpx;
		padding: 30rpx 0;
		text-align: center;
		margin-top: 8rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.25);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}

		&.wechat-submit {
			background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
			box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.25);
		}
	}

	.submit-btn-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
		letter-spacing: 4rpx;
	}

	.wechat-banner {
		background: linear-gradient(135deg, #E8F8EE 0%, #D4F0DF 100%);
		border-radius: 20rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 28rpx;
		border: 2rpx solid #B8E5C8;
	}

	.wechat-banner-icon {
		width: 72rpx;
		height: 72rpx;
		background: #07C160;
		border-radius: 50%;
		position: relative;
		flex-shrink: 0;
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
	}

	.wx-ball {
		position: absolute;
		border-radius: 50%;
		background: #fff;
	}

	.wx-ball-l {
		width: 38rpx;
		height: 38rpx;
		left: 4rpx;
		top: 6rpx;
	}

	.wx-ball-r {
		width: 28rpx;
		height: 28rpx;
		right: 4rpx;
		bottom: 4rpx;
		background: rgba(255, 255, 255, 0.85);
	}

	.wechat-banner-text {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.wechat-banner-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #07C160;
	}

	.wechat-banner-desc {
		font-size: 24rpx;
		color: #374151;
	}

	.agreement {
		display: flex;
		align-items: flex-start;
		margin-top: 28rpx;
		gap: 12rpx;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #D1D5DB;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s;

		&.checked {
			background: #4A90D9;
			border-color: #4A90D9;
		}
	}

	.checkbox-inner {
		width: 14rpx;
		height: 8rpx;
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.agreement-text {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.6;
	}

	.agreement-link {
		color: #4A90D9;
		font-weight: 500;
	}

	.login-entry {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 48rpx;
		padding-bottom: 32rpx;
	}

	.login-text {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.login-link {
		font-size: 26rpx;
		font-weight: 700;
		color: #4A90D9;
		margin-left: 8rpx;
	}
</style>