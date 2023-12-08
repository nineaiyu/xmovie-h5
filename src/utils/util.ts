import Cookies from "js-cookie";

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

export function downloadFileByUrl(url: string) {
  const iframe = document.createElement("iframe", {});
  iframe.style.display = "none"; // 防止影响页面
  iframe.style.height = "0"; // 防止影响页面
  iframe.referrerPolicy = "no-referrer";
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(
    () => {
      iframe.remove();
    },
    5 * 60 * 1000
  );
}

export function getHistoryByCookie(film: string) {
  const data = Cookies.get(`currentPlay_${film}`);
  if (data) {
    return JSON.parse(data);
  }
  return {};
}
export function setHistoryByCookie(
  film: string,
  currentPk: string,
  times: number
) {
  Cookies.set(
    `currentPlay_${film}`,
    JSON.stringify({ film, currentPk, times }),
    {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  );
}
