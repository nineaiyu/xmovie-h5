<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getWatchHistoryListApi } from "@/api/movie/history";
import { formatVideoTimes } from "../../utils/util";
import dayjs from "dayjs";
import router from "@/router";

const loading = ref(false);
const refreshing = ref(false);

const queryParams = reactive({
  ordering: "-created_time",
  name: "",
  page: 1,
  size: 10
});

const Result = ref([]);

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
const goDetail = (pk: string) => {
  router.push({
    name: "Detail",
    params: { pk: pk }
  });
};
</script>

<template>
  <van-back-top right="5vw" bottom="10vh" />

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
            @click="goDetail(item.film.pk)"
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
              <van-col :span="24" class="w-full">
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
