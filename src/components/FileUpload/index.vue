<template>
  <div class="upload">
    <van-overlay :show="show" :z-index="9999">
      <img ref="imgElRef" alt="" src="" />
      <van-tabbar>
        <van-tabbar-item name="rotate" @click="handCropper('rotate', 90)"
          >旋转
        </van-tabbar-item>
        <van-tabbar-item name="search" @click="SaveCropper"
          >确定
        </van-tabbar-item>
      </van-tabbar>
    </van-overlay>
    <van-field
      :label="props.label"
      :name="props.name"
      :required="props.required"
      :rules="props.rules"
    >
      <template #input>
        <van-uploader
          ref="uploader"
          v-model="fileList"
          :accept="props.accept"
          :after-read="afterRead"
          :max-count="props.maxCount"
          :max-size="fileMaxSize"
          @oversize="onOversize"
          @click-preview="afterRead"
        />
      </template>
    </van-field>
  </div>
</template>

<script lang="ts" setup>
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { computed, nextTick, ref, unref } from "vue";
import { FieldRule, showNotify } from "vant";

interface Props {
  rules?: undefined | FieldRule[];
  maxSize?: number;
  maxCount?: number;
  isCutting?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  accept?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  accept: "png, jpeg, jpg, pdf, zip, docx, doc, xls, xlsx",
  name: "",
  // 上传个数限制
  maxCount: 1,
  // 最大上传大小的限制 默认为1
  maxSize: 10,
  // 是否时必填项
  required: false,
  // 如果是必填项 则需要传入验证规则
  rules: undefined,
  isCutting: false
});

const emit = defineEmits<{
  (e: "upload", v: any): void;
}>();

const show = ref(false);
const fileList = ref([]);
const cropper = ref(null);
const imgElRef = ref();
const uploader = ref();
const fileMaxSize = computed(() => {
  return props.maxSize * 1024 * 1024;
});

const handCropper = (event: string, arg?: number | Array<number>) => {
  cropper.value?.[event]?.(arg);
};

const fileByBase64 = (file, callback) => {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    // target.result 该属性表示目标对象的DataURL
    if (callback) {
      callback(e.target.result);
    } else {
      console.error("必须传入回调函数");
    }
  };
};

const afterRead = files => {
  // 此时可以自行将文件上传至服务器
  nextTick(() => {
    // const files = fileList.value[0]
    if (files.file.type.indexOf("image/") !== -1) {
      // 在此判断是否需要图片截取
      if (props.isCutting) {
        show.value = true;
        const { file } = files;
        nextTick(() => {
          const imgEl = unref(imgElRef);
          cropper.value = new Cropper(imgEl, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
            zoomable: true,
            scalable: false,
            highlight: false,
            dragMode: "none",
            ready: function () {
              show.value = true;
            }
          });
          fileByBase64(file, res => {
            // 每次替换图片要重新得到新的url
            if (cropper.value) {
              cropper.value.replace(res);
            }
          });
        });
      }
    } else {
      emit("upload", fileList.value);
    }
  });
};
const onOversize = () => {
  showNotify(`文件大小超出限制，上传文件大小不能超过 ${props.maxSize}M`);
};
const SaveCropper = () => {
  const files = fileList.value[0]?.file;
  const croppedCanvas = cropper.value.getCroppedCanvas({
    width: 512,
    height: 512
  });
  let type = "image/jpeg";
  croppedCanvas.toBlob(
    blob => {
      if (!blob) return;
      const fileReader: FileReader = new FileReader();
      fileReader.readAsDataURL(blob);
      fileReader.onloadend = e => {
        if (!e.target?.result || !blob) return;
        const file = {
          file: new window.File([blob], "avatar.png", { type: blob.type }),
          content: e.target.result,
          message: "",
          status: ""
        };
        fileList.value = [file];
        show.value = false;
        emit("upload", fileList.value);
      };
      fileReader.onerror = () => {
        showNotify(`文件读取失败`);
      };
    },
    type,
    0.2
  );
};
</script>

<style lang="scss">
.upload {
  .van-tabbar-item {
    font-size: 5vw;
    border: solid 1px #d1efe1;
  }
}
</style>
