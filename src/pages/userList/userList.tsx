import React, { useEffect, useRef, useState } from "react";
import type { PopconfirmProps } from "antd";
import type { ProFormInstance } from "@ant-design/pro-components";
import {
  apiUserList,
  apiUserUpdate,
  apiUserCreate,
  apiUserRemove,
} from "../../services/index";
import PermissionLayout from "../../components/PermissionLayout/PermissionLayout";
import { message, Select, Space } from "antd";
import type { userInfo, editUserInfo, userCreateParams } from "../../type";
import type { ProColumns } from "@ant-design/pro-components";
import { ProTable, ProForm } from "@ant-design/pro-components";
import Role from "./Role";
import { Button, Image, Switch, Modal, Form, Input, Popconfirm } from "antd";
const confirm: PopconfirmProps["onConfirm"] = (e) => {
  message.success("删除成功");
};
const cancel: PopconfirmProps["onCancel"] = (e) => {
  message.error("取消删除");
};
interface userUpdateParams {
  confirmPassword: string;
  id: string;
  password: string;
  status: 1 | 0;
  username: string;
}
const userList = () => {
  const [params, setParams] = useState({
    page: 1,
    pagesize: 5,
  });
  const [searchParams, setSearchParams] = useState({});
  const [roleList, setRoleList] = useState<string[]>();
  const columns: ProColumns<userInfo>[] = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      fixed: "left",
    },
    {
      title: "头像",
      dataIndex: "avator",
      key: "avator",
      valueType: "option",
      render: (value, record) => {
        return (
          <>
            {record.avator ? (
              <Image src={record.avator} style={{ width: 100 }}></Image>
            ) : null}
          </>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render(value, record) {
        return (
          <Switch
            disabled={record.username === "root"}
            defaultChecked={record.status ? true : false}
            onChange={(value) => {
              eoc({ id: record._id, status: value ? 1 : 0 });
            }}
          />
        );
      },
      renderFormItem() {
        return (
          <Select
            options={[
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ]}
          />
        );
      },
    },
    {
      title: "密码",
      dataIndex: "password",
      key: "password",
      renderFormItem: () => undefined,
    },
    {
      title: "创建者",
      dataIndex: "creator",
      key: "creator",
      copyable: true,
    },
    {
      title: "登陆时间",
      dataIndex: "lastOnlineTime",
      key: "lastOnlineTime",
      valueType: "dateTime",
      renderFormItem(schema, config, form, action) {
        return undefined;
      },
    },
    {
      title: "操作",
      width: 180,
      key: "action",
      fixed: "right",
      valueType: "option",
      render(value, record) {
        return (
          <Space size="small">
            <Button
              type="primary"
              onClick={() => {
                setOpenRole(true);
                setUserInfo(record);
              }}
              disabled={record.username === "root"}
            >
              分配角色
            </Button>
            <Button
              disabled={record.username === "root"}
              onClick={() => {
                setOpen(true);
                setIsEdit(true);
                const value = {
                  id: record._id,
                  username: record.username!,
                  password: record.password!,
                  confirmPassword: record.password!,
                  status: record.status!,
                };
                setEditData({ ...value });
                formRef.current!.setFieldsValue(value);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="删除"
              description="你确定要删除该项吗?"
              onConfirm={() => {
                apiUserRemove({ id: record._id }).then((res) => {
                  if (res.data.code === 200) {
                    table.current!.submit();
                    confirm();
                    setParams((prev) => ({
                      page: 1,
                      pagesize: prev.pagesize,
                    }));
                  }
                });
              }}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <PermissionLayout permission="delUser">
                <Button
                  disabled={record.username === "root"}
                  type="primary"
                  danger
                >
                  删除
                </Button>
              </PermissionLayout>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const table = useRef<ProFormInstance>();
  const formRef = useRef<ProFormInstance>();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<userUpdateParams>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const eoc = (params: editUserInfo) => {
    return apiUserUpdate(params);
  };
  const onOk = () => {
    if (!isEdit) {
      try {
        setConfirmLoading(true);
        formRef.current!.validateFields().then(() => {
          apiUserCreate(formRef.current?.getFieldsValue()).then((res) => {
            if (res.data.code === 200) {
              message.success(res.data.msg);
              setOpen(false);
              formRef.current!.resetFields();
              table.current!.submit();
              setParams((prev) => ({
                page: 1,
                pagesize: prev.pagesize,
              }));
            } else {
              message.error(res.data.msg);
            }
          });
        });
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    } else {
      try {
        setConfirmLoading(true);
        formRef.current!.validateFields().then(() => {
          const data = formRef.current!.getFieldsValue();
          eoc({
            id: editData!.id,
            password: data.password,
            username: data.username,
            status: data.status,
          }).then(() => {
            message.success("更新成功");
            formRef.current?.resetFields();
            setOpen(false);
            table.current!.submit();
            setParams((prev) => ({
              page: 1,
              pagesize: prev.pagesize,
            }));
          });
        });
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    }
  };
  const refresh = () => {
    table.current!.submit();
    setParams((prev) => ({
      page: 1,
      pagesize: prev.pagesize,
    }));
  };
  const [openRole, setOpenRole] = useState(false);
  const [userInfo, setUserInfo] = useState<userInfo>();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ProTable<userInfo>
        formRef={table}
        columns={columns}
        onChange={({ current, pageSize }) => {
          setParams(() => ({
            page: current!,
            pagesize: pageSize!,
          }));
        }}
        onSubmit={(params) => {
          setSearchParams(params);
        }}
        onReset={() => {
          setSearchParams((prev) => ({ page: 1, pagesize: prev!.pagesize }));
        }}
        rowKey="_id"
        scroll={{ x: "max-content" }}
        pagination={{
          showQuickJumper: true,
          // total,
          showSizeChanger: true,
          pageSize: params.pagesize,
          pageSizeOptions: [5, 10, 15, 20],
        }}
        dateFormatter="string"
        toolbar={{
          title: "用户列表",
          tooltip: "如需更改,请联系管理员",
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setIsEdit(false);
              setOpen(true);
            }}
          >
            新增用户
          </Button>,
        ]}
        request={async () => {
          const res = await apiUserList({ ...params, ...searchParams });
          if (res.data.code !== 200) {
            message.error(res.data.msg);
            return {};
          } else {
            // setUserList(res.data.data.list);
            // setTotal(res.data.data.total);
            return {
              data: res.data.data.list,
              total: res.data.data.total,
            };
          }
        }}
      />
      <Modal
        title={isEdit ? "编辑信息" : "新增用户"}
        open={open}
        onOk={onOk}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setOpen(false);
          formRef.current!.resetFields();
        }}
      >
        <ProForm
          layout="horizontal"
          formRef={formRef}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          labelWrap={true}
          submitter={false}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              {
                required: true,
                message: "请输入用户名!",
              },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              {
                required: true,
                message: "请输入密码!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请确认密码!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次密码不一致!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认密码" />
          </Form.Item>
          <Form.Item name="status" label="帐号状态">
            <Switch defaultChecked={true}></Switch>
          </Form.Item>
        </ProForm>
      </Modal>
      <Role
        userInfo={userInfo!}
        openRole={openRole}
        setOpenRole={setOpenRole}
        refresh={refresh}
      ></Role>
    </div>
  );
};
export default userList;
