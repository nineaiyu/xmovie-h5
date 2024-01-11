<script lang="ts" setup>
import { watch } from "vue";
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify"
});

interface Props {
  code?: string;
}

interface Emits {
  (e: "update:code", code: string): void;

  (e: "update:length", code: number): void;
}

withDefaults(defineProps<Props>(), {
  code: ""
});

const emit = defineEmits<Emits>();

const { imgUrl, imgCode, getImgCode } = useImageVerify();

watch(imgCode, newValue => {
  emit("update:code", newValue);
});

defineExpose({ getImgCode });
</script>

<template>
  <van-image
    :src="imgUrl"
    class="cursor-pointer"
    style="width: 120px; height: 40px"
    @click="getImgCode"
  />
</template>
