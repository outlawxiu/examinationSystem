import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ProTable,
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useRequest } from "ahooks";
import {
  apiStudentGroupList,
  apiClassifyList,
  apiUserList,
  apiStudentGroupRemove,
  apiStudentGroupUpdate,
  apiStudentList,
  apiStudentGroupCreate
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

interface student {
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
interface GithubIssueItem {
  classify: string;
  createTime: number;
  creator: string;
  name: string;
  students: student[] | string[];
  teacher: string;
  __v: number;
  _id: string;
}

const classifyValueEnum = new Map();
const creatorValueEnum = new Map();

export default () => {
  const drawer = useRef()
  const { data: studentGroupList, run: getStudentGroupList } =
    useRequest(apiStudentGroupList);
  const { data: classifyList, run: getClassifyList } =
    useRequest(apiClassifyList);
  const { data: userList, run: getUserList } = useRequest(apiUserList);
  const { data: studentList, run: getStudentList } = useRequest(apiStudentList);
  useEffect(() => {
    classifyList?.data.data.list.forEach((item) => {
      classifyValueEnum.set(item.name, { text: item.name });
    });
  }, [classifyList]);
  useEffect(() => {
    userList?.data.data.list.forEach((item) => {
      creatorValueEnum.set(item.username, { text: item.username });
    });
  }, [userList]);
  const [drawerVisit, setDrawerVisit] = useState(false);
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: "班级名称",
      dataIndex: "name",
    },
    {
      title: "学科",
      dataIndex: "classify",
      valueType: "select",
      valueEnum: classifyValueEnum,
    },
    {
      title: "老师",
      dataIndex: "teacher",
      valueType: "select",
      valueEnum: creatorValueEnum,
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
              const res = await apiStudentGroupRemove({ id: record._id });
              if (res.data.code === 200) {
                message.success("删除成功");
                getStudentGroupList();
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
        dataSource={studentGroupList?.data.data.list}
        editable={{
          type: "multiple",
          onSave: async (rowKey, data, row) => {
            const params = {
              id: data._id,
              name: data.name,
              classify: data.classify,
              teacher: data.teacher,
            };
            const res = await apiStudentGroupUpdate(params);
            if (res.data.code === 200) {
              message.success("修改成功");
              getStudentGroupList();
            }
          },
          onDelete: async (value, row) => {
            const res = await apiStudentGroupRemove({ id: row._id });
            if (res.data.code === 200) {
              message.success("删除成功");
              getStudentGroupList();
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
          getStudentGroupList(params);
        }}
        onReset={getStudentGroupList}
        dateFormatter="string"
        headerTitle="班级列表"
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
            新建班级
          </Button>,
        ]}
      />

      <DrawerForm
        onOpenChange={setDrawerVisit}
        title="新建表单"
        formRef={drawer}
        open={drawerVisit}
        onFinish={async () => {
          const params = drawer.current?.getFieldValue()
          if (!params.students) {
            params.students = [] 
          }          
          const res = await apiStudentGroupCreate(params)
          if (res.data.code === 200) {
            message.success("新建班级成功");
            getStudentGroupList()
            return true;
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="name"
            label="班级名称"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            options={userList?.data.data.list.map((item) => ({
              label: item.username,
              value: item.username,
            }))}
            width="xs"
            name="teacher"
            label="老师"
            rules={[{ required: true }]}
          />
          
          <ProFormSelect
            options={classifyList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value,row) => {
              drawer.current?.setFieldValue("classify",row.label)
            }}
            width="xs"
            name="classify"
            label="科目"
            rules={[{ required: true }]}
          />

        </ProForm.Group>
        <ProForm.Group>
        <ProFormSelect
            options={studentList?.data.data.list.map((item) => ({
              label: item.username,
              value: item.username,
            }))}
            name="students"
            label="学生"
            mode="multiple"
          />
        </ProForm.Group>
      </DrawerForm>
    </div>
  );
};
