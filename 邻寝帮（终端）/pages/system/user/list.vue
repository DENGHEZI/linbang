<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="搜索昵称/手机号/学校..." />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="primary" size="mini" @click="loadDataFromCloud" :disabled="loading">
          {{ loading ? '同步中...' : '🔄 从云端刷新' }}
        </button>
        <button class="uni-button" type="default" size="mini" @click="loadLocalData" :disabled="loading">
          本地数据
        </button>
        <button class="uni-button" type="warn" size="mini" @click="initMockData" :disabled="mockLoaded">
          {{ mockLoaded ? '模拟数据已加载' : '加载模拟数据' }}
        </button>
        <view class="cloud-status" :class="cloudAvailable ? 'status-online' : 'status-offline'">
          <text class="status-dot"></text>
          <text class="status-text">{{ cloudAvailable ? '云端已连接' : '云端未连接' }}</text>
        </view>
        <view class="data-source" :class="usingCloud ? 'source-cloud' : 'source-local'">
          <text class="source-icon">{{ usingCloud ? '☁️' : '💾' }}</text>
          <text class="source-text">{{ usingCloud ? '云端数据' : '本地数据' }}</text>
        </view>
      </view>
    </view>
    <view class="uni-container">
      <view v-if="!cloudAvailable && !mockLoaded" class="cloud-tip">
        <text class="tip-title">⚠️ 云端未连接</text>
        <text class="tip-desc">当前使用本地模式。在HBuilderX中部署云函数后可切换为云端模式。</text>
      </view>

      <view class="cloud-mode">
        <view class="uni-load-more" v-if="loading">
          <text class="uni-load-more__text">加载用户数据中...</text>
        </view>

        <view v-else-if="errorMsg" class="error-box">
          <text class="error-icon">❌</text>
          <text class="error-text">{{ errorMsg }}</text>
          <button class="uni-button" size="mini" type="primary" @click="loadDataFromCloud">重试</button>
        </view>

        <uni-table
          v-else
          ref="table"
          :loading="loading"
          :emptyText="total === 0 ? '暂无用户数据，请先加载模拟数据或在客户端注册' : '暂无数据'"
          border
          stripe
          type="selection"
          @selection-change="selectionChange"
          class="table-pc"
        >
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'nickname')" sortable @sort-change="sortChange($event, 'nickname')">昵称</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'phone')" sortable @sort-change="sortChange($event, 'phone')">手机号</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'school')" sortable @sort-change="sortChange($event, 'school')">学校</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'student_id')">学号</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="roleData" @filter-change="filterChange($event, 'role')">角色</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="verifyData" @filter-change="filterChange($event, 'verified')">认证状态</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'balance')">余额</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'order_count')">订单数</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'rating')">评分</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'created_at')" sortable @sort-change="sortChange($event, 'created_at')">注册时间</uni-th>
            <uni-th align="center" :width="buttonThWidth">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in dataList" :key="item._id || index">
            <uni-td align="center">{{ item.nickname || '-' }}</uni-td>
            <uni-td align="center">{{ item.phone || '-' }}</uni-td>
            <uni-td align="center">{{ item.school || '-' }}</uni-td>
            <uni-td align="center">{{ item.student_id || '-' }}</uni-td>
            <uni-td align="center">
              <text :class="'role-badge role-' + item.role">{{ getRole(item.role) }}</text>
            </uni-td>
            <uni-td align="center">
              <text :class="'verify-badge ' + (item.verified ? 'verified' : 'unverified')">
                {{ item.verified ? '✓ 已认证' : '待认证' }}
              </text>
            </uni-td>
            <uni-td align="center">¥{{ item.balance || 0 }}</uni-td>
            <uni-td align="center">{{ item.order_count || 0 }}</uni-td>
            <uni-td align="center">{{ item.rating || 5.0 }}</uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.created_at"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="viewDetail(item)" class="uni-button" size="mini" type="primary">查看</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>

        <view class="uni-pagination-box" v-if="total > 0">
          <uni-pagination
            show-icon
            show-page-size
            :page-size="pageSize"
            v-model="pageCurrent"
            :total="total"
            @change="onPageChanged"
            @pageSizeChange="pageSizeChange"
          />
        </view>
      </view>
    </view>
    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>

