<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { RouteParamValue, useRoute } from "vue-router";
import { getFilmDetailApi, getFilmDownloadApi } from "@/api/movie/film";
import { showNotify } from "vant";
import "vant/es/notify/style";
import { downloadFileByUrl, getHistoryByCookie } from "@/utils/util";
import { getToken } from "@/utils/auth";

const route = useRoute();
const filmDetail = ref<FilmResultType>();
const episodeList = ref([]);
const actorList = ref([]);
const currentPk = ref("0");
const currentIndex = ref(0);
const showActorDetail = reactive({
  show: false,
  pk: ""
});
const getFilmDetail = (pk: string | RouteParamValue[] | any) => {
  getFilmDetailApi(pk).then(res => {
    filmDetail.value = res.film;
    episodeList.value = res.episode;
    if (episodeList.value.length > 0) {
      if (getToken()) {
        currentPk.value = filmDetail.value.current_play_pk;
      } else {
        currentPk.value =
          getHistoryByCookie(filmDetail.value.pk)?.currentPk ??
          filmDetail.value.current_play_pk;
      }
    }
    actorList.value = [...res.director];
    res.starring.forEach(item => {
      if (!checkExist(item, res.director)) {
        actorList.value.push(item);
      }
    });
  });
};

const checkExist = (val, list) => {
  for (let i = 0; i < list.length; i++) {
    if (val.pk === list[i].pk) {
      return true;
    }
  }
  return false;
};

onMounted(() => {
  getFilmDetail(route.params.pk);
});

interface category {
  label: string;
  value: number;
}

interface FilmResultType {
  pk?: string;
  name?: string;
  title?: string;
  poster?: string;
  category?: string[];
  episodes?: string;
  region?: string;
  language?: string;
  subtitle?: string;
  director?: string[];
  starring?: string[];
  times?: string;
  views?: string;
  channel?: string;
  current_play_pk?: string;
  release_date?: string;
  rate?: number;
  channel_info?: category[];
  category_info?: category[];
  region_info?: category[];
  language_info?: category[];
  introduction?: string;
  enable?: boolean;
}

const getIndexType = (index: number) => {
  if (index === 1) {
    return "success";
  } else if (index === 2) {
    return "warning";
  } else if (index === 3) {
    return "danger";
  } else return "primary";
};

const playVideo = (pk: string, index: number) => {
  currentPk.value = "0";
  currentIndex.value = index;
  setTimeout(() => {
    currentPk.value = pk;
  }, 200);
};

const goDetail = (pk: string) => {
  showActorDetail.show = true;
  showActorDetail.pk = pk;
};

const downloadFile = (pk: string) => {
  getFilmDownloadApi(pk).then(res => {
    if (res.code === 1000) {
      showNotify({ type: "success", message: "获取下载连接成功" });
      downloadFileByUrl(res.download_url);
    } else {
      showNotify({ type: "danger", message: res.detail });
    }
  });
};
</script>

<template>
  <div>
    <div v-if="episodeList.length > 0" class="min-h-[30vh] w-full">
      <video-play
        v-if="currentPk !== '0'"
        :film="filmDetail.pk.toString()"
        :pk="currentPk.toString()"
        :autoplay="true"
        :init="false"
      />
    </div>
    <van-empty v-else image="network" description="播放列表获取失败" />
    <van-col class="mt-5">
      <van-tabs class="m-5">
        <van-tab title="播放列表">
          <van-space direction="vertical" fill class="mt-5">
            <van-swipe-cell v-for="(item, index) in episodeList" :key="item.pk">
              <van-button
                block
                :type="
                  item.pk.toString() === currentPk.toString()
                    ? 'success'
                    : 'default'
                "
                @click="playVideo(item.pk, index)"
              >
                第{{ index + 1 }}集：{{ item.name }}
              </van-button>
              <template #right>
                <van-button
                  square
                  text="下载"
                  type="primary"
                  plain
                  @click="downloadFile(item.pk)"
                />
              </template>
            </van-swipe-cell>
          </van-space>
        </van-tab>
        <van-tab v-if="filmDetail" title="详细内容" class="mt-5">
          <van-row>
            <van-col :span="6">
              <van-image :src="filmDetail.poster" fit="cover" :radius="6" />
            </van-col>
            <van-col :span="16" offset="1">
              <van-space direction="vertical" fill>
                <van-col class="text-2xl">{{ filmDetail.name }}</van-col>
                <van-col>{{ filmDetail.release_date }}</van-col>
                <van-col class="mt-1">
                  <van-tag
                    v-for="(item, index) in [
                      ...filmDetail.channel_info,
                      ...filmDetail.category_info,
                      ...filmDetail.region_info,
                      ...filmDetail.language_info
                    ]"
                    :key="item.value"
                    plain
                    class="m-1"
                    :type="getIndexType(index % 3)"
                    >{{ item.label }}
                  </van-tag>
                </van-col>
              </van-space>
            </van-col>
          </van-row>
          <van-row class="mt-5">
            <van-col :span="8" style="line-height: 25px"
              >评分：{{ filmDetail.rate }} 分
            </van-col>
            <van-col :span="12">
              <van-rate v-model="filmDetail.rate" allow-half />
            </van-col>
          </van-row>
          <van-row>
            <h3>演员</h3>
          </van-row>
          <van-action-sheet
            v-model:show="showActorDetail.show"
            title="演员信息"
          >
            <actor-detail :pk="showActorDetail.pk" />
          </van-action-sheet>
          <van-row>
            <div class="overflow-hidden whitespace-nowrap overflow-x-auto">
              <div
                v-for="item in actorList"
                :key="item.pk"
                class="text-center inline-block w-1/4 mr-3"
                @click="goDetail(item.pk)"
              >
                <van-image :src="item.avatar" fit="cover" :radius="6" />
                <p class="truncate">{{ item.name }}</p>
              </div>
            </div>
          </van-row>
          <van-row>
            <h3>剧情</h3>
          </van-row>
          <van-row>
            <van-col :span="24">
              <van-text-ellipsis
                rows="10"
                :content="filmDetail.introduction"
                expand-text="展开"
                collapse-text="收起"
              />
            </van-col>
          </van-row>
        </van-tab>
      </van-tabs>
    </van-col>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 0;
}
</style>
