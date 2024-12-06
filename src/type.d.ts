// 登录的参数类型
export interface loginParams {
  username: string;
  password: string;
  code: string;
}
export interface userInfo {
  age?: number;
  avator?: string;
  creator?: string;
  email?: string;
  lastOnlineTime?: number;
  password?: string;
  role?: string[];
  sex?: "女" | "男";
  status?: 1 | 0;
  username?: string;
  __v?: number;
  _id: string;
}
export interface userInfoParams {
  age?: number;
  avator?: string;
  creator?: string;
  email?: string;
  lastOnlineTime?: number;
  password?: string;
  role?: string[];
  sex?: "女" | "男";
  status?: 1 | 0;
  username?: string;
  __v?: number;
  id: string;
}
export interface editUserInfo {
  password?: string;
  status?: 1 | 0;
  username?: string;
  id: string;
}
export interface userListParams {
  page: number;
  pagesize: number;
}
export interface userCreateParams {
  username: string;
  password: string;
  status: 0 | 1;
}

// 创建考试参数
export interface examinationCreateParams {
  name: string;
  classify: string;
  examId: string;
  group: string;
  examiner: string;
  startTime: number;
  endTime: number;
}

export interface examinationList {
  classify: string;
  createTime: number;
  creator: string;
  endTime: number;
  examId: string;
  examiner: string[];
  group: string[];
  name: string;
  questionsList: question[];
  startTime: number;
  status: number;
  __v: number;
  _id: string;
}
export interface question {
  answer: string;
  classify: string;
  options: string[];
  question: string;
  type: string;
  __v: number;
  _id: string;
}
