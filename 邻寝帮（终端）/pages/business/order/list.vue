<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="搜索订单编号/用户/标题..." />
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
        <button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
      </view>
    </view>
    <view class="uni-container">
      <view v-if="!cloudAvailable && !mockLoaded" class="cloud-tip">
        <text class="tip-title">⚠️ 云端未连接</text>
        <text class="tip-desc">当前使用本地模式。在HBuilderX中部署云函数后可切换为云端模式：</text>
        <text class="tip-step">1. 右键 <text class="tip-code">uniCloud-aliyun</text> → 关联云服务空间</text>
        <text class="tip-step">2. 右键 <text class="tip-code">cloudfunctions</text> → 上传部署</text>
        <text class="tip-step">3. 右键 <text class="tip-code">database</text> → 上传所有DB Schema</text>
      </view>

      <view class="cloud-mode">
        <view class="uni-load-more" v-if="loading">
          <text class="uni-load-more__text">加载数据中...</text>
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
          :emptyText="total === 0 ? '暂无订单数据，请先加载模拟数据或在客户端下单' : '暂无数据'"
          border
          stripe
          type="selection"
          @selection-change="selectionChange"
          class="table-pc"
        >
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'orderNo')" sortable @sort-change="sortChange($event, 'orderNo')">订单编号</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'user_name')" sortable @sort-change="sortChange($event, 'user_name')">用户</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'rider_name')" sortable @sort-change="sortChange($event, 'rider_name')">骑手</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="categoryData" @filter-change="filterChange($event, 'category')" sortable @sort-change="sortChange($event, 'category')">分类</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')" sortable @sort-change="sortChange($event, 'title')">标题</uni-th>
            <uni-th align="center">取货地址</uni-th>
            <uni-th align="center">送货地址</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'price')">价格</uni-th>
            <uni-th align="center" filter-type="select" :filter-data="statusData" @filter-change="filterChange($event, 'status')" sortable @sort-change="sortChange($event, 'status')">状态</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'created_at')" sortable @sort-change="sortChange($event, 'created_at')">创建时间</uni-th>
            <uni-th align="center" :width="buttonThWidth">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in dataList" :key="item._id || index">
            <uni-td align="center">{{ item.orderNo }}</uni-td>
            <uni-td align="center">{{ item.user_name || '-' }}</uni-td>
            <uni-td align="center">{{ item.rider_name || '-' }}</uni-td>
            <uni-td align="center">{{ getCategory(item.category) }}</uni-td>
            <uni-td align="center">{{ item.title }}</uni-td>
            <uni-td align="left"><text>{{ item.pickupAddress }}</text></uni-td>
            <uni-td align="left"><text>{{ item.deliveryAddress }}</text></uni-td>
            <uni-td align="center">¥{{ item.price }}</uni-td>
            <uni-td align="center">
              <text :class="'status-badge status-' + item.status">{{ getStatus(item.status) }}</text>
            </uni-td>
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
  import sharedData from '@/utils/shared-data.js'
  import bridgeClient from '@/utils/bridge-client.js'

  const categoryEnum = {
    delivery: '快递代取',
    food: '餐饮外送',
    print: '打印代办',
    errand: '跑腿代办',
    other: '其他服务',
  };

  const statusEnum = {
    pending_payment: '待支付',
    pending: '待接单',
    accepted: '已接单',
    picking: '取货中',
    delivering: '配送中',
    delivered: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
  };

  export default {
    data() {
      return {
        query: '',
        selectedIndexs: [],
        options: {
          pageSize: 20,
          pageCurrent: 1,
          filterData: {},
        },
        buttonThWidth: 180,
        categoryData: [
          { text: '快递代取', value: 'delivery' },
          { text: '餐饮外送', value: 'food' },
          { text: '打印代办', value: 'print' },
          { text: '跑腿代办', value: 'errand' },
          { text: '其他服务', value: 'other' },
        ],
        statusData: [
          { text: '待支付', value: 'pending_payment' },
          { text: '待接单', value: 'pending' },
          { text: '已接单', value: 'accepted' },
          { text: '取货中', value: 'picking' },
          { text: '配送中', value: 'delivering' },
          { text: '待收货', value: 'delivered' },
          { text: '已完成', value: 'completed' },
          { text: '已取消', value: 'cancelled' },
          { text: '退款中', value: 'refunding' },
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
      this._filter = {};
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
            name: 'orderProxy',
            data: { action: 'ping' }
          });
          if (result && result.result && result.result.errCode === 0) {
            this.cloudAvailable = true;
            return;
          }
        } catch (e) {
          console.warn('[订单管理] 云函数不可用:', e.message);
        }
        this.cloudAvailable = false;
      },
      async initMockData() {
        if (this.mockLoaded) return;
        const orders = sharedData.getOrders();
        if (orders.length === 0) {
          sharedData.generateMockData();
          this.mockLoaded = true;
          uni.showToast({ title: '已加载模拟数据', icon: 'success' });
        } else {
          this.mockLoaded = true;
        }
      },
      async loadDataFromCloud() {
        this.loading = true;
        this.errorMsg = '';
        try {
          const params = {
            page: this.pageCurrent,
            pageSize: this.pageSize,
          };
          
          if (this.filters.status) params.status = this.filters.status;
          if (this.filters.category) params.category = this.filters.category;
          if (this.filters.orderNo) params.keyword = this.filters.orderNo;
          if (this.filters.user_name) params.keyword = this.filters.user_name;
          if (this.filters.rider_name) params.keyword = this.filters.rider_name;
          if (this.filters.title) params.keyword = this.filters.title;
          
          if (this.query) {
            params.keyword = this.query;
          }

          if (this.sortField) {
            params.orderBy = this.sortField;
            params.orderType = this.sortOrder;
          }

          if (this.cloudAvailable) {
            const result = await uniCloud.callFunction({
              name: 'orderProxy',
              data: {
                action: 'list',
                args: [params]
              }
            });

            if (result && result.result && result.result.errCode === 0) {
              this.dataList = result.result.data.list || [];
              this.total = result.result.data.total || 0;
              this.cloudAvailable = true;
              this.usingCloud = true;
              return;
            } else {
              console.warn('[订单管理] 云端返回异常:', result?.result?.errMsg);
            }
          }

          const bridgeResult = await bridgeClient.getOrders(params);
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
          console.warn('[订单管理] 云端调用失败，尝试桥接服务器:', e.message);
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
        if (this.filters.status) filter.status = this.filters.status;
        if (this.filters.category) filter.category = this.filters.category;
        if (this.query) filter.keyword = this.query;
        if (this.sortField) filter.orderBy = this.sortField;
        if (this.sortOrder) filter.orderType = this.sortOrder;
        filter.page = this.pageCurrent;
        filter.pageSize = this.pageSize;
        
        const allData = sharedData.getOrders({ ...filter, page: undefined, pageSize: undefined });
        this.total = allData.length;
        this.dataList = sharedData.getOrders(filter);
        this.errorMsg = '';
      },
      search() {
        this.pageCurrent = 1;
        if (this.cloudAvailable) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      async onPageChanged(e) {
        this.pageCurrent = e.current;
        if (this.cloudAvailable) {
          await this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      pageSizeChange(newSize) {
        this.pageSize = newSize;
        this.pageCurrent = 1;
        if (this.cloudAvailable) {
          this.loadDataFromCloud();
        } else {
          this.loadLocalData();
        }
      },
      selectionChange(e) {
        this.selectedIndexs = e.detail.index;
      },
      async delTable() {
        const ids = this.selectedIndexs.map((i) => this.dataList[i] && this.dataList[i]._id);
        try {
          for (const id of ids) {
            if (id) {
              if (this.cloudAvailable && this.usingCloud) {
                await uniCloud.callFunction({
                  name: 'orderProxy',
                  data: { action: 'delete', args: [id] }
                });
              }
              sharedData.deleteOrder(id);
            }
          }
          this.selectedIndexs = [];
          if (this.cloudAvailable && this.usingCloud) {
            this.loadDataFromCloud();
          } else {
            this.loadLocalData();
          }
          uni.showToast({ title: '删除成功', icon: 'success' });
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'error' });
        }
      },
      async confirmDelete(id) {
        uni.showModal({
          title: '确认删除',
          content: '是否删除该订单？此操作不可恢复',
          success: async (res) => {
            if (res.confirm) {
              try {
                if (this.cloudAvailable && this.usingCloud) {
                  await uniCloud.callFunction({
                    name: 'orderProxy',
                    data: { action: 'delete', args: [id] }
                  });
                }
                sharedData.deleteOrder(id);
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
        const statusText = this.getStatus(item.status);
        uni.showModal({
          title: '订单详情',
          content: `订单号：${item.orderNo}\n状态：${statusText}\n价格：¥${item.price}\n用户：${item.user_name || '-'}\n骑手：${item.rider_name || '-'}\n分类：${this.getCategory(item.category)}\n创建时间：${this.formatTime(item.created_at)}`,
          showCancel: false,
        });
      },
      formatTime(timestamp) {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
      getCategory(category) {
        return categoryEnum[category] || '未知';
      },
      getStatus(status) {
        return statusEnum[status] || '未知';
      },
    },
  };
</script>

<style>
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  .status-pending_payment { background: #fff7e6; color: #d46b08; }
  .status-pending { background: #fff1b8; color: #d48806; }
  .status-accepted { background: #e6f7ff; color: #096dd9; }
  .status-picking { background: #f9f0ff; color: #531dab; }
  .status-delivering { background: #e6fffb; color: #08979c; }
  .status-delivered { background: #f0f5ff; color: #1d39c4; }
  .status-completed { background: #f6ffed; color: #389e0d; }
  .status-cancelled { background: #f5f5f5; color: #595959; }
  .status-refunding { background: #fff1f0; color: #cf1322; }

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
    padding: 20px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cloud-tip .tip-title {
    color: #d48806;
    font-size: 15px;
    font-weight: 600;
  }
  .cloud-tip .tip-desc {
    color: #595959;
    font-size: 13px;
  }
  .cloud-tip .tip-step {
    color: #595959;
    font-size: 13px;
    padding-left: 8px;
  }
  .cloud-tip .tip-code {
    background: #f5f5f5;
    padding: 1px 6px;
    border-radius: 3px;
    font-family: monospace;
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
