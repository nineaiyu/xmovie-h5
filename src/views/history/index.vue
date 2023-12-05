<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  cleanWatchHistoryApi,
  deleteWatchHistoryApi,
  getWatchHistoryListApi
} from "@/api/movie/history";
import { formatVideoTimes } from "@/utils/util";
import dayjs from "dayjs";
import router from "@/router";
import { showNotify, showConfirmDialog } from "vant";

const loading = ref(false);
const refreshing = ref(false);

const queryParams = reactive({
  ordering: "-created_time",
  name: "",
  page: 1,
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
      Result.value = [...data.results];
      if (data.total === Result.value.length) {
        finished.value = true;
      }
    }
    loading.value = false;
  });
};

const finished = ref(false);
const refreshDisable = ref(false);
const onLoad = () => {
  // 异步更新数据
  if (refreshing.value) {
    queryParams.name = "";
    queryParams.page = 1;
    Result.value = [];
    refreshing.value = false;
  }
  getData();
};

onMounted(() => {
  getData();
});
const refreshData = () => {
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

const confirmDelete = () => {
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

let timeOutEvent = null;
let clickFlag = true;
const goTouchstart = (pk: string) => {
  clearTimeout(timeOutEvent);
  timeOutEvent = setTimeout(() => {
    clickFlag = false;
    showConfirmDialog({
      title: "警告",
      message: "确定要删除该播放历史记录么？"
    })
      .then(() => {
        deleteWatchHistoryApi(pk).then(res => {
          if (res.code === 1000) {
            showNotify({ type: "success", message: "操作成功" });
            refreshing.value = true;
            onLoad();
          } else {
            showNotify({ type: "danger", message: res.detail });
          }
          clickFlag = true;
        });
      })
      .catch(() => {
        clickFlag = true;
      });
  }, 600);
};
//手如果在600毫秒内就释放，则取消长按事件
const goTouchend = (pk: string) => {
  clearTimeout(timeOutEvent);
  if (clickFlag) {
    goDetail(pk);
  }
};
</script>

<template>
  <van-back-top right="5vw" bottom="10vh" />
  <van-cell>
    <van-search
      v-model="queryParams.name"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
    >
      <template #action>
        <span class="text-red-400" @click="confirmDelete">清空</span>
      </template>
    </van-search>
  </van-cell>
  <van-pull-refresh
    v-model="refreshing"
    :disabled="refreshDisable"
    @refresh="refreshData"
  >
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell>
        <van-grid :gutter="10" :column-num="1">
          <van-grid-item
            v-for="item in Result"
            :key="item.pk"
            @touchstart.prevent="goTouchstart(item.pk)"
            @touchend.prevent="goTouchend(item.film.pk)"
          >
            <van-row class="text-left">
              <van-col :span="6">
                <van-image :src="item.film.poster" fit="cover" :radius="6" />
              </van-col>
              <van-col :span="16" offset="1">
                <span class="font-bold">{{ item.film.name }}</span>
                <div class="font-thin">{{ item.episode.name }}</div>
                <div>
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
              <van-col :span="24" class="w-full mt-2">
                <van-progress
                  class="w-full"
                  :percentage="
                    Math.floor((item.times * 100) / item.episode.times)
                  "
                  stroke-width="6"
                />
              </van-col>
            </van-row>
          </van-grid-item>
        </van-grid>
      </van-cell>
    </van-list>
  </van-pull-refresh>
</template>