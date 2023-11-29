import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/dev-api/list/get",
    method: "get",
    response: () => {
      return {
        code: 0,
        message: "OK",
        result: {
          "list|10": [
            {
              "id|+1": 1
            }
          ]
        }
      };
    }
  },
  {
    url: "/dev-api/list/error",
    method: "get",
    response: () => {
      return {
        code: 1,
        message: "ERROR",
        result: null
      };
    }
  }
]);
