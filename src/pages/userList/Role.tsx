import React, { useEffect, useState } from "react";
import { Modal, Select, Form } from "antd";

import { apiUserUpdate, apiRoleList } from "../../services/index";
import type { userInfo } from "../../type";
interface Props {
  userInfo: userInfo;
  openRole: boolean;
  setOpenRole: (param: boolean) => void;
  refresh: () => void;
}
const Role: React.FC<Props> = (props) => {
  const [options, setOptions] = useState<any[]>([]);
  const [form] = Form.useForm();
  const getPermissionList = async () => {
    const res = await apiRoleList();
    setOptions(res.data.data.list);
  };

  useEffect(() => {
    if (props.openRole) {
      form.setFieldValue("role", props.userInfo.role);
    } else {
      form.resetFields();
    }
  }, [props.openRole]);

  useEffect(() => {
    getPermissionList();
  }, []);

  return (
    <div>
      <Modal
        title={"分配角色"}
        open={props.openRole}
        onOk={() => {
          const role = form.getFieldValue("role")
          // console.log(data);
          // const role = options.filter(item => {
          //   return data.includes(item.name)
          // })
          // console.log(role);
          apiUserUpdate({ id: props.userInfo._id, role }).then((res) => {
            props.refresh();
            props.setOpenRole(false);
          });
        }}
        onCancel={() => {
          props.setOpenRole(false);
        }}
      >
        <Form form={form}>
          <Form.Item name="role">
            <Select
              mode="multiple"
              fieldNames={{ label: "name", value: "_id" }}
              options={options}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Role;
