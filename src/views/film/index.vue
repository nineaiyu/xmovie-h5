<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { getFilmDataApi, getFilterApi } from "@/api/movie/film";

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const refreshDisable = ref(false);
const queryParams = reactive({
  ordering: "-created_time",
  name: "",
  page: 1,
  size: 10
});

const FilmResult = ref([]);

const getData = () => {
  getFilmDataApi(queryParams).then(({ code, data }) => {
    if (code === 1000) {
      if (refreshing.value) {
        FilmResult.value = [];
        refreshing.value = false;
      }
      FilmResult.value = [...FilmResult.value, ...data.results];
      finished.value = data.total === FilmResult.value.length;
    }
    loading.value = false;
  });
};

interface Category {
  key: string;
  result: {
    label: string;
    value: string;
  }[];
}

const CategoryResult = ref<Category[]>([]);

const getFilter = () => {
  getFilterApi({}).then(res => {
    if (res.code === 1000) {
      CategoryResult.value = res.category;
      CategoryResult.value.forEach(item => {
        queryParams[item.key] = "";
      });
      nextTick(() => {
        getData();
      });
    }
  });
};

const onLoad = () => {
  // 异步更新数据
  if (refreshing.value) {
    queryParams.name = "";
    queryParams.page = 1;
  } else {
    queryParams.page += 1;
  }
  getData();
};

onMounted(() => {
  loading.value = true;
  getFilter();
});
const itemRef = ref(null);
const onConfirm = () => {
  queryParams.page = 1;
  getData();
  FilmResult.value = [];
  itemRef.value.toggle(false);
};

const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};
</script>

<template>
  <van-back-top bottom="10vh" right="5vw" />
  <van-pull-refresh
    v-model="refreshing"
    :disabled="refreshDisable"
    @refresh="onRefresh"
  >
    <van-sticky>
      <van-dropdown-menu ref="menuRef">
        <van-dropdown-item
          ref="itemRef"
          title="筛选"
          @closed="refreshDisable = false"
          @opened="refreshDisable = true"
        >
          <van-tabs
            v-for="category in CategoryResult"
            :key="category.key"
            v-model:active="queryParams[category.key]"
            swipeable
            type="line"
          >
            <van-tab
              v-for="item in category.result"
              :key="item.value"
              :name="item.value"
              :title="item.label"
            />
          </van-tabs>
          <div>
            <van-button block @click="onConfirm"> 确认</van-button>
          </div>
        </van-dropdown-item>
        <van-dropdown-item
          v-model="queryParams.name"
          title="搜索"
          @closed="refreshDisable = false"
          @opened="refreshDisable = true"
        >
          <van-search
            v-model="queryParams.name"
            placeholder="请输入搜索关键词"
            @search="onConfirm"
          />
        </van-dropdown-item>
      </van-dropdown-menu>
    </van-sticky>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell>
        <van-grid :column-num="3" :gutter="10">
          <film-card :data="FilmResult" />
        </van-grid>
      </van-cell>
    </van-list>
  </van-pull-refresh>
</template>

<style scoped>
:deep(.van-grid-item__content) {
  padding: 0;
}
</style>
