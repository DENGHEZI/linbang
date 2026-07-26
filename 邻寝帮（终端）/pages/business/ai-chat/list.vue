<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udb"
        collection="ai-chat"
        field="user_id,session_id,order_id,message_count,status,created_at,updated_at"
        :where="where"
        page-data="replace"
        :orderby="orderby"
        :getcount="true"
        :page-size="options.pageSize"
        :page-current="options.pageCurrent"
        v-slot:default="{ data, pagination, loading, error, options }"
        :options="options"
        loadtime="manual"
        @load="onqueryload"
      >
        <uni-table
          ref="table"
          :loading="loading"
          :emptyText="error.message || '暂无数据'"
          border
          stripe
          type="selection"
          @selection-change="selectionChange"
          class="table-pc"
        >
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'user_id')" sortable @sort-change="sortChange($event, 'user_id')">用户ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'session_id')" sortable @sort-change="sortChange($event, 'session_id')">会话ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'order_id')" sortable @sort-change="sortChange($event, 'order_id')">关联订单</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'message_count')">消息数</uni-th>
            <uni-th
              align="center"
              filter-type="select"
              :filter-data="statusData"
              @filter-change="filterChange($event, 'status')"
              sortable
              @sort-change="sortChange($event, 'status')"
              >状态</uni-th
            >
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'created_at')" sortable @sort-change="sortChange($event, 'created_at')"
              >创建时间</uni-th
            >
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'updated_at')" sortable @sort-change="sortChange($event, 'updated_at')"
              >更新时间</uni-th
            >
            <uni-th align="center" :width="buttonThWidth">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ item.user_id }}</uni-td>
            <uni-td align="center">{{ item.session_id }}</uni-td>
            <uni-td align="center">{{ item.order_id || '-' }}</uni-td>
            <uni-td align="center">{{ item.message_count }}</uni-td>
            <uni-td align="center">
              <text :class="'status-' + item.status">{{ getStatus(item.status) }}</text>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.created_at"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.updated_at"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="viewDetail(item._id)" class="uni-button" size="mini" type="primary">查看</button>
                <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>

        <view class="uni-pagination-box">
          <uni-pagination
            show-icon
            show-page-size
            :page-size="pagination.size"
            v-model="pagination.current"
            :total="pagination.count"
            @change="onPageChanged"
            @pageSizeChange="pageSizeChange"
          />
        </view>
      </unicloud-db>
    </view>

    <!-- #ifndef H5 -->
    <fix-window />
    <!-- #endif -->
  </view>
</template>
<script>
  const db = uniCloud.database();
  const dbOrderBy = 'created_at desc';
  const dbSearchFields = ['user_id', 'session_id', 'order_id'];
  const pageSize = 20;
  const pageCurrent = 1;

  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
  };

  const statusEnum = {
    active: '进行中',
    resolved: '已解决',
    transferred: '已转人工',
  };

  export default {
    data() {
      return {
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: '',
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {},
        },
        buttonThWidth: 180,
        statusData: [
          { text: '进行中', value: 'active' },
          { text: '已解决', value: 'resolved' },
          { text: '已转人工', value: 'transferred' },
        ],
        _filter: {},
      };
    },
    onLoad() {
      this._filter = {};
    },
    onReady() {
      this.$refs.udb.loadData();
    },
    methods: {
      pageSizeChange(pageSize) {
        this.options.pageSize = pageSize;
        this.options.pageCurrent = 1;
        this.$nextTick(() => {
          this.loadData();
        });
      },
      onqueryload(data) {},
      getWhere() {
        const query = this.query.trim();
        if (!query) {
          return '';
        }
        const queryRe = new RegExp(query, 'i');
        return dbSearchFields.map((name) => queryRe + '.test(' + name + ')').join(' || ');
      },
      search() {
        const newWhere = this.getWhere();
        this.where = newWhere;
        this.loadData();
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear,
        });
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0;
        this.$refs.table.clearSelection();
        this.$refs.udb.loadData({
          current: e.current,
        });
      },
      selectedItems() {
        let dataList = this.$refs.udb.dataList;
        return this.selectedIndexs.map((i) => dataList[i]._id);
      },
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success: (res) => {
            this.$refs.table.clearSelection();
          },
        });
      },
      selectionChange(e) {
        this.selectedIndexs = e.detail.index;
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          confirmContent: '是否删除该对话记录',
          success: (res) => {
            this.$refs.table.clearSelection();
          },
        });
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order];
        } else {
          this.orderby = '';
        }
        this.$refs.table.clearSelection();
        this.$nextTick(() => {
          this.$refs.udb.loadData();
        });
      },
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter,
        };
        let newWhere = this.filterToWhere(this._filter, db.command);
        if (Object.keys(newWhere).length) {
          this.where = newWhere;
        } else {
          this.where = '';
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData();
        });
      },
      filterToWhere(filter, command) {
        let where = {};
        for (let key in filter) {
          let item = filter[key];
          if (!item.value) {
            continue;
          }
          if (item.type === 'search') {
            where[key] = new RegExp(item.value, 'i');
          } else if (item.type === 'select') {
            where[key] = item.value;
          } else if (item.type === 'timestamp') {
            if (item.value && item.value.length === 2) {
              where[key] = command.gte(item.value[0]).and(command.lte(item.value[1]));
            }
          }
        }
        return where;
      },
      viewDetail(id) {
        uni.showModal({
          title: '对话详情',
          content: '查看对话记录ID：' + id,
          showCancel: false,
        });
      },
      getStatus(status) {
        return statusEnum[status] || '未知';
      },
    },
  };
</script>

<style>
  .status-active {
    color: #1890ff;
  }
  .status-resolved {
    color: #52c41a;
  }
  .status-transferred {
    color: #ff9900;
  }
</style>
