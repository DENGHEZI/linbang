<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">服务评价</text>
		</view>

		<scroll-view scroll-y class="content" :show-scrollbar="false">
			<view class="rider-card">
				<view class="rider-avatar">
					<view class="avatar-inner">
						<text class="avatar-text">{{ rider.name.charAt(0) }}</text>
					</view>
				</view>
				<view class="rider-info">
					<view class="name-row">
						<text class="rider-name">{{ rider.name }}</text>
						<view class="rider-tag">
							<text class="tag-text">{{ rider.level }}</text>
						</view>
					</view>
					<view class="rider-rating">
						<view class="stars-display">
							<view class="star filled" v-for="n in 5" :key="n" :class="{ empty: n > Math.round(rider.rating) }"></view>
						</view>
						<text class="rating-score">{{ rider.rating.toFixed(1) }}</text>
						<text class="rating-count">({{ rider.totalOrders }}单)</text>
					</view>
					<view class="rider-meta" v-if="rider.school">
						<text class="meta-item">🏫 {{ rider.school }}</text>
						<text class="meta-item" v-if="rider.phone">📱 {{ rider.phone }}</text>
					</view>
				</view>
			</view>

			<view class="section-card">
				<view class="section-title">
					<text class="title-text">总体评分</text>
				</view>
				<view class="star-rating">
					<view
						v-for="n in 5"
						:key="n"
						class="star-item"
						@click="setOverallRating(n)"
					>
						<view class="star" :class="{ active: n <= overallRating }"></view>
					</view>
				</view>
				<text class="rating-hint">{{ ratingLabels[overallRating - 1] || '请选择评分' }}</text>
			</view>

			<view class="section-card">
				<view class="section-title">
					<text class="title-text">分项评分</text>
				</view>
				<view class="dimension-list">
					<view class="dimension-item" v-for="(dim, key) in dimensions" :key="key">
						<text class="dim-name">{{ dim.label }}</text>
						<view class="dim-stars">
							<view
								v-for="n in 5"
								:key="n"
								class="dim-star"
								@click="setDimensionRating(key, n)"
							>
								<view class="star-small" :class="{ active: n <= dim.value }"></view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="section-card">
				<view class="section-title">
					<text class="title-text">评价标签</text>
					<text class="title-hint">点击选择合适的标签</text>
				</view>
				<view class="tag-list">
					<view
						v-for="(tag, index) in tagOptions"
						:key="index"
						class="tag-item"
						:class="{ selected: selectedTags.indexOf(tag) > -1 }"
						@click="toggleTag(tag)"
					>
						<text class="tag-label">{{ tag }}</text>
					</view>
				</view>
			</view>

			<view class="section-card">
				<view class="section-title">
					<text class="title-text">骑手历史评价</text>
					<view class="toggle-btn" @click="showReviewList = !showReviewList">
						<text class="toggle-text">{{ showReviewList ? '收起' : '展开全部' }}</text>
					</view>
				</view>
				<view class="review-list">
					<view class="review-item" v-for="(review, idx) in riderReviews" :key="idx">
						<view class="review-header">
							<view class="reviewer-avatar">
								<text class="reviewer-text">用</text>
							</view>
							<view class="reviewer-info">
								<text class="reviewer-name">用户{{ idx + 1 }}**</text>
								<text class="review-time">{{ formatReviewTime(review.createdAt) }}</text>
							</view>
							<view class="review-score">
								<view class="stars-display small">
									<view class="star filled" v-for="n in 5" :key="n" :class="{ empty: n > Math.round(review.score) }"></view>
								</view>
								<text class="score-num">{{ review.score.toFixed(1) }}</text>
							</view>
						</view>
						<view class="review-tags" v-if="review.tags && review.tags.length > 0">
							<view class="mini-tag" v-for="(tag, tIdx) in review.tags.slice(0, 4)" :key="tIdx">
								<text class="mini-tag-text">{{ tag }}</text>
							</view>
						</view>
						<text class="review-comment" v-if="review.comment">{{ review.comment }}</text>
						<view class="review-order-info">
							<text class="order-type-label">{{ review.orderType }}</text>
							<text class="order-price-label">订单 ¥{{ review.price.toFixed(2) }}</text>
						</view>
						<view class="review-dimensions" v-if="showReviewList && review.dimensions">
							<view class="dim-row" v-for="(val, key) in review.dimensions" :key="key">
								<text class="dim-label">{{ getDimLabel(key) }}</text>
								<view class="stars-display tiny">
									<view class="star filled" v-for="n in 5" :key="n" :class="{ empty: n > val }"></view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="no-reviews" v-if="riderReviews.length === 0">
					<text class="no-reviews-text">暂无评价，快来成为第一个评价的人吧！</text>
				</view>
			</view>

			<view class="section-card">
				<view class="section-title">
					<text class="title-text">文字评价</text>
					<text class="title-hint">{{ comment.length }}/500</text>
				</view>
				<textarea
					class="comment-input"
					v-model="comment"
					maxlength="500"
					placeholder="请输入您对本次服务的评价，您的反馈将帮助我们做得更好..."
					placeholder-class="comment-placeholder"
				/>
			</view>

			<view class="submit-wrap">
				<view
					class="submit-btn"
					:class="{ disabled: !canSubmit, active: canSubmit }"
					@click="submitReview"
				>
					<text class="submit-text">{{ submitting ? '提交中...' : (isReadOnly ? '已评价' : '提交评价') }}</text>
				</view>
				<view class="submit-hint" v-if="!canSubmit && !isReadOnly">
					<text class="hint-text">请先在上方选择总体评分星级</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { orderService } from '@/services/order.js'
	
	export default {
		data() {
			return {
				orderId: '',
				rider: {
					name: '骑手',
					rating: 0,
					totalOrders: 0,
					level: '普通骑手',
					avatar: '',
					phone: '',
					school: ''
				},
				overallRating: 0,
				ratingLabels: ['非常差', '较差', '一般', '满意', '非常满意'],
				dimensions: {
					attitude: { label: '服务态度', value: 0 },
					speed: { label: '配送速度', value: 0 },
					appearance: { label: '着装整洁', value: 0 }
				},
				tagOptions: [
					'准时送达',
					'态度很好',
					'配送很快',
					'包装完好',
					'沟通顺畅',
					'热情友好',
					'专业负责',
					'值得推荐'
				],
				selectedTags: [],
				comment: '',
				submitting: false,
				isReadOnly: false,
				existingReview: null,
				riderReviews: [],
				showReviewList: false
			}
		},
		computed: {
			canSubmit() {
				return this.overallRating > 0 && !this.submitting && !this.isReadOnly
			},
			submitBtnClass() {
				return this.canSubmit ? 'submit-btn active' : 'submit-btn disabled'
			}
		},
		onLoad(options) {
			if (options && options.orderId) {
				this.orderId = options.orderId
				this.loadOrderInfo()
			}
		},
		methods: {
			async loadOrderInfo() {
				try {
					const result = await orderService.detail(this.orderId)
					if (result.errCode === 0 && result.data) {
						const order = result.data
						
						// 同步客户端的学校信息到骑手档案
						try {
							const userProfile = uni.getStorageSync('user_profile')
							if (userProfile && userProfile.school) {
								const riderProfile = uni.getStorageSync('rider_profile')
								if (riderProfile && riderProfile.school !== userProfile.school) {
									riderProfile.school = userProfile.school
									if (userProfile.nickname && userProfile.nickname !== '邻寝帮用户') {
										riderProfile.nickname = userProfile.nickname
									}
									uni.setStorageSync('rider_profile', riderProfile)
								}
							}
						} catch (e) {}
						
						// 加载骑手档案数据
						try {
							const riderProfile = uni.getStorageSync('rider_profile')
							if (riderProfile) {
								this.rider.name = riderProfile.nickname || riderProfile.name || order.rider_name || '骑手'
								this.rider.rating = riderProfile.rating || order.rider_rating || 4.9
								this.rider.totalOrders = riderProfile.totalOrders || riderProfile.completedOrders || order.rider_total_orders || 23
								this.rider.level = riderProfile.verified ? '认证骑手' : '普通骑手'
								this.rider.avatar = riderProfile.avatar || ''
								this.rider.phone = riderProfile.phone || order.rider_phone || ''
								this.rider.school = riderProfile.school || ''
							}
						} catch (e) {
							console.warn('[评价] 加载骑手档案失败:', e.message)
						}
						
						// 从订单信息补充骑手数据
						if (order.rider_name && this.rider.name === '骑手') {
							this.rider.name = order.rider_name
						}
						if (order.rider_phone) {
							this.rider.phone = order.rider_phone
						}
						
						// 加载该骑手的历史评价
						this.loadRiderReviews(order.rider_id || 'rider_R001')
						
						if (order.rating && order.rating.score && order.reviewed_at) {
							this.isReadOnly = true
							this.existingReview = order.rating
							this.overallRating = order.rating.score
							if (order.rating.dimensions) {
								Object.keys(order.rating.dimensions).forEach(key => {
									if (this.dimensions[key]) {
										this.dimensions[key].value = order.rating.dimensions[key]
									}
								})
							}
							if (order.rating.tags) {
								this.selectedTags = order.rating.tags
							}
							if (order.rating.comment) {
								this.comment = order.rating.comment
							}
						}
						
						console.log('[评价] 订单信息加载完成，骑手:', this.rider.name, '评分:', this.rider.rating)
					}
				} catch (e) {
					console.warn('[评价] 加载订单信息失败:', e.message)
					// 即使订单加载失败，也加载骑手默认信息
					this.loadDefaultRiderInfo()
				}
			},
			loadDefaultRiderInfo() {
				try {
					const riderProfile = uni.getStorageSync('rider_profile')
					if (riderProfile) {
						this.rider.name = riderProfile.nickname || '骑手小李'
						this.rider.rating = riderProfile.rating || 4.9
						this.rider.totalOrders = riderProfile.totalOrders || 23
						this.rider.level = riderProfile.verified ? '认证骑手' : '普通骑手'
						this.rider.phone = riderProfile.phone || ''
						this.rider.school = riderProfile.school || ''
					}
				} catch (e) {}
				this.loadRiderReviews('rider_R001')
			},
			loadRiderReviews(riderId) {
				try {
					// 从已完成且已评价的订单中收集该骑手的评价
					const orders = uni.getStorageSync('orders_data') || []
					const completedWithReviews = orders.filter(o => 
						o.status === 'completed' && 
						o.rating && 
						o.rating.score &&
						(!o.rider_id || o.rider_id === riderId)
					)
					
					if (completedWithReviews.length > 0) {
						this.riderReviews = completedWithReviews
							.sort((a, b) => (b.reviewed_at || 0) - (a.reviewed_at || 0))
							.slice(0, 5)
							.map(o => ({
								orderId: o._id,
								score: o.rating.score,
								dimensions: o.rating.dimensions || {},
								tags: o.rating.tags || [],
								comment: o.rating.comment || '',
								createdAt: o.reviewed_at || o.updated_at || Date.now(),
								orderType: o.category || '配送',
								price: o.price || 0
							}))
						
						// 更新骑手统计数据
						if (this.riderReviews.length > 0 && this.rider.totalOrders < this.riderReviews.length) {
							this.rider.totalOrders = this.riderReviews.length
							const avgScore = this.riderReviews.reduce((sum, r) => sum + r.score, 0) / this.riderReviews.length
							this.rider.rating = Math.round(avgScore * 10) / 10
						}
					} else {
						// 没有历史评价，使用示例评价
						this.riderReviews = this.getSampleReviews()
					}
				} catch (e) {
					console.warn('[评价] 加载骑手评价失败:', e.message)
					this.riderReviews = this.getSampleReviews()
				}
			},
			getSampleReviews() {
				return [
					{
						orderId: 'sample_1',
						score: 5,
						dimensions: { attitude: 5, speed: 5, appearance: 5 },
						tags: ['准时送达', '态度很好', '值得推荐'],
						comment: '骑手配送非常快，态度也很好，物品包装完好，下次还会选择！',
						createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
						orderType: '快递代取',
						price: 8
					},
					{
						orderId: 'sample_2',
						score: 5,
						dimensions: { attitude: 5, speed: 5, appearance: 4 },
						tags: ['准时送达', '配送很快', '沟通顺畅'],
						comment: '下单后很快就送达了，途中还主动联系确认信息，非常专业。',
						createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
						orderType: '食堂代买',
						price: 12
					},
					{
						orderId: 'sample_3',
						score: 4,
						dimensions: { attitude: 4, speed: 4, appearance: 4 },
						tags: ['准时送达', '热情友好'],
						comment: '整体不错，就是稍微晚了几分钟，其他都很好。',
						createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
						orderType: '即时速递',
						price: 15
					}
				]
			},
			formatReviewTime(timestamp) {
				if (!timestamp) return ''
				const now = new Date()
				const date = new Date(timestamp)
				const diff = now - date
				const days = Math.floor(diff / (1000 * 60 * 60 * 24))
				
				if (days === 0) return '今天'
				if (days === 1) return '昨天'
				if (days < 7) return days + '天前'
				if (days < 30) return Math.floor(days / 7) + '周前'
				return `${date.getMonth() + 1}月${date.getDate()}日`
			},
			getDimLabel(key) {
				const labels = {
					attitude: '服务态度',
					speed: '配送速度',
					appearance: '着装整洁'
				}
				return labels[key] || key
			},
			goBack() {
				uni.navigateBack()
			},
			setOverallRating(n) {
				if (this.isReadOnly) return
				this.overallRating = n
				this.$forceUpdate()
			},
			setDimensionRating(key, n) {
				if (this.isReadOnly) return
				this.dimensions[key].value = n
				this.$forceUpdate()
			},
			toggleTag(tag) {
				if (this.isReadOnly) return
				const index = this.selectedTags.indexOf(tag)
				if (index > -1) {
					this.selectedTags.splice(index, 1)
				} else {
					if (this.selectedTags.length < 5) {
						this.selectedTags.push(tag)
					} else {
						uni.showToast({
							title: '最多选择5个标签',
							icon: 'none'
						})
					}
				}
			},
			async submitReview() {
				if (this.isReadOnly) {
					uni.showToast({
						title: '此订单已评价',
						icon: 'none'
					})
					return
				}
				if (this.overallRating === 0) {
					uni.showToast({
						title: '请先选择总体评分',
						icon: 'none'
					})
					return
				}
				if (!this.orderId) {
					uni.showToast({
						title: '订单ID缺失',
						icon: 'none'
					})
					return
				}
				if (this.submitting) return
				
				this.submitting = true
				
				try {
					const dimValues = {}
					Object.keys(this.dimensions).forEach(key => {
						dimValues[key] = this.dimensions[key].value
					})
					
					const reviewData = {
						score: this.overallRating,
						dimensions: dimValues,
						tags: this.selectedTags,
						comment: this.comment
					}
					
					const result = await orderService.submitReview(this.orderId, reviewData)
					
					if (result.errCode === 0) {
						uni.showToast({
							title: '评价提交成功',
							icon: 'success'
						})
						this.isReadOnly = true
						this.existingReview = reviewData
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						uni.showToast({
							title: result.errMsg || '评价失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('[评价] 提交失败:', error)
					uni.showToast({
						title: '评价失败，请重试',
						icon: 'none'
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
		background: #4A90D9;
		padding: 88rpx 28rpx 32rpx;
		display: flex;
		align-items: center;
		position: relative;
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
		border-left: 4rpx solid #fff;
		border-bottom: 4rpx solid #fff;
		transform: rotate(45deg);
		margin-right: 8rpx;
	}

	.header-title {
		flex: 1;
		text-align: center;
		font-size: 34rpx;
		font-weight: 700;
		color: #fff;
		margin-right: 64rpx;
	}

	.content {
		flex: 1;
		padding: 24rpx 28rpx;
	}

	.rider-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 24rpx;
	}

	.rider-avatar {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9, #3672B0);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
		overflow: hidden;
	}

	.avatar-inner {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rider-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.rider-name {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.rider-rating {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.rating-score {
		font-size: 28rpx;
		font-weight: 700;
		color: #F59E0B;
	}

	.rating-count {
		font-size: 24rpx;
		color: #6B7280;
	}

	.rider-tag {
		background: linear-gradient(135deg, #4A90D9, #3672B0);
		padding: 4rpx 14rpx;
		border-radius: 8rpx;
	}

	.tag-text {
		font-size: 20rpx;
		font-weight: 600;
		color: #fff;
	}

	.section-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.title-text {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.title-hint {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.star-rating {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		margin-bottom: 16rpx;
	}

	.star-item {
		padding: 8rpx;
	}

	.star {
		width: 80rpx;
		height: 80rpx;
		background: #E5E7EB;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
		transition: background 0.2s;

		&.active {
			background: #F59E0B;
		}
	}

	.rating-hint {
		display: block;
		text-align: center;
		font-size: 28rpx;
		color: #6B7280;
	}

	.dimension-list {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}

	.dimension-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dim-name {
		font-size: 28rpx;
		font-weight: 500;
		color: #374151;
	}

	.dim-stars {
		display: flex;
		gap: 12rpx;
	}

	.dim-star {
		padding: 6rpx;
	}

	.star-small {
		width: 48rpx;
		height: 48rpx;
		background: #E5E7EB;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
		transition: background 0.2s;

		&.active {
			background: #F59E0B;
		}
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.tag-item {
		padding: 16rpx 28rpx;
		border-radius: 32rpx;
		background: #F3F4F6;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.selected {
			background: #EFF6FF;
			border-color: #4A90D9;
		}
	}

	.tag-label {
		font-size: 26rpx;
		color: #6B7280;

		.selected & {
			color: #4A90D9;
			font-weight: 500;
		}
	}

	.comment-input {
		width: 100%;
		min-height: 200rpx;
		font-size: 28rpx;
		color: #1F2937;
		line-height: 1.6;
		padding: 16rpx 0;
		background: transparent;
	}

	.comment-placeholder {
		color: #9CA3AF;
	}

	.submit-wrap {
		padding: 24rpx 0 60rpx;
	}

	.submit-btn {
		background: #4A90D9;
		border-radius: 24rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
		}

		&.active {
			background: #4A90D9;
			box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.4);
		}

		&.disabled {
			background: #9CA3AF;
			box-shadow: none;
		}
	}

	.submit-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #fff;
	}

	.submit-hint {
		text-align: center;
		margin-top: 16rpx;
	}

	.hint-text {
		font-size: 24rpx;
		color: #F59E0B;
	}

	.avatar-text {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
		text-align: center;
		line-height: 1;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.rider-meta {
		display: flex;
		gap: 16rpx;
		margin-top: 8rpx;
	}

	.meta-item {
		font-size: 22rpx;
		color: #6B7280;
	}

	.stars-display {
		display: flex;
		gap: 4rpx;

		&.small {
			gap: 3rpx;
		}

		&.tiny {
			gap: 2rpx;
		}
	}

	.star {
		width: 24rpx;
		height: 24rpx;
		background: #F59E0B;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);

		&.empty {
			background: #E5E7EB;
		}

		&.filled {
			background: #F59E0B;
		}
	}

	.review-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.review-item {
		background: #F8FAFC;
		border-radius: 16rpx;
		padding: 24rpx;
	}

	.review-header {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.reviewer-avatar {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9, #3672B0);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.reviewer-text {
		font-size: 24rpx;
		font-weight: 600;
		color: #fff;
	}

	.reviewer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.reviewer-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #1F2937;
	}

	.review-time {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.review-score {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.score-num {
		font-size: 26rpx;
		font-weight: 600;
		color: #F59E0B;
	}

	.review-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 12rpx;
	}

	.mini-tag {
		background: #EFF6FF;
		padding: 6rpx 14rpx;
		border-radius: 8rpx;
	}

	.mini-tag-text {
		font-size: 20rpx;
		color: #4A90D9;
	}

	.review-comment {
		font-size: 26rpx;
		color: #374151;
		line-height: 1.6;
		margin-bottom: 12rpx;
	}

	.review-order-info {
		display: flex;
		gap: 16rpx;
		padding-top: 12rpx;
		border-top: 1rpx solid #E5E7EB;
	}

	.order-type-label, .order-price-label {
		font-size: 22rpx;
		color: #6B7280;
	}

	.review-dimensions {
		margin-top: 16rpx;
		padding-top: 12rpx;
		border-top: 1rpx dashed #E5E7EB;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.dim-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dim-label {
		font-size: 22rpx;
		color: #6B7280;
	}

	.no-reviews {
		text-align: center;
		padding: 32rpx;
	}

	.no-reviews-text {
		font-size: 26rpx;
		color: #9CA3AF;
	}

	.toggle-btn {
		background: #EFF6FF;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
	}

	.toggle-text {
		font-size: 24rpx;
		color: #4A90D9;
	}
</style>
