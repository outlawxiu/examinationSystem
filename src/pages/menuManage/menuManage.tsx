import type { ProColumns } from "@ant-design/pro-components";
import { EditableProTable, ProTable } from "@ant-design/pro-components";
import React, { useEffect, useRef, useState } from "react";
import {
  apiPermissionList,
  apiPermissionUpdate,
  apiPermissionRemove,
  apiPermissionCreate,
} from "../../services/index";
import { message, Tag, Popconfirm, Button, Space, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  DrawerForm,
  ModalForm,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
interface DataSourceType {
  children?: DataSourceType[];
  createTime: number;
  disabled: boolean;
  isBtn: boolean;
  name: string;
  path: string;
  pid: string;
  __v: number;
  _id: string;
}
const myMap = new Map();
myMap.set(true, { text: "按钮类型" });
myMap.set(false, { text: "页面类型" });

const getAll = (
  arr: DataSourceType[],
  res: { label: string; value: string }[] = []
) => {
  arr.forEach((item) => {
    if (!item.isBtn) {
      res.push({ label: item.name, value: item.path + "/" });
    }
    if (item.children) {
      getAll(item.children, res);
    }
  });
  return res;
};
export default () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);
  const [list, setList] = useState([]);
  const [nowUrl, setNowUrl] = useState<{ label: string; value: string }>();
  const getDataSource = async () => {
    const res = await apiPermissionList();
    if (res.data.code === 200) {
      setDataSource(res.data.data.list);
    }
  };
  const delPermission = async (record) => {
    const res = await apiPermissionRemove({ id: record._id });
    if (res.data.code === 200) {
      message.success("删除成功");
      getDataSource();
    }
  };
  const columns: ProColumns<DataSourceType>[] = [
    {
      title: "菜单名称",
      dataIndex: "name",
    },
    {
      title: "菜单路径",
      dataIndex: "path",
    },
    {
      title: "权限类型",
      key: "isBtn",
      dataIndex: "isBtn",
      valueType: "select",
      valueEnum: myMap,
      render(value, record) {
        return record.isBtn ? (
          <Tag color="green">按钮权限</Tag>
        ) : (
          <Tag color="blue">页面权限</Tag>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "date",
      readonly: true,
    },
    {
      title: "操作",
      valueType: "option",
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          title="删除权限"
          description="你确定删除该权限吗"
          onConfirm={() => delPermission(record)}
          okText="确定"
          cancelText="取消"
        >
          <a key="delete">删除</a>
        </Popconfirm>,
      ],
    },
  ];
  const getPermissionList = async () => {
    const res = await apiPermissionList();
    const list = [
      {
        label: "新建一级菜单",
        value: "/",
      },
    ];
    setList(getAll(res.data.data.list, list));
    setNowUrl({
      label: "新建一级菜单",
      value: "/",
    });
  };
  const [drawerVisit, setDrawerVisit] = useState(false);
  useEffect(() => {
    getDataSource()
    getPermissionList();
  }, []);
  return (
    <>
      <EditableProTable<DataSourceType>
        rowKey="_id"
        headerTitle="菜单列表"
        recordCreatorProps={false}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              setDrawerVisit(true);
            }}
          >
            <PlusOutlined />
            添加菜单
          </Button>,
        ]}
        columns={columns}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: "multiple",
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const res = await apiPermissionUpdate({
              id: data._id,
              name: data.name,
              path: data.path,
              isBtn: data.isBtn,
            });
            if (res.data.code === 200) {
              message.success("菜单编辑成功");
            }
          },
          onDelete(key, row) {
            return delPermission(row);
          },
          onChange: setEditableRowKeys,
        }}
      />
      <DrawerForm
        onOpenChange={setDrawerVisit}
        title="新建表单"
        open={drawerVisit}
        width={450}
        onFinish={async (values) => {
          const params = {
            pid: "",
            name: values.name,
            disabled: values.disabled,
            isBtn: values.isBtn,
            path: values.level.value + values.path,
          };
          const res = await apiPermissionCreate(params);
          if (res.data.code) {
            message.success("创建成功");
            getDataSource();
            return true;
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            label={"菜单名称"}
            name="name"
            rules={[{ required: true }]}
            initialValue={"example"}
          />
          <ProFormSelect
            options={[
              { label: "禁用", value: true },
              { label: "启用", value: false },
            ]}
            name="disabled"
            label="菜单状态"
            rules={[{ required: true }]}
            initialValue={false}
          />
          <ProFormSelect
            options={[
              { label: "按钮权限", value: true },
              { label: "页面权限", value: false },
            ]}
            name="isBtn"
            label="权限类型"
            rules={[{ required: true }]}
            initialValue={false}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            options={list}
            name="level"
            label="选择菜单等级"
            rules={[{ required: true }]}
            initialValue={nowUrl}
            onChange={(value, row) => {
              setNowUrl(row["data-item"]);
            }}
          />
          <ProFormText
            label={"菜单路径"}
            name="path"
            rules={[{ required: true }]}
            addonBefore={nowUrl?.value}
            initialValue={"example"}
          />
        </ProForm.Group>
        <ProForm.Group></ProForm.Group>
      </DrawerForm>
    </>
  );
};
