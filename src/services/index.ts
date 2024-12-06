import axios from "./request";
import type {
  loginParams,
  userListParams,
  editUserInfo,
  userInfoParams,
  userCreateParams,
  examinationCreateParams
} from "../type";

// 获取验证码
export const apiLoginCaptcha = () => {
  return axios.get("/login/captcha");
};
// 登录
export const apiLogin = (data: loginParams) => {
  return axios.post("/login", data);
};

// 查询个人信息
export const apiUserInfo = () => {
  return axios.get("/user/info");
};
// 查询左侧列表
export const apiUserMenuList = () => {
  // return axios.get("/permission/list");
  return axios.get("/user/menulist");
};
// 查询用户列表
export const apiUserList = (params: userListParams) => {
  return axios.get("/user/list", { params });
};
// 编辑用户
export const apiUserUpdate = (params: userInfoParams) => {
  return axios.post("/user/update", params);
};
// 创建用户
export const apiUserCreate = (params: userCreateParams) => {
  return axios.post("/user/create", params);
};
// 删除用户
export const apiUserRemove = (params: { id: string }) => {
  return axios.post("/user/remove", params);
};

// 查询角色
export const apiRoleList = () => {
  return axios.get("/role/list");
};
// 删除角色
export const apiRoleRemove = (params: { id: string }) => {
  return axios.post("/role/remove", params);
};
// 创建角色
export const apiRoleCreate = (params: { name: string; value: string }) => {
  return axios.post("/role/create", params);
};
// 更新角色权限
export const apiRoleUpdate = (params: {
  name: string;
  id: string;
  permission: [];
}) => {
  return axios.post("/role/update", params);
};

// 查询权限菜单
export const apiPermissionList = () => {
  return axios.get("/permission/list");
};
// 编辑菜单
export const apiPermissionUpdate = (params) => {
  return axios.post("/permission/update", params);
};
// 删除菜单
export const apiPermissionRemove = (params) => {
  return axios.post("/permission/remove", params);
};
// 新建菜单
export const apiPermissionCreate = (params) => {
  return axios.post("/permission/create", params);
};

// 创建试卷
export const apiExamCreate = (params) => {
  return axios.post("/exam/create", params);
};
// 查询考试列表
export const apiExamList = (params) => {
  return axios.get("/exam/list", { params });
};
// 编辑试卷
export const apiExamUpdate = (params) => {
  return axios.post("/exam/update", params);
};
// 删除试卷
export const apiExamRemove = (params) => {
  return axios.post("/exam/remove", params);
};
// 查询试卷详情
export const apiExamDetail = (params) => {
  return axios.get("/exam/detail", { params });
};

// 创建考试
export const apiExaminationCreate = (params:examinationCreateParams) => {
  return axios.post("/examination/create", params);
};
// 查询考试列表
export const apiExaminationList = (params) => {
  return axios.get("/examination/list", { params });
};
// 编辑考试
export const apiExaminationUpdate = (params) => {
  return axios.post("/examination/update", params);
};
// 删除考试
export const apiExaminationRemove = (params) => {
  return axios.post("/examination/remove", params);
};
// 查询考试详情
export const apiExaminationDetail = (params) => {
  return axios.get("/examination/detail", { params });
};

// 创建科目
export const apiClassifyCreate = (params) => {
  return axios.post("/classify/create", params);
};
// 查询科目列表
export const apiClassifyList = (params) => {
  return axios.get("/classify/list", { params });
};
// 编辑科目
export const apiClassifyUpdate = (params) => {
  return axios.post("/classify/update", params);
};
// 删除科目
export const apiClassifyRemove = (params) => {
  return axios.post("/classify/remove", params);
};

// 创建班级
export const apiStudentGroupCreate = (params) => {
  return axios.post("/studentGroup/create", params);
};
// 查询班级列表
export const apiStudentGroupList = (params) => {
  return axios.get("/studentGroup/list", { params });
};
// 编辑班级
export const apiStudentGroupUpdate = (params) => {
  return axios.post("/studentGroup/update", params);
};
// 删除班级
export const apiStudentGroupRemove = (params) => {
  return axios.post("/studentGroup/remove", params);
};

// 创建试题
export const apiQuestionCreate= (params) => {
  return axios.post("/question/create", params);
};
// 查询题库列表
export const apiQuestionList = (params) => {
  return axios.get("/question/list", { params });
};
// 编辑题目
export const apiQuestionUpdate = (params) => {
  return axios.post("/question/update", params);
};
// 删除题目
export const apiQuestionRemove = (params) => {
  return axios.post("/question/remove", params);
};
// 查询试题类型
export const apiQuestionTypeList = (params) => {
  return axios.get("/question/type/list", { params });
};
// 批量创建试题
export const apiQuestionCreateMultiple= (params) => {
  return axios.post("/question/create/multiple", params);
};


// 创建学生
export const apiStudentCreate = (params) => {
  return axios.post(`/student/create?${Date.now()}`, params);
};
// 查询学生列表
export const apiStudentList = (params) => {
  return axios.get("/student/list", { params });
};
// 编辑学生
export const apiStudentUpdate = (params) => {
  return axios.post("/student/update", params);
};
// 删除学生
export const apiStudentRemove = (params) => {
  return axios.post("/student/remove", params);
};