<script>
  import sharedData from '@/utils/shared-data.js';
  import bridgeClient from '@/utils/bridge-client.js';

  const roleEnum = {
    user: '用户',
    rider: '骑手',
    admin: '管理员',
  };

  export default {
    data() {
      return {
        query: '',
        selectedIndexs: [],
        buttonThWidth: 180,
        roleData: [
          { text: '用户', value: 'user' },
          { text: '骑手', value: 'rider' },
          { text: '管理员', value: 'admin' },
        ],
        verifyData: [
          { text: '已认证', value: true },
          { text: '待认证', value: false },
        ],
        cloudAvailable: false,
        usingCloud: false,
        loading: false,
        errorMsg: '',
        dataList: [],
        total: 0,
        pageSize: 20,
        pageCurrent: 1,
        filters: {},
        sortField: '',
        sortOrder: '',
        mockLoaded: false,
      };
    },
    async onLoad() {
      await this.checkCloudAvailability();
    },
    onReady() {
      this.initMockData();
      this.loadDataFromCloud();
    },
    methods: {
      async checkCloudAvailability() {
        try {
          const result = await uniCloud.callFunction({
            name: 'userProxy',
            data: { action: 'ping' }
          });
          if (result && result.result && result.result.errCode === 0) {
            this.cloudAvailable = true;
            return;
          }
        } catch (e) {
          console.warn('[用户管理] 云函数不可用:', e.message);
        }
        this.cloudAvailable = false;
      },
      async initMockData() {
        if (this.mockLoaded) return;
        const users = sharedData.getUsers();
        if (users.length === 0) {
          sharedData.generateMockData();
        }
        this.mockLoaded = true;
      },
      async loadDataFromCloud() {
        this.loading = true;
        this.errorMsg = '';
        try {
          const params = {
            page: this.pageCurrent,
            pageSize: this.pageSize,
          };
          
          if (this.filters.role) params.role = this.filters.role;
          if (this.query) params.keyword = this.query;

          if (this.sortField) {
            params.orderBy = this.sortField;
            params.orderType = this.sortOrder;
          }

          if (this.cloudAvailable) {
            const result = await uniCloud.callFunction({
              name: 'userProxy',
              data: {
                action: 'listUsers',
                args: [params]
              }
            });

            if (result && result.result && result.result.errCode === 0) {
              this.dataList = result.result.data.list || [];
              this.total = result.result.data.total || 0;
              this.cloudAvailable = true;
              this.usingCloud = true;
              return;
            }
          }

          const bridgeResult = await bridgeClient.getUsers(params);
          if (bridgeResult && Array.isArray(bridgeResult)) {
            this.dataList = bridgeResult;
            this.total = bridgeResult.length;
            this.usingCloud = true;
            this.cloudAvailable = false;
            return;
          } else if (bridgeResult && bridgeResult.list) {
            this.dataList = bridgeResult.list;
            this.total = bridgeResult.total || 0;
            this.usingCloud = true;
            this.cloudAvailable = false;
            return;
          }
          
          this.loadLocalData();
        } catch (e) {
          console.warn('[用户管理] 云端调用失败，尝试桥接服务器:', e.message);
          this.loadLocalData();
        } finally {
          this.loading = false;
        }
      },
      loadLocalData() {
        this.usingCloud = false;
        if (!this.mockLoaded) {
          this.initMockData();
        }
        const filter = {};
        if (this.filters.role) filter.role = this.filters.role;
        if (this.query) filter.keyword = this.query;
        if (this.sortField) filter.orderBy = this.sortField;
        if (this.sortOrder) filter.orderType = this.sortOrder;
        filter.page = this.pageCurrent;
        filter.pageSize = this.pageSize;
        
        const allData = sharedData.getUsers({ ...filter, page: undefined, pageSize: undefined });
        this.total = allData.length;
        this.dataList = sharedData.getUsers(filter);
        this.errorMsg = '';
      },
      search() {
        this.pageCurrent = 1;
        if (this.cloudAvailable && this.usingCloud) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      async onPageChanged(e) {
        this.pageCurrent = e.current;
        if (this.cloudAvailable && this.usingCloud) {
          await this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      pageSizeChange(newSize) {
        this.pageSize = newSize;
        this.pageCurrent = 1;
        if (this.cloudAvailable && this.usingCloud) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      selectionChange(e) {
        this.selectedIndexs = e.detail.index;
      },
      async confirmDelete(id) {
        uni.showModal({
          title: '确认删除',
          content: '是否删除该用户？此操作不可恢复',
          success: async (res) => {
            if (res.confirm) {
              try {
                if (this.cloudAvailable && this.usingCloud) {
                  await uniCloud.callFunction({
                    name: 'userProxy',
                    data: { action: 'deleteUser', args: [id] }
                  });
                }
                sharedData.deleteUser(id);
                if (this.cloudAvailable && this.usingCloud) {
                  this.loadDataFromCloud();
                } else {
                  this.loadLocalData();
                }
                uni.showToast({ title: '删除成功', icon: 'success' });
              } catch (e) {
                uni.showToast({ title: '删除失败', icon: 'error' });
              }
            }
          },
        });
      },
      viewDetail(item) {
        uni.showModal({
          title: '用户详情',
          content: `昵称：${item.nickname || '-'}\n手机：${item.phone || '-'}\n学校：${item.school || '-'}\n学号：${item.student_id || '-'}\n角色：${this.getRole(item.role)}\n余额：¥${item.balance || 0}\n订单数：${item.order_count || 0}\n评分：${item.rating || 5.0}`,
          showCancel: false,
        });
      },
      sortChange(e, name) {
        if (e.order) {
          this.sortField = name;
          this.sortOrder = e.order === 'ascending' ? 'asc' : 'desc';
        } else {
          this.sortField = '';
          this.sortOrder = '';
        }
        if (this.cloudAvailable && this.usingCloud) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      filterChange(e, name) {
        if (e.filterType === 'search') {
          this.filters[name] = e.filter;
        } else if (e.filterType === 'select') {
          this.filters[name] = e.filter;
        } else if (e.filterType === 'timestamp') {
          this.filters[name] = e.filter;
        }
        this.pageCurrent = 1;
        if (this.cloudAvailable && this.usingCloud) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      getRole(role) {
        return roleEnum[role] || '用户';
      },
    },
  };
</script>

<style>
  .role-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 12px;
  }
  .role-user { background: #e6f7ff; color: #096dd9; }
  .role-rider { background: #f6ffed; color: #389e0d; }
  .role-admin { background: #f9f0ff; color: #531dab; }

  .verify-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 12px;
  }
  .verify-badge.verified { background: #f6ffed; color: #389e0d; }
  .verify-badge.unverified { background: #fff1f0; color: #cf1322; }

  .cloud-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
  }
  .status-online { background: #f6ffed; color: #389e0d; }
  .status-offline { background: #fff1f0; color: #cf1322; }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .data-source {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  .source-cloud { background: #e6f7ff; color: #096dd9; }
  .source-local { background: #fffbe6; color: #d48806; }

  .cloud-tip {
    margin-bottom: 20px;
    padding: 16px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cloud-tip .tip-title {
    color: #d48806;
    font-size: 14px;
    font-weight: 600;
  }
  .cloud-tip .tip-desc {
    color: #595959;
    font-size: 13px;
  }

  .error-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 12px;
  }
  .error-icon {
    font-size: 48px;
  }
  .error-text {
    color: #cf1322;
    font-size: 14px;
  }
</style>
