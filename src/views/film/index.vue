<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getFilmDataApi, getFilterApi } from "@/api/movie/home";

const loading = ref(false);
const refreshing = ref(false);

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
    }
  });
};

const finished = ref(false);
const refreshDisable = ref(false);
const onLoad = () => {
  // 异步更新数据
  if (refreshing.value) {
    queryParams.name = "";
    queryParams.page = 1;
    FilmResult.value = [];
    refreshing.value = false;
  } else {
    queryParams.page += 1;
  }
  getData();
};

onMounted(() => {
  getFilter();
  finished.value = true;
  getData();
});
const itemRef = ref(null);
const onConfirm = () => {
  queryParams.page = 1;
  getData();
  FilmResult.value = [];
  itemRef.value.toggle(false);
};

const refreshData = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};
</script>

<template>
  <van-back-top right="5vw" bottom="10vh" />
  <van-pull-refresh
    v-model="refreshing"
    :disabled="refreshDisable"
    @refresh="refreshData"
  >
    <van-dropdown-menu ref="menuRef">
      <van-dropdown-item
        ref="itemRef"
        title="筛选"
        @opened="refreshDisable = true"
        @closed="refreshDisable = false"
      >
        <van-tabs
          v-for="category in CategoryResult"
          :key="category.key"
          v-model:active="queryParams[category.key]"
          type="line"
          swipeable
        >
          <van-tab
            v-for="item in category.result"
            :key="item.value"
            :title="item.label"
            :name="item.value"
          />
        </van-tabs>
        <div>
          <van-button block @click="onConfirm"> 确认 </van-button>
        </div>
      </van-dropdown-item>
      <van-dropdown-item
        v-model="queryParams.name"
        title="搜索"
        @opened="refreshDisable = true"
        @closed="refreshDisable = false"
      >
        <van-search
          v-model="queryParams.name"
          placeholder="请输入搜索关键词"
          @search="onConfirm"
        />
      </van-dropdown-item>
    </van-dropdown-menu>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell>
        <van-grid :gutter="10" :column-num="3">
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
