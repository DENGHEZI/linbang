<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">我的银行卡</text>
			<view class="header-placeholder"></view>
		</view>

		<scroll-view scroll-y class="content-area" :show-scrollbar="false">
			<view class="bank-list" v-if="bankCards.length > 0">
				<view 
					class="bank-card" 
					v-for="(card, index) in bankCards" 
					:key="card.id"
					:class="{ default: card.isDefault }"
				>
					<view class="card-header">
						<view class="card-bank-logo" :style="{ backgroundColor: getBankColor(card.bankCode) }">
							<text class="logo-text">{{ card.bankName.charAt(0) }}</text>
						</view>
						<view class="card-info">
							<text class="card-bank-name">{{ card.bankName }}</text>
							<text class="card-type">储蓄卡</text>
						</view>
						<view class="default-tag" v-if="card.isDefault">
							<text class="default-text">默认</text>
						</view>
					</view>
					<view class="card-number-row">
						<text class="card-number">{{ card.cardNumber }}</text>
					</view>
					<view class="card-footer">
						<text class="card-holder">{{ card.cardHolder }}</text>
						<text class="card-balance-label">尾号 {{ card.last4 }}</text>
					</view>
					<view class="card-actions">
						<view 
							class="action-btn" 
							:class="{ disabled: card.isDefault }"
							@click="setDefault(index)"
						>
							<text class="action-text">{{ card.isDefault ? '当前默认' : '设为默认' }}</text>
						</view>
						<view class="action-btn delete" @click="deleteCard(index)">
							<text class="action-text">删除</text>
						</view>
					</view>
				</view>
			</view>

			<view class="empty-state" v-else>
				<view class="empty-icon"></view>
				<text class="empty-text">还没有添加银行卡</text>
				<text class="empty-desc">支持招商银行、建设银行、中国银行</text>
			</view>

			<view class="list-bottom-space"></view>
		</scroll-view>

		<view class="footer">
			<view class="add-btn" @click="goAddCard">
				<text class="add-icon">+</text>
				<text class="add-text">添加银行卡</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { bankCardService } from '@/services/bankCard.js'

	export default {
		data() {
			return {
				bankCards: []
			}
		},
		onShow() {
			this.loadCards()
		},
		methods: {
			async loadCards() {
				try {
					const cards = await bankCardService.getCards()
					this.bankCards = cards
				} catch (e) {
					console.warn('[银行卡] 加载失败:', e.message)
				}
			},
			getBankColor(code) {
				const colors = {
					'CMB': '#CC1931',
					'CCB': '#004B8D',
					'BOC': '#C8102E'
				}
				return colors[code] || '#4A90D9'
			},
			goBack() {
				uni.navigateBack()
			},
			goAddCard() {
				uni.navigateTo({
					url: '/pages/add-bank-card/index'
				})
			},
			async setDefault(index) {
				const card = this.bankCards[index]
				if (card.isDefault) return
				try {
					const result = await bankCardService.setDefault(card.id)
					if (result.errCode === 0) {
						this.bankCards.forEach((c, i) => {
							c.isDefault = (i === index)
						})
						uni.showToast({ title: '已设为默认', icon: 'none' })
					}
				} catch (e) {
					uni.showToast({ title: '设置失败', icon: 'none' })
				}
			},
			async deleteCard(index) {
				const card = this.bankCards[index]
				uni.showModal({
					title: '删除银行卡',
					content: `确定要删除 ${card.bankName} 尾号 ${card.last4} 吗？`,
					confirmColor: '#EF4444',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await bankCardService.deleteCard(card.id)
								if (result.errCode === 0) {
									uni.showToast({ title: '删除成功', icon: 'none' })
									await this.loadCards()
								} else {
									uni.showToast({ title: result.errMsg || '删除失败', icon: 'none' })
								}
							} catch (e) {
								uni.showToast({ title: '删除失败', icon: 'none' })
							}
						}
					}
				})
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

	.header-placeholder {
		width: 64rpx;
	}

	.content-area {
		flex: 1;
		padding: 24rpx 28rpx;
	}

	.bank-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.bank-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		position: relative;
		overflow: hidden;

		&.default {
			border: 2rpx solid #4A90D9;
		}
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.card-bank-logo {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.logo-text {
		font-size: 36rpx;
		font-weight: 700;
		color: #fff;
	}

	.card-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.card-bank-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.card-type {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.default-tag {
		background: #EFF6FF;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}

	.default-text {
		font-size: 22rpx;
		color: #4A90D9;
		font-weight: 500;
	}

	.card-number-row {
		margin-top: 32rpx;
		padding: 24rpx;
		background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
		border-radius: 16rpx;
	}

	.card-number {
		font-size: 36rpx;
		font-weight: 600;
		color: #1F2937;
		letter-spacing: 4rpx;
		font-family: 'Courier New', monospace;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20rpx;
	}

	.card-holder {
		font-size: 28rpx;
		color: #6B7280;
	}

	.card-balance-label {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.card-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #F3F4F6;
	}

	.action-btn {
		flex: 1;
		height: 72rpx;
		background: #F3F4F6;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.delete {
			background: #FEF2F2;
		}

		&.disabled {
			background: #F9FAFB;
		}
	}

	.action-text {
		font-size: 26rpx;
		color: #4B5563;

		.delete & {
			color: #EF4444;
		}

		.disabled & {
			color: #9CA3AF;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 60rpx;
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
			transform: translate(-50%, -50%);
			width: 80rpx;
			height: 60rpx;
			border: 4rpx solid #9CA3AF;
			border-radius: 8rpx;
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

	.add-btn {
		background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
		border-radius: 24rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
	}

	.add-icon {
		font-size: 40rpx;
		font-weight: 300;
		color: #fff;
	}

	.add-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}
</style>
