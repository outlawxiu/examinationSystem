import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ProTable,
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
} from "@ant-design/pro-components";
import { Button, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useRequest } from "ahooks";
import {
  apiStudentGroupList,
  apiClassifyList,
  apiStudentRemove,
  apiStudentUpdate,
  apiStudentList,
  apiStudentCreate,
} from "../../services/index";
export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

interface GithubIssueItem {
  age: number;
  avator: string;
  classId: string;
  className: string;
  createTime: number;
  creator: string;
  email: string;
  exams: [];
  idCard: string;
  password: string;
  role: string;
  sex: string;
  status: number;
  username: string;
  __v: number;
  _id: string;
}

const classNameValueEnum = new Map();

export default () => {
  const drawer = useRef();
  const { data: studentGroupList, run: getStudentGroupList } =
    useRequest(apiStudentGroupList);
  const { data: studentList, run: getStudentList } = useRequest(apiStudentList);
  useEffect(() => {
    studentGroupList?.data.data.list.forEach((item) => {
      classNameValueEnum.set(item.name, { text: item.name });
    });
  }, [studentGroupList]);
  const [drawerVisit, setDrawerVisit] = useState(false);
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: "学生名称",
      dataIndex: "username",
    },
    {
      title: "性别",
      dataIndex: "sex",
      valueType: "select",
      valueEnum: {
        男: { text: "男" },
        女: { text: "女" },
      },
    },
    {
      title: "年龄",
      dataIndex: "age",
      valueType: "digit",
    },
    {
      title: "班级",
      dataIndex: "className",
      valueType: "select",
      valueEnum: classNameValueEnum,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "dateTime",
      editable: false,
      search: false,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            (async () => {
              const res = await apiStudentRemove({ id: record._id });
              if (res.data.code === 200) {
                message.success("删除成功");
                getStudentList();
              }
            })();
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  return (
    <div>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        dataSource={studentList?.data.data.list}
        editable={{
          type: "multiple",
          onSave: async (rowKey, data, row) => {
            const params = {
              id: data._id,
              username: data.username,
              sex: data.sex,
              age: data.age,
              className: data.className,
            };
            const res = await apiStudentUpdate(params);
            if (res.data.code === 200) {
              message.success("修改成功");
              getStudentList();
            }
          },
          onDelete: async (value, row) => {
            const res = await apiStudentRemove({ id: row._id });
            if (res.data.code === 200) {
              message.success("删除成功");
              getStudentList();
            }
          },
        }}
        rowKey="_id"
        search={{
          labelWidth: "auto",
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 15, 20],
          hideOnSinglePage: true,
        }}
        onSubmit={(params) => {
          getStudentList(params);
        }}
        onReset={getStudentList}
        dateFormatter="string"
        headerTitle="学生列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setDrawerVisit(true);
              actionRef.current?.reload();
            }}
            type="primary"
          >
            添加学生
          </Button>,
        ]}
      />

      <DrawerForm
        onOpenChange={setDrawerVisit}
        title="新建表单"
        formRef={drawer}
        open={drawerVisit}
        onFinish={async () => {
          const params = drawer.current?.getFieldsValue();
          params.avator = "";
          params.status = 1;
          const res = await apiStudentCreate(params);
          if (res.data.code === 200) {
            message.success("添加学生成功");
            getStudentList();
            return true;
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="username"
            label="学生名称"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />

          <ProFormText.Password
            width="md"
            name="password"
            label="密码"
            placeholder="请输入密码"
            rules={[{ required: true }]}
          />
          <ProFormDigit
            width="xs"
            name="age"
            label="年龄"
            placeholder="请输入年龄"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            options={[
              { label: "男", value: "男" },
              { label: "女", value: "女" },
            ]}
            name="sex"
            label="性别"
            rules={[{ required: true }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            width="md"
            name="idCard"
            label="身份证号"
            placeholder="请输入身份证号"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            options={studentGroupList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            width="xs"
            name="className"
            label="班级"
            rules={[{ required: true }]}
          />
          <ProFormText
            width="md"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            rules={[{ required: true }]}
          />
        </ProForm.Group>
      </DrawerForm>
    </div>
  );
};
