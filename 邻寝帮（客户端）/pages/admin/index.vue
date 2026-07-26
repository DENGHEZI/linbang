<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="icon-back"></view>
			</view>
			<text class="header-title">审核管理</text>
			<view class="header-right"></view>
		</view>

		<view class="stats-bar">
			<view class="stat-item" @click="switchFilter('pending')">
				<text class="stat-value pending">{{ stats.pending }}</text>
				<text class="stat-label">待审核</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @click="switchFilter('approved')">
				<text class="stat-value approved">{{ stats.approved }}</text>
				<text class="stat-label">已通过</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @click="switchFilter('rejected')">
				<text class="stat-value rejected">{{ stats.rejected }}</text>
				<text class="stat-label">已拒绝</text>
			</view>
		</view>

		<view class="filter-bar">
			<view
				v-for="f in filters"
				:key="f.value"
				class="filter-item"
				:class="{ active: currentFilter === f.value }"
				@click="switchFilter(f.value)"
			>
				<text class="filter-text">{{ f.label }}</text>
			</view>
		</view>

		<scroll-view scroll-y class="user-list" :show-scrollbar="false">
			<view
				v-for="user in filteredUsers"
				:key="user.id"
				class="user-card"
				@click="viewDetail(user)"
			>
				<view class="user-header">
					<view class="user-avatar">
						<view class="avatar-icon"></view>
					</view>
					<view class="user-main">
						<view class="user-name-row">
							<text class="user-name">{{ user.name }}</text>
							<view class="status-badge" :class="user.status">
								<text class="status-text">{{ statusMap[user.status] }}</text>
							</view>
						</view>
						<text class="user-student-id">学号：{{ user.studentId }}</text>
					</view>
					<view class="user-school">
						<text class="school-text">{{ user.school }}</text>
					</view>
				</view>

				<view class="user-info-row">
					<view class="info-item">
						<view class="info-icon id-icon"></view>
						<text class="info-label">身份证</text>
						<text class="info-value">{{ user.idCard }}</text>
					</view>
				</view>

				<view class="user-info-row">
					<view class="info-item">
						<view class="info-icon phone-icon"></view>
						<text class="info-label">手机号</text>
						<text class="info-value">{{ user.phone }}</text>
					</view>
				</view>

				<view class="user-actions" v-if="user.status === 'pending'">
					<view class="action-btn reject" @click.stop="handleReject(user)">
						<text class="action-text">拒绝</text>
					</view>
					<view class="action-btn approve" @click.stop="handleApprove(user)">
						<text class="action-text">通过</text>
					</view>
				</view>

				<view class="submit-time">
					<text class="time-text">提交时间：{{ user.submitTime }}</text>
				</view>
			</view>

			<view v-if="filteredUsers.length === 0" class="empty-state">
				<view class="empty-icon"></view>
				<text class="empty-text">暂无{{ statusMap[currentFilter] }}的用户</text>
			</view>

			<view class="list-bottom"></view>
		</scroll-view>

		<view v-if="detailUser" class="detail-modal" @click="detailUser = null">
			<view class="detail-content" @click.stop>
				<view class="detail-header">
					<text class="detail-title">实名认证详情</text>
					<view class="detail-close" @click="detailUser = null">
						<view class="close-icon"></view>
					</view>
				</view>
				<view class="detail-body">
					<view class="detail-avatar">
						<view class="avatar-icon large"></view>
					</view>
					<view class="detail-name">{{ detailUser.name }}</view>
					<view class="detail-status" :class="detailUser.status">
						<text class="detail-status-text">{{ statusMap[detailUser.status] }}</text>
					</view>

					<view class="detail-section">
						<text class="section-label">基本信息</text>
						<view class="info-grid">
							<view class="grid-item">
								<text class="grid-label">学号</text>
								<text class="grid-value">{{ detailUser.studentId }}</text>
							</view>
							<view class="grid-item">
								<text class="grid-label">学校</text>
								<text class="grid-value">{{ detailUser.school }}</text>
							</view>
							<view class="grid-item">
								<text class="grid-label">身份证</text>
								<text class="grid-value">{{ detailUser.idCard }}</text>
							</view>
							<view class="grid-item">
								<text class="grid-label">手机号</text>
								<text class="grid-value">{{ detailUser.phone }}</text>
							</view>
						</view>
					</view>

					<view class="detail-section">
						<text class="section-label">证件照片</text>
						<view class="photo-list">
							<view class="photo-item">
								<view class="photo-placeholder id-card-front"></view>
								<text class="photo-label">身份证正面</text>
							</view>
							<view class="photo-item">
								<view class="photo-placeholder id-card-back"></view>
								<text class="photo-label">身份证反面</text>
							</view>
							<view class="photo-item">
								<view class="photo-placeholder student-card"></view>
								<text class="photo-label">学生证</text>
							</view>
						</view>
					</view>

					<view v-if="detailUser.status === 'pending'" class="detail-actions">
						<view class="detail-btn reject" @click="handleReject(detailUser)">
							<text class="detail-btn-text">拒绝</text>
						</view>
						<view class="detail-btn approve" @click="handleApprove(detailUser)">
							<text class="detail-btn-text">通过审核</text>
						</view>
					</view>

					<view v-if="detailUser.status === 'pending'" class="detail-time">
						<text class="time-text">提交时间：{{ detailUser.submitTime }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentFilter: 'pending',
				filters: [
					{ label: '待审核', value: 'pending' },
					{ label: '已通过', value: 'approved' },
					{ label: '已拒绝', value: 'rejected' },
					{ label: '全部', value: 'all' }
				],
				statusMap: {
					pending: '待审核',
					approved: '已通过',
					rejected: '已拒绝'
				},
				stats: {
					pending: 5,
					approved: 23,
					rejected: 2
				},
				users: [
					{
						id: 1,
						name: '张三',
						studentId: '20210101',
						school: '华南理工大学',
						idCard: '4401**********1234',
						phone: '138****5678',
						status: 'pending',
						submitTime: '2024-01-15 14:30'
					},
					{
						id: 2,
						name: '李四',
						studentId: '20220315',
						school: '华南师范大学',
						idCard: '4401**********5678',
						phone: '139****1234',
						status: 'pending',
						submitTime: '2024-01-15 13:20'
					},
					{
						id: 3,
						name: '王五',
						studentId: '20230208',
						school: '广州大学',
						idCard: '4401**********9012',
						phone: '137****3456',
						status: 'pending',
						submitTime: '2024-01-15 11:45'
					},
					{
						id: 4,
						name: '赵六',
						studentId: '20210420',
						school: '中山大学',
						idCard: '4401**********3456',
						phone: '136****7890',
						status: 'pending',
						submitTime: '2024-01-14 16:00'
					},
					{
						id: 5,
						name: '钱七',
						studentId: '20220510',
						school: '广东外语外贸大学',
						idCard: '4401**********7890',
						phone: '135****2345',
						status: 'pending',
						submitTime: '2024-01-14 10:15'
					},
					{
						id: 6,
						name: '孙八',
						studentId: '20200605',
						school: '华南理工大学',
						idCard: '4401**********2345',
						phone: '134****6789',
						status: 'approved',
						submitTime: '2024-01-13 09:30'
					},
					{
						id: 7,
						name: '周九',
						studentId: '20230701',
						school: '广州大学',
						idCard: '4401**********6789',
						phone: '133****0123',
						status: 'approved',
						submitTime: '2024-01-12 15:45'
					},
					{
						id: 8,
						name: '吴十',
						studentId: '20210815',
						school: '华南师范大学',
						idCard: '4401**********0123',
						phone: '132****4567',
						status: 'rejected',
						submitTime: '2024-01-11 11:00'
					}
				],
				detailUser: null
			}
		},
		computed: {
			filteredUsers() {
				if (this.currentFilter === 'all') {
					return this.users
				}
				return this.users.filter(u => u.status === this.currentFilter)
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
			},
			switchFilter(filter) {
				this.currentFilter = filter
			},
			viewDetail(user) {
				this.detailUser = user
			},
			handleApprove(user) {
				uni.showModal({
					title: '确认审核',
					content: `确定通过用户「${user.name}」的实名认证申请吗？`,
					success: (res) => {
						if (res.confirm) {
							user.status = 'approved'
							this.stats.pending = Math.max(0, this.stats.pending - 1)
							this.stats.approved = this.stats.approved + 1
							this.detailUser = null
							uni.showToast({
								title: '审核通过',
								icon: 'success'
							})
						}
					}
				})
			},
			handleReject(user) {
				uni.showModal({
					title: '确认拒绝',
					content: `确定拒绝用户「${user.name}」的实名认证申请吗？`,
					success: (res) => {
						if (res.confirm) {
							user.status = 'rejected'
							this.stats.pending = Math.max(0, this.stats.pending - 1)
							this.stats.rejected = this.stats.rejected + 1
							this.detailUser = null
							uni.showToast({
								title: '已拒绝',
								icon: 'none'
							})
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
		background: #4A90D9;
		padding: 88rpx 28rpx 28rpx;
		display: flex;
		align-items: center;
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
	}

	.header-right {
		width: 64rpx;
	}

	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: space-around;
		background: #fff;
		padding: 32rpx 28rpx;
		margin: -28rpx 28rpx 24rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		position: relative;
		z-index: 2;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.stat-value {
		font-size: 44rpx;
		font-weight: 800;

		&.pending { color: #F59E0B; }
		&.approved { color: #22C55E; }
		&.rejected { color: #EF4444; }
	}

	.stat-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.stat-divider {
		width: 2rpx;
		height: 48rpx;
		background: #F3F4F6;
	}

	.filter-bar {
		display: flex;
		padding: 0 28rpx 24rpx;
		gap: 16rpx;
	}

	.filter-item {
		padding: 16rpx 32rpx;
		background: #fff;
		border-radius: 32rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;

		&.active {
			background: #EFF6FF;
			border-color: #4A90D9;
		}
	}

	.filter-text {
		font-size: 26rpx;
		color: #6B7280;

		.active & {
			color: #4A90D9;
			font-weight: 600;
		}
	}

	.user-list {
		flex: 1;
		padding: 0 28rpx;
		height: 0;
	}

	.user-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.98);
		}
	}

	.user-header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 24rpx;
	}

	.user-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #4A90D9, #3672B0);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.avatar-icon {
		width: 44rpx;
		height: 44rpx;
		border: 4rpx solid #fff;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: -20rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 64rpx;
			height: 32rpx;
			border: 4rpx solid #fff;
			border-top: none;
			border-radius: 32rpx 32rpx 0 0;
		}

		&.large {
			width: 64rpx;
			height: 64rpx;

			&::after {
				width: 88rpx;
				height: 44rpx;
			}
		}
	}

	.user-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.user-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.status-badge {
		padding: 4rpx 16rpx;
		border-radius: 16rpx;

		&.pending {
			background: #FEF3C7;
		}
		&.approved {
			background: #DCFCE7;
		}
		&.rejected {
			background: #FEE2E2;
		}
	}

	.status-text {
		font-size: 20rpx;
		font-weight: 600;

		.pending & { color: #D97706; }
		.approved & { color: #16A34A; }
		.rejected & { color: #DC2626; }
	}

	.user-student-id {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.user-school {
		flex-shrink: 0;
	}

	.school-text {
		font-size: 22rpx;
		color: #6B7280;
		background: #F3F4F6;
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
	}

	.user-info-row {
		margin-bottom: 16rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.info-icon {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		position: relative;
		flex-shrink: 0;

		&.id-icon {
			background: #EFF6FF;
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 20rpx;
				height: 14rpx;
				border: 3rpx solid #4A90D9;
				border-radius: 3rpx;
			}
		}
		&.phone-icon {
			background: #F0FDF4;
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%) rotate(-15deg);
				width: 16rpx;
				height: 22rpx;
				border: 3rpx solid #22C55E;
				border-radius: 4rpx;
			}
		}
	}

	.info-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.info-value {
		font-size: 24rpx;
		color: #374151;
		font-weight: 500;
	}

	.user-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 2rpx solid #F3F4F6;
	}

	.action-btn {
		flex: 1;
		padding: 20rpx;
		border-radius: 16rpx;
		text-align: center;
		transition: all 0.2s;

		&.reject {
			background: #FEF2F2;
			&:active { background: #FEE2E2; }
		}
		&.approve {
			background: #4A90D9;
			&:active { background: #3672B0; }
		}
	}

	.action-text {
		font-size: 28rpx;
		font-weight: 600;

		.reject & { color: #EF4444; }
		.approve & { color: #fff; }
	}

	.submit-time {
		margin-top: 16rpx;
		text-align: right;
	}

	.time-text {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 0;
		gap: 24rpx;
	}

	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		background: #F3F4F6;
		border-radius: 50%;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 48rpx;
			height: 48rpx;
			border: 4rpx solid #D1D5DB;
			border-radius: 50%;
		}
	}

	.empty-text {
		font-size: 28rpx;
		color: #9CA3AF;
	}

	.list-bottom {
		height: 60rpx;
	}

	.detail-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 999;
	}

	.detail-content {
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		max-height: 85vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 28rpx;
		border-bottom: 2rpx solid #F3F4F6;
		flex-shrink: 0;
	}

	.detail-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.detail-close {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-icon {
		width: 28rpx;
		height: 28rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 28rpx;
			height: 4rpx;
			background: #9CA3AF;
			border-radius: 2rpx;
		}

		&::before { transform: translate(-50%, -50%) rotate(45deg); }
		&::after { transform: translate(-50%, -50%) rotate(-45deg); }
	}

	.detail-body {
		flex: 1;
		overflow-y: auto;
		padding: 28rpx;
	}

	.detail-avatar {
		display: flex;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.detail-name {
		text-align: center;
		font-size: 38rpx;
		font-weight: 700;
		color: #1F2937;
		margin-bottom: 16rpx;
	}

	.detail-status {
		display: flex;
		justify-content: center;
		margin-bottom: 32rpx;

		&.pending .detail-status-text {
			background: #FEF3C7;
			color: #D97706;
		}
		&.approved .detail-status-text {
			background: #DCFCE7;
			color: #16A34A;
		}
		&.rejected .detail-status-text {
			background: #FEE2E2;
			color: #DC2626;
		}
	}

	.detail-status-text {
		font-size: 24rpx;
		font-weight: 600;
		padding: 8rpx 24rpx;
		border-radius: 16rpx;
	}

	.detail-section {
		margin-bottom: 32rpx;
	}

	.section-label {
		font-size: 28rpx;
		font-weight: 600;
		color: #1F2937;
		margin-bottom: 20rpx;
		display: block;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		background: #F5F8FA;
		padding: 20rpx;
		border-radius: 16rpx;
	}

	.grid-label {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.grid-value {
		font-size: 26rpx;
		color: #1F2937;
		font-weight: 500;
	}

	.photo-list {
		display: flex;
		gap: 20rpx;
	}

	.photo-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.photo-placeholder {
		width: 100%;
		aspect-ratio: 1.586;
		background: #F3F4F6;
		border-radius: 16rpx;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 60rpx;
			height: 60rpx;
			border: 4rpx dashed #D1D5DB;
			border-radius: 8rpx;
		}

		&::after {
			content: '照片';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, calc(-50% + 40rpx));
			font-size: 22rpx;
			color: #9CA3AF;
		}

		&.id-card-front {
			background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
		}
		&.id-card-back {
			background: linear-gradient(135deg, #FEF3C7, #FDE68A);
		}
		&.student-card {
			background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
		}
	}

	.photo-label {
		font-size: 22rpx;
		color: #6B7280;
	}

	.detail-actions {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.detail-btn {
		flex: 1;
		padding: 24rpx;
		border-radius: 20rpx;
		text-align: center;
		transition: all 0.2s;

		&.reject {
			background: #FEF2F2;
			&:active { background: #FEE2E2; }
		}
		&.approve {
			background: #4A90D9;
			&:active { background: #3672B0; }
		}
	}

	.detail-btn-text {
		font-size: 30rpx;
		font-weight: 600;

		.reject & { color: #EF4444; }
		.approve & { color: #fff; }
	}

	.detail-time {
		text-align: center;
		padding-top: 16rpx;
		border-top: 2rpx solid #F3F4F6;
	}
</style>
