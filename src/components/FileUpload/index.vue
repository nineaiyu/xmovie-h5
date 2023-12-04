<template>
  <div class="upload">
    <van-overlay :show="show" :z-index="9999">
      <img ref="imgElRef" src="" alt="" />
      <van-tabbar>
        <van-tabbar-item name="rotate" @click="handCropper('rotate', 90)"
          >旋转</van-tabbar-item
        >
        <van-tabbar-item name="search" @click="SaveCropper"
          >确定</van-tabbar-item
        >
      </van-tabbar>
    </van-overlay>
    <van-field
      :name="props.name"
      :required="props.required"
      :rules="props.rules"
      :label="props.label"
    >
      <template #input>
        <van-uploader
          ref="uploader"
          v-model="fileList"
          :after-read="afterRead"
          :max-count="props.maxCount"
          :max-size="fileMaxSize"
          :accept="props.accept"
          @click-preview="afterRead"
          @oversize="onOversize"
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
const currentFile = ref();
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
  if (currentFile.value) {
    files = currentFile.value;
  }
  nextTick(() => {
    const reader = new FileReader();
    // const files = fileList.value[0]
    if (files.file.type === "image/png" || files.file.type === "image/jpeg") {
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
      // 判断是否需要图片压缩
      if (files.file.size / 1024 <= 200) {
        // emit('update:input', [files])
        return;
      }
      reader.readAsDataURL(files.file);
      reader.onload = function () {
        files.file = compress(this.result, files.file);
      };
    }
    emit("upload", fileList.value);
  });
};
const onOversize = () => {
  showNotify(`文件大小超出限制，上传文件大小不能超过 ${props.maxSize}M`);
};
const compress = (base64: string | any, file: any) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = base64;
  let width = img.width;
  let height = img.height;
  const tCanvas = document.createElement("canvas");
  const context = tCanvas.getContext("2d");
  // 如果图片大于四百万像素，计算压缩比并将大小压至400万以下
  let ratio = (width * height) / 4000000;
  // 判断图片像素是否是四百万
  if (ratio > 1) {
    ratio = Math.sqrt(ratio);
    width /= ratio;
    height /= ratio;
  } else {
    ratio = 1;
  }
  canvas.width = width;
  canvas.height = height;
  // 铺底色
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 如果图片像素大于100万则使用瓦片绘制
  let count = (width * height) / 1000000;
  if (count > 1) {
    count = ~~(Math.sqrt(count) + 1); // 计算要分成多少块瓦片
    //  计算每块瓦片的宽和高
    const nw = ~~(width / count);
    const nh = ~~(height / count);
    tCanvas.width = nw;
    tCanvas.height = nh;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        context.drawImage(
          img,
          i * nw * ratio,
          j * nh * ratio,
          nw * ratio,
          nh * ratio,
          0,
          0,
          nw,
          nh
        );
        ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
      }
    }
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }
  // 判断图片大小是否超过1M 超过1M按最小比压缩
  let newData;
  if (file.size / 1024 / 1024 < 1) {
    newData = canvas.toDataURL("image/jpeg", 0.5);
  } else {
    newData = canvas.toDataURL("image/jpeg", 0.1);
  }
  tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
  showNotify("图片压缩处理中");
  return dataURLtoFile(newData, file.name, file.type);
};
// 将base64转换为file对象
const dataURLtoFile = (data: string, filename: string, filetype: string) => {
  const arr = data.split(",");
  const blobStr = atob(arr[1]);
  let n = blobStr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = blobStr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: filetype
  });
};
const SaveCropper = () => {
  const files = fileList.value[0]?.file;
  if (!currentFile.value) {
    currentFile.value = fileList.value[0];
  }
  const type = files.type;
  const croppedCanvas = cropper.value.getCroppedCanvas().toDataURL(type);
  const blob = dataURLtoBlob(croppedCanvas);
  const name = files.name;
  const file = {
    file: new window.File([blob], name, { type: blob.type }),
    content: croppedCanvas,
    message: "",
    status: ""
  };
  fileList.value = [file];
  show.value = false;
  uploader.value?.closeImagePreview();
  emit("upload", fileList.value);
};
const dataURLtoBlob = (data: string) => {
  const arr = data.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const blobStr = atob(arr[1]);
  let n = blobStr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = blobStr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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
