import React, { startTransition, useEffect, useRef, useState } from "react";
import {
  apiRoleList,
  apiRoleRemove,
  apiRoleCreate,
  apiRoleUpdate,
  apiPermissionList,
} from "../../services/index";
import { useRequest } from "ahooks";
import { Button, Input, Space, message, Tree, Table } from "antd";
import type { ProColumns } from "@ant-design/pro-components";
import { ProTable, ModalForm, DrawerForm } from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import FormItem from "antd/es/form/FormItem";

interface TableListItem {
  permission: string[];
  value: string;
  __v: number;
  name: string;
  creator: string;
  createTime: number;
  _id: string;
}
interface permission {
  children: permission[];
  createTime: number;
  disabled: boolean;
  isBtn: boolean;
  name: string;
  path: string;
  pid: string;
  __v: number;
  _id: string;
}

const system = () => {
  const { data: permissionList } = useRequest(apiPermissionList);
  const { data: roleList, run: reGetroleList } = useRequest(apiRoleList);
  const [roleInfo, setRoleInfo] = useState<TableListItem>();
  const [modalVisit, setModalVisit] = useState(false);
  const [defaultCheckedKeys, setDefaultCheckedKeys] = useState({
    checked: [],
    halfChecked: [],
  });
  const getDeafultValue = (record:TableListItem) => {
    setRoleInfo(() => record);
    setDefaultCheckedKeys(() => {
      const obj = {
        checked: [],
        halfChecked: [],
      };
      permissionList?.data.data.list.forEach((item) => {
        const cur = record?.permission.includes(item._id);
        if (cur) {
          if (
            item.children.every((children) =>
              record?.permission.includes(children._id)
            )
          ) {
            obj.checked.push(
              item._id,
              ...item.children.map((children) => children._id)
            );
          } else {
            obj.halfChecked.push(item._id);
            obj.checked.push(
              ...item.children
                .filter((children) =>
                  record?.permission.includes(children._id)
                )
                .map((item) => item._id)
            );
          }
        }
      });
      return obj;
    });
    setModalVisit(() => {
      return true;
    });
  };
  useEffect(() => {
    if (!modalVisit) {
      setDefaultCheckedKeys(null);
    }
  }, [modalVisit]);
  const columns: ProColumns<TableListItem>[] = [
    {
      title: "角色",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "创建人",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      valueType: "dateTime",
    },
    {
      title: "操作",
      dataIndex: "actions",
      key: "actions",
      width: 200,
      render: (value, record) => {
        return (
          <Space>
            <Button type="primary" onClick={() => getDeafultValue(record)}>
              分配权限
            </Button>
            <Button
              type="primary"
              danger
              onClick={async () => {
                const res = await apiRoleRemove({ id: record._id });
                if (res.data.code === 200) {
                  message.success("删除角色成功");
                  reGetroleList();
                }
              }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ModalForm<{
        username: string;
        value: string;
      }>
        labelCol={{ span: 6 }}
        width={500}
        layout="horizontal"
        title="新建角色"
        trigger={
          <Button type="primary">
            <PlusOutlined />
            新建角色
          </Button>
        }
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async (values) => {
          try {
            const res = await apiRoleCreate({
              name: values.username,
              value: values.value,
            });
            if (res.data.code === 200) {
              message.success("新建角色成功");
              reGetroleList();
            } else {
              message.success(res.data.msg);
            }
            return true;
          } catch (error) {}
        }}
      >
        <FormItem
          name="username"
          label="角色名称"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="请输入角色名称" />
        </FormItem>
        <FormItem
          name="value"
          label="角色关键字"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="请输入角色关键字" />
        </FormItem>
      </ModalForm>
      <ProTable
        columns={columns}
        request={async () => {
          const res = await apiRoleList();
          return {
            data: res.data.data.list,
          };
        }}
        search={false}
        options={false}
        pagination={{
          hideOnSinglePage: true,
        }}
      />
      <DrawerForm
        width={400}
        title="新建表单"
        open={modalVisit}
        clearOnDestroy={true}
        onFinish={async () => {
          const permission = [
            ...defaultCheckedKeys.checked,
            ...defaultCheckedKeys.halfChecked,
          ];
          const res = await apiRoleUpdate({ id: roleInfo?._id, permission });
          if (res.data.code === 200) {
            message.success("权限分配成功");
            setDefaultCheckedKeys(null);
            reGetroleList();
            return true;
          }
        }}
        onOpenChange={setModalVisit}
      >
        <Tree
          checkable
          checkedKeys={defaultCheckedKeys}
          defaultExpandedKeys={roleInfo?.permission}
          fieldNames={{ title: "name", key: "_id" }}
          treeData={permissionList?.data.data.list}
          onCheck={(value, { checkedNodes, halfCheckedKeys }) => {
            setDefaultCheckedKeys({
              checked: checkedNodes.map((item) => item._id),
              halfChecked: halfCheckedKeys,
            });
          }}
        />
      </DrawerForm>
    </div>
  );
};

export default system;
