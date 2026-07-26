<template>
  <view class="fix-top-window">
    <view class="uni-header">
      <uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button hide-on-phone" type="default" size="mini" @click="search">搜索</button>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db
        ref="udb"
        collection="rider-income"
        field="rider_id,order_id,amount,created_at"
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
          class="table-pc"
        >
          <uni-tr>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'rider_id')" sortable @sort-change="sortChange($event, 'rider_id')">骑手ID</uni-th>
            <uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'order_id')" sortable @sort-change="sortChange($event, 'order_id')">关联订单</uni-th>
            <uni-th align="center" sortable @sort-change="sortChange($event, 'amount')">收入金额</uni-th>
            <uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'created_at')" sortable @sort-change="sortChange($event, 'created_at')"
              >创建时间</uni-th
            >
            <uni-th align="center" :width="buttonThWidth">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item, index) in data" :key="index">
            <uni-td align="center">{{ item.rider_id }}</uni-td>
            <uni-td align="center">{{ item.order_id }}</uni-td>
            <uni-td align="center">¥{{ item.amount }}</uni-td>
            <uni-td align="center">
              <uni-dateformat :threshold="[0, 0]" :date="item.created_at"></uni-dateformat>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="viewDetail(item._id)" class="uni-button" size="mini" type="primary">查看</button>
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
  const dbSearchFields = ['rider_id', 'order_id'];
  const pageSize = 20;
  const pageCurrent = 1;

  const orderByMapping = {
    ascending: 'asc',
    descending: 'desc',
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
        buttonThWidth: 100,
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
        this.$refs.udb.loadData({
          current: e.current,
        });
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order];
        } else {
          this.orderby = '';
        }
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
          title: '收入详情',
          content: '查看收入记录ID：' + id,
          showCancel: false,
        });
      },
    },
  };
</script>

<style></style>
