export type Result = {
  detail: string;
  code: number;
  swipe?: Array<any>;
  film?: Array<any>;
  category?: Array<any>;
  data?: {
    /** 列表数据 */
    results: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    size?: number;
    /** 当前页数 */
    page?: number;
  };
};

export interface ActorResultType {
  pk: string;
  who: string;
  avatar: string;
  birthday: string;
  name: string;
  foreign_name: string;
  introduction: string;
  sex: number;
}

export type DetailResult = {
  detail?: string;
  code?: number;
  episode?: Array<any>;
  starring?: Array<ActorResultType>;
  film?: object;
  current?: string;
};

export type VideoPreviewResult = {
  detail: string;
  code: number;
  download_url: string;
  data: {
    label: string;
    url: string;
  }[];
};
