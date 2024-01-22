<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
  cleanWatchHistoryApi,
  deleteWatchHistoryApi,
  getWatchHistoryListApi
} from "@/api/movie/history";
import { formatVideoTimes } from "@/utils/util";
import dayjs from "dayjs";
import router from "@/router";
import { showConfirmDialog, showNotify } from "vant";

defineOptions({
  name: "History"
});
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const total = ref(0);

const queryParams = reactive({
  ordering: "-updated_time",
  name: "",
  page: 0,
  size: 10
});

interface historyDetail {
  pk: string;
  times: number;
  updated_time: string;
  film: {
    name: string;
    pk: string;
    poster: string;
  };
  episode: {
    name: string;
    times: number;
  };
}

const Result = ref<historyDetail[]>([]);

const getData = () => {
  getWatchHistoryListApi(queryParams).then(({ code, data }) => {
    if (code === 1000) {
      if (refreshing.value) {
        Result.value = [];
        refreshing.value = false;
      }
      Result.value = [...Result.value, ...data.results];
      total.value = data.total;
      finished.value = data.total === Result.value.length;
    }
    loading.value = false;
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

const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};
const onSearch = () => {
  queryParams.page = 1;
  Result.value = [];
  getData();
};
const goDetail = (pk: string) => {
  router.push({
    name: "Detail",
    params: { pk: pk }
  });
};

const confirmClean = () => {
  showConfirmDialog({
    title: "警告",
    message: "确定要清空所有播放历史记录么？"
  }).then(() => {
    cleanWatchHistoryApi({}).then(res => {
      if (res.code === 1000) {
        showNotify({ type: "success", message: "操作成功" });
        refreshing.value = true;
        onLoad();
      } else {
        showNotify({ type: "danger", message: res.detail });
      }
    });
  });
};

const confirmDelete = (pk: string) => {
  showConfirmDialog({
    title: "警告",
    message: "确定要删除该播放历史记录么？"
  }).then(() => {
    deleteWatchHistoryApi(pk).then(res => {
      if (res.code === 1000) {
        showNotify({ type: "success", message: "操作成功" });
        refreshing.value = true;
        onLoad();
      } else {
        showNotify({ type: "danger", message: res.detail });
      }
    });
  });
};
</script>

<template>
  <van-back-top bottom="10vh" right="5vw" />
  <van-sticky>
    <van-cell>
      <van-search
        v-model="queryParams.name"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch"
      >
        <template #action>
          <span class="text-red-400" @click="confirmClean">清空</span>
        </template>
      </van-search>
    </van-cell>
  </van-sticky>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell>
        <van-grid :column-num="1" :gutter="10">
          <van-swipe-cell v-for="(item, index) in Result" :key="item.pk">
            <template #right>
              <van-space direction="vertical" fill>
                <van-button
                  block
                  plain
                  type="danger"
                  @click="confirmDelete(item.pk)"
                  >删除
                </van-button>
                <van-button block type="primary" @click="goDetail(item.film.pk)"
                  >观看
                </van-button>
              </van-space>
            </template>
            <van-grid-item>
              <van-row class="text-left">
                <van-col :span="6" @click="goDetail(item.film.pk)">
                  <van-image :radius="6" :src="item.film.poster" fit="cover" />
                </van-col>
                <van-col :span="16" offset="1">
                  <span class="font-bold">{{ item.film.name }}</span>
                  <div class="font-light w-full">
                    <van-text-ellipsis :content="item.episode.name" />
                  </div>
                  <div class="mt-2">
                    已经观看 {{ formatVideoTimes(item.times) }}，总共
                    {{ formatVideoTimes(item.episode.times) }}
                  </div>
                  <van-col>
                    <span
                      >观看时间
                      {{
                        dayjs(item.updated_time).format("YYYY-MM-DD HH:mm:ss")
                      }}</span
                    >
                  </van-col>
                </van-col>
                <van-col :span="20" class="w-full mt-3">
                  <van-progress
                    :percentage="
                      Math.floor((item.times * 100) / item.episode.times)
                    "
                    class="w-full"
                    stroke-width="6"
                  />
                </van-col>
                <van-col :offset="1" :span="3" class="w-full">
                  {{ index + 1 }}/{{ total }}
                </van-col>
              </van-row>
            </van-grid-item>
          </van-swipe-cell>
        </van-grid>
      </van-cell>
    </van-list>
  </van-pull-refresh>
</template>
<style scoped>
.van-button {
  height: 9vh;
}
</style>
