<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue";
import { RouteParamValue, useRoute } from "vue-router";
import {
  getFilmDetailApi,
  getFilmDownloadApi,
  getFilmPlayingDataApi,
  getFilmRecommendDataApi
} from "@/api/movie/film";
import { showNotify } from "vant";
import "vant/es/notify/style";
import { downloadFileByUrl, getHistoryByCookie } from "@/utils/util";
import { getToken } from "@/utils/auth";
import { ActorResultType } from "@/api/movie/types";

defineOptions({
  name: "Detail"
});
const route = useRoute();
const filmDetail = ref<FilmResultType>();
const episodeList = ref([]);
const playPkList = ref([]);
const recommendList = ref([]);
const actorList = ref<ActorResultType[]>([]);
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
      episodeList.value.forEach(item => {
        playPkList.value.push(item.pk);
      });
      getFilePlayingData(filmDetail.value.pk);
    }
    actorList.value = [...res.starring];
  });
};

const getFilmRecommendData = (pk: string | RouteParamValue[] | any) => {
  getFilmRecommendDataApi(pk).then(res => {
    if (res.code === 1000) {
      recommendList.value = res.data.results;
    }
  });
};

const getFilePlayingData = (pk: string) => {
  getFilmPlayingDataApi(pk).then(res => {
    if (res.code === 1000) {
      console.log(res.current);
      if (getToken()) {
        currentPk.value = res.current;
      } else {
        currentPk.value =
          getHistoryByCookie(filmDetail.value.pk)?.currentPk ?? res.current;
      }
    }
  });
};

const initData = () => {
  getFilmDetail(route.params.pk);
  getFilmRecommendData(route.params.pk);
};

const setCurrentLocation = () => {
  setTimeout(() => {
    document
      .getElementById(currentPk.value.toString())
      .scrollIntoView({ behavior: "smooth", block: "center" });
  }, 800);
};

onMounted(() => {
  initData();
});

watch(
  () => route.params.pk,
  val => {
    if (val) {
      currentPk.value = "0";
      initData();
    }
  }
);

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
  starring?: string[];
  times?: string;
  views?: string;
  channel?: string;
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
  openSheet.value = true;
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
const onPlayEnd = (pk: number) => {
  let index = playPkList.value.indexOf(pk);
  if (index > -1 && index < playPkList.value.length) {
    playVideo(playPkList.value[index + 1], index);
  }
};
const openSheet = ref(true);
const closeSheet = () => {
  setTimeout(() => {
    openSheet.value = false;
  }, 500);
  return true;
};
</script>

<template>
  <div>
    <van-sticky v-if="episodeList.length > 0">
      <div class="min-h-[30vh] w-full">
        <video-play
          v-if="currentPk !== '0'"
          :autoplay="true"
          :film="filmDetail.pk.toString()"
          :init="false"
          :pk="currentPk.toString()"
          @ended="onPlayEnd"
          @loadeddata="setCurrentLocation"
        />
      </div>
    </van-sticky>
    <van-empty v-else description="播放列表获取失败" image="network" />
    <van-col class="mt-5">
      <van-tabs class="m-5">
        <van-tab title="播放列表">
          <van-space class="mt-5" direction="vertical" fill>
            <van-swipe-cell
              v-for="(item, index) in episodeList"
              :id="item.pk"
              :key="item.pk"
            >
              <van-button
                :type="
                  item.pk.toString() === currentPk.toString()
                    ? 'success'
                    : 'default'
                "
                block
                @click="playVideo(item.pk, index)"
              >
                第{{ index + 1 }}集：{{ item.name }}
              </van-button>
              <template #right>
                <van-button
                  plain
                  square
                  text="下载"
                  type="primary"
                  @click="downloadFile(item.pk)"
                />
              </template>
            </van-swipe-cell>
          </van-space>
          <van-cell v-if="recommendList.length > 0">
            <van-row>
              <h3>影视推荐</h3>
            </van-row>
          </van-cell>
          <van-grid :column-num="3" :gutter="10">
            <film-card :data="recommendList" />
          </van-grid>
        </van-tab>
        <van-tab v-if="filmDetail" class="mt-5" title="详细内容">
          <van-row>
            <van-col :span="6">
              <van-image :radius="6" :src="filmDetail.poster" fit="cover" />
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
                    :type="getIndexType(index % 3)"
                    class="m-1"
                    plain
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
              <van-rate :model-value="Number(filmDetail.rate)" allow-half />
            </van-col>
          </van-row>
          <van-row>
            <h3>演员</h3>
          </van-row>
          <van-action-sheet
            v-model:show="showActorDetail.show"
            :before-close="closeSheet"
            title="演员信息"
            @cancel="closeSheet"
          >
            <actor-detail
              v-if="openSheet"
              :pk="showActorDetail.pk.toString()"
            />
          </van-action-sheet>
          <van-row>
            <div class="overflow-hidden whitespace-nowrap overflow-x-auto">
              <div
                v-for="item in actorList"
                :key="item.pk"
                class="text-center inline-block w-1/4 mr-3"
                @click="goDetail(item.pk)"
              >
                <van-image :radius="6" :src="item.avatar" fit="cover" />
                <p class="truncate">{{ item.name }}</p>
                <p class="truncate font-thin">{{ item.who }}</p>
              </div>
            </div>
          </van-row>
          <van-row>
            <h3>剧情</h3>
          </van-row>
          <van-row>
            <van-col :span="24">
              <van-text-ellipsis
                :content="filmDetail.introduction"
                collapse-text="收起"
                expand-text="展开"
                rows="10"
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
