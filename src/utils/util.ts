type FunctionArgs<Args extends any[] = any[], Return = void> = (
  ...args: Args
) => Return;

// 节流
export function throttle<T extends FunctionArgs>(fn: T, wait = 200) {
  let last, timer, now;
  return function () {
    now = Date.now();
    if (last && now - last < wait) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        last = now;
        fn.call(this, ...arguments);
      }, wait);
    } else {
      last = now;
      fn.call(this, ...arguments);
    }
  };
}

export function formatVideoTimes(times: number) {
  const h = Math.floor(times / 3600);
  const m = Math.floor((times - 3600 * h) / 60);
  const s = Math.floor(times % 60);
  let fs = "";
  if (h > 0) {
    fs = `${h}:`;
  }
  if (h > 0 || m > 0) {
    fs += `${m}:`;
  }
  fs += `${s}`;
  return fs;
}
