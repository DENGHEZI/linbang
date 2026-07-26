<template>
	<view class="page-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<view class="back-icon"></view>
			</view>
			<text class="header-title">收货地址</text>
		</view>

		<scroll-view scroll-y class="content-area" :show-scrollbar="false">
			<view class="address-list">
				<view class="address-card" v-for="(item, index) in addressList" :key="index">
					<view class="card-top">
						<view class="user-info-row">
							<text class="user-name">{{ item.name }}</text>
							<text class="user-phone">{{ item.phone }}</text>
							<view class="tag" :class="getTagClass(item.tag)">
								<text class="tag-icon">{{ getTagIcon(item.tag) }}</text>
								<text class="tag-text">{{ getTagLabel(item.tag) }}</text>
							</view>
							<view class="tag default-tag" v-if="item.isDefault">
								<text class="tag-text">默认</text>
							</view>
						</view>
						<view class="edit-btn" @click="editAddress(item, index)">
							<view class="edit-icon"></view>
						</view>
					</view>
					<text class="address-detail">{{ item.detail }}</text>
					<view class="card-bottom" v-if="!item.isDefault">
						<text class="default-label">设为默认地址</text>
						<view class="switch" @click="toggleDefault(index)">
							<view class="switch-thumb"></view>
						</view>
					</view>
				</view>
			</view>
			<view class="list-bottom-space"></view>
		</scroll-view>

		<view class="bottom-btn">
			<view class="add-btn" @click="openModal">
				<text class="add-btn-text">+ 新增收货地址</text>
			</view>
		</view>

		<view class="modal-overlay" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ isEditing ? '编辑地址' : '新增地址' }}</text>
					<view class="close-btn" @click="closeModal">
						<view class="close-icon"></view>
					</view>
				</view>
				<view class="modal-body">
					<view class="form-item">
						<input class="form-input" v-model="form.name" placeholder="收货人姓名" placeholder-class="placeholder" />
					</view>
					<view class="form-item">
						<input class="form-input" v-model="form.phone" type="number" placeholder="手机号" placeholder-class="placeholder" />
					</view>
					<view class="form-group">
						<text class="form-label">地址标签</text>
						<view class="tag-options">
							<view
								class="tag-option"
								v-for="t in tagOptions"
								:key="t.value"
								:class="{ active: form.tag === t.value }"
								@click="form.tag = t.value"
							>
								<text class="tag-option-text">{{ t.label }}</text>
							</view>
						</view>
					</view>
					<view class="form-item">
						<textarea class="form-textarea" v-model="form.detail" placeholder="详细地址" placeholder-class="placeholder" />
					</view>
					<view class="form-row">
						<text class="form-label">设为默认地址</text>
						<view class="switch" :class="{ active: form.isDefault }" @click="toggleFormDefault">
							<view class="switch-thumb"></view>
						</view>
					</view>
					<view class="save-btn" @click="saveAddress">
						<text class="save-btn-text">保存</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { initService } from '@/services/init.js'

	export default {
		data() {
			const user = initService.getUser()
			const savedAddresses = uni.getStorageSync('address_list')
			let addressList = []
			if (savedAddresses && savedAddresses.length > 0) {
				addressList = savedAddresses
			} else {
				addressList = [
					{
						name: user.nickname || '邻寝帮用户',
						phone: user.phone || '138****8888',
						tag: 'dorm',
						detail: user.school + ' 宿舍区',
						isDefault: true
					}
				]
			}
			return {
				addressList: addressList,
				currentUser: user,
				showModal: false,
				isEditing: false,
				editingIndex: -1,
				tagOptions: [
					{ value: 'dorm', label: '宿舍' },
					{ value: 'teaching', label: '教学楼' },
					{ value: 'express', label: '快递点' },
					{ value: 'other', label: '其他' }
				],
				form: {
					name: user.nickname || '',
					phone: user.phone || '',
					tag: 'dorm',
					detail: '',
					isDefault: false
				}
			}
		},
		methods: {
			saveAddresses() {
				uni.setStorageSync('address_list', this.addressList)
				const defaultAddr = this.addressList.find(a => a.isDefault)
				if (defaultAddr) {
					uni.setStorageSync('default_address', defaultAddr)
				}
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({ url: '/pages/index/index' })
					}
				})
			},
			getTagClass(tag) {
				return 'tag-' + tag
			},
			getTagIcon(tag) {
				const icons = {
					dorm: '🏠',
					teaching: '📚',
					express: '📦',
					other: '📍'
				}
				return icons[tag] || '📍'
			},
			getTagLabel(tag) {
				const labels = {
					dorm: '宿舍',
					teaching: '教学楼',
					express: '快递点',
					other: '其他'
				}
				return labels[tag] || '其他'
			},
			toggleDefault(index) {
				this.addressList.forEach((item, i) => {
					item.isDefault = (i === index)
				})
				this.saveAddresses()
				uni.showToast({ title: '已设为默认', icon: 'none' })
			},
			toggleFormDefault() {
				this.form.isDefault = !this.form.isDefault
			},
			openModal() {
				this.isEditing = false
				this.editingIndex = -1
				const user = initService.getUser()
				this.form = {
					name: user.nickname || '',
					phone: user.phone || '',
					tag: 'dorm',
					detail: '',
					isDefault: false
				}
				this.showModal = true
			},
			editAddress(item, index) {
				this.isEditing = true
				this.editingIndex = index
				this.form = {
					name: item.name,
					phone: item.phone,
					tag: item.tag,
					detail: item.detail,
					isDefault: item.isDefault
				}
				this.showModal = true
			},
			closeModal() {
				this.showModal = false
			},
			saveAddress() {
				if (!this.form.name) {
					uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
					return
				}
				if (!this.form.phone) {
					uni.showToast({ title: '请输入手机号', icon: 'none' })
					return
				}
				if (!this.form.detail) {
					uni.showToast({ title: '请输入详细地址', icon: 'none' })
					return
				}
				if (this.isEditing) {
					this.addressList[this.editingIndex] = {
						...this.form
					}
					if (this.form.isDefault) {
						this.addressList.forEach((item, i) => {
							if (i !== this.editingIndex) item.isDefault = false
						})
					}
					this.saveAddresses()
					uni.showToast({ title: '修改成功', icon: 'none' })
				} else {
					if (this.form.isDefault) {
						this.addressList.forEach(item => { item.isDefault = false })
					}
					this.addressList.push({ ...this.form })
					this.saveAddresses()
					uni.showToast({ title: '添加成功', icon: 'none' })
				}
				this.closeModal()
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
		padding: 80rpx 28rpx 32rpx;
		display: flex;
		align-items: center;
		position: relative;
		flex-shrink: 0;
	}

	.back-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		left: 28rpx;
		top: 80rpx;
	}

	.back-icon {
		width: 20rpx;
		height: 20rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
		transform: rotate(45deg);
	}

	.header-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #FFFFFF;
		text-align: center;
		flex: 1;
	}

	.content-area {
		flex: 1;
		padding: 28rpx;
	}

	.address-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.address-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.user-info-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12rpx;
		flex: 1;
	}

	.user-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.user-phone {
		font-size: 26rpx;
		color: #6B7280;
	}

	.tag {
		display: flex;
		align-items: center;
		padding: 6rpx 12rpx;
		border-radius: 8rpx;

		&.tag-dorm, &.tag-teaching, &.tag-express, &.tag-other {
			background-color: #EFF6FF;
		}

		.tag-icon {
			font-size: 20rpx;
			margin-right: 4rpx;
		}

		.tag-text {
			font-size: 20rpx;
			color: #4A90D9;
		}
	}

	.default-tag {
		background-color: #F0FDF4 !important;

		.tag-text {
			color: #16A34A !important;
		}
	}

	.edit-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.edit-icon {
		width: 28rpx;
		height: 28rpx;
		border: 3rpx solid #9CA3AF;
		border-radius: 4rpx;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			bottom: -8rpx;
			right: -4rpx;
			width: 16rpx;
			height: 6rpx;
			background: #9CA3AF;
			transform: rotate(45deg);
			border-radius: 0 0 2rpx 2rpx;
		}
	}

	.address-detail {
		font-size: 26rpx;
		color: #4B5563;
		line-height: 1.6;
	}

	.card-bottom {
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #F9FAFB;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.default-label {
		font-size: 22rpx;
		color: #9CA3AF;
	}

	.switch {
		width: 72rpx;
		height: 40rpx;
		background-color: #E5E7EB;
		border-radius: 40rpx;
		margin-left: 16rpx;
		position: relative;
		transition: background-color 0.2s;

		&.active {
			background-color: #4A90D9;
		}
	}

	.switch-thumb {
		width: 32rpx;
		height: 32rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
		position: absolute;
		top: 4rpx;
		left: 4rpx;
		transition: transform 0.2s;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
	}

	.switch.active .switch-thumb {
		transform: translateX(32rpx);
	}

	.list-bottom-space {
		height: 200rpx;
	}

	.bottom-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24rpx 28rpx 40rpx;
		background-color: #F5F8FA;
	}

	.add-btn {
		width: 100%;
		background-color: #4A90D9;
		padding: 28rpx 0;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 217, 0.3);

		&:active {
			opacity: 0.9;
		}
	}

	.add-btn-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #FFFFFF;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 100;
	}

	.modal-content {
		width: 100%;
		background-color: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		padding: 48rpx 40rpx 60rpx;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1F2937;
	}

	.close-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-icon {
		width: 24rpx;
		height: 24rpx;
		position: relative;

		&::before, &::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 4rpx;
			background-color: #9CA3AF;
			border-radius: 2rpx;
		}

		&::before { transform: translateY(-50%) rotate(45deg); }
		&::after { transform: translateY(-50%) rotate(-45deg); }
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}

	.form-item {
		background-color: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx 28rpx;
	}

	.form-input {
		width: 100%;
		font-size: 28rpx;
		color: #1F2937;
		background: transparent;
	}

	.form-textarea {
		width: 100%;
		font-size: 28rpx;
		color: #1F2937;
		background: transparent;
		height: 160rpx;
		line-height: 1.5;
	}

	.placeholder {
		color: #9CA3AF;
		font-size: 28rpx;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.form-label {
		font-size: 24rpx;
		color: #9CA3AF;
	}

	.tag-options {
		display: flex;
		gap: 16rpx;
	}

	.tag-option {
		flex: 1;
		padding: 20rpx 0;
		border-radius: 16rpx;
		background-color: #F9FAFB;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;

		&.active {
			background-color: #4A90D9;

			.tag-option-text {
				color: #FFFFFF;
			}
		}
	}

	.tag-option-text {
		font-size: 24rpx;
		color: #4B5563;
	}

	.form-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.save-btn {
		width: 100%;
		background-color: #4A90D9;
		padding: 28rpx 0;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 16rpx;

		&:active {
			opacity: 0.9;
		}
	}

	.save-btn-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #FFFFFF;
	}
</style>
