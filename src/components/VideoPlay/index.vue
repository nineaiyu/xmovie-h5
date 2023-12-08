<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Player, { Events } from "xgplayer";
import HlsJsPlugin from "xgplayer-hls.js";
import "vant/es/notify/style";
import "xgplayer/dist/index.min.css";
import { getFilmPreviewApi, getFilmPreviewJsonApi } from "@/api/movie/film";
import { showNotify } from "vant";
import { getHistoryByCookie, setHistoryByCookie, throttle } from "@/utils/util";
import { updateWatchHistoryTimesApi } from "@/api/movie/history";
import { getToken } from "@/utils/auth";

interface Props {
  pk: string;
  film: string;
  autoplay?: boolean;
  init?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pk: "",
  film: "",
  autoplay: false,
  init: false
});

const player = ref();

const initVideo = (result: object[] | any, times: number, file_pk: number) => {
  if (!getToken()) {
    times = getHistoryByCookie(props.film)?.times ?? times;
  }
  // https://h5player.bytedance.com/
  player.value = new Player({
    id: "mse",
    // url: preview_url,
    volume: 0.6, // 初始音量
    autoplay: props.autoplay, // 自动播放
    videoInit: props.init,
    playsinline: true,
    startTime: times ?? 0,
    plugins: [HlsJsPlugin],
    fluid: true,
    //传入倍速可选数组
    playbackRate: [0.5, 0.75, 1, 1.5, 2],
    ignores: ["download"],
    fitVideoSize: "fixed",
    definition: {
      list: result
    },
    rotate: {
      //视频旋转按钮配置项
      innerRotate: true, //只旋转内部video
      clockwise: true // 旋转方向是否为顺时针
    },
    // download: true, //设置download控件显示,
    pip: true, //pc画中画
    keyShortcut: true, //pc
    screenShot: {
      saveImg: true,
      quality: 0.92,
      type: "image/png",
      format: ".png"
    } // 截图
    // cssFullscreen: true, //网页样式全屏
  });
  // 监听网页全屏(即页面全屏)也是一样的逻辑
  player.value.on(Events.TIME_UPDATE, ({ currentTime }) => {
    if (getToken()) {
      updateVideoPlayTimes(currentTime, file_pk);
    } else {
      updateVideoPlayTimesByCookie(currentTime, file_pk);
    }
  });
};

function getPreview() {
  getFilmPreviewApi(props.pk).then((res: any) => {
    if (res.code === 1000 && res.data.category === "video") {
      getFilmPreviewJsonApi(res.data.preview_url).then(({ data, code }) => {
        if (code === 1000) {
          const result = [];
          data.forEach(item => {
            result.push({
              definition: item.label,
              url: item.url,
              text: {
                en: item.label
              }
            });
          });
          initVideo(result, res.data.times, res.data.pk);
        } else {
          showNotify({ type: "danger", message: res.detail });
        }
      });
    } else {
      showNotify({ type: "danger", message: res.detail });
    }
  });
}

const updateVideoPlayTimesByCookie = throttle((times, pk) => {
  if (times && times > 0) {
    setHistoryByCookie(props.film, props.pk, times);
  }
}, 2 * 1000);

const updateVideoPlayTimes = throttle((times, pk) => {
  if (times && times > 0) {
    updateWatchHistoryTimesApi({ times, file_id: pk });
  }
}, 5 * 1000);

onMounted(() => {
  getPreview();
});
onUnmounted(() => {
  if (player.value) {
    player.value.destroy();
    player.value = null;
  }
});
</script>

<template>
  <div>
    <meta name="referrer" content="no-referrer" />
    <div id="mse" />
  </div>
</template>
