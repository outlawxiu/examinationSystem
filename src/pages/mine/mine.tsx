import React, { useState, useRef, useEffect } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Flex, message, Upload, Space, Button, InputNumber } from "antd";
import type { GetProp, UploadProps } from "antd";
import { apiUserUpdate } from "../../services/index";
import { useAppDispatch, useAppSelector } from "../../hooks/storeHook";
import { getUser } from "../../store/user";
import type { ProDescriptionsActionType } from "@ant-design/pro-components";
import {
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProDescriptions,
} from "@ant-design/pro-components";
import FormItem from "antd/es/form/FormItem";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const mine: React.FC = () => {
  const dispatch = useAppDispatch();
  const actionRef = useRef<ProDescriptionsActionType>();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </button>
  );
  const [modalVisit, setModalVisit] = useState(false);
  useEffect(() => {
    if (userInfo?.avator) {
      setImageUrl(userInfo?.avator);
    }
  }, [userInfo]);
  return (
    <Flex wrap>
      <Upload
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        action="https://zyxcl.xyz/exam_api/profile"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
        ) : (
          uploadButton
        )}
      </Upload>
      <ProDescriptions
        actionRef={actionRef}
        dataSource={userInfo!}
        extra={
          <Button
            type="link"
            onClick={() => {
              setModalVisit(true);
            }}
          >
            <PlusOutlined />
            修改
          </Button>
        }
      >
        <ProDescriptions.Item label="用户名" dataIndex="username" />
        <ProDescriptions.Item label="性别" dataIndex="sex" />
        <ProDescriptions.Item label="年龄" dataIndex="age" />
        <ProDescriptions.Item label="邮箱" dataIndex="email" />
      </ProDescriptions>
      <ModalForm
        initialValues={userInfo!}
        title="个人信息"
        open={modalVisit}
        onFinish={async (values) => {
          const params = {
            id: userInfo?._id,
            ...values,
            avator: imageUrl,
          };
          const res = await apiUserUpdate(params);
          if (res.data.code === 200) {
            message.success("个人信息跟新成功");
            dispatch(getUser());
            return true;
          }
        }}
        onOpenChange={setModalVisit}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="username"
            label="用户名"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            width="xs"
            rules={[{ required: true }]}
            options={[
              {
                value: "男",
                label: "男",
              },
              {
                value: "女",
                label: "女",
              },
            ]}
            name="sex"
            label="性别"
          />
          <FormItem name="age" label="年龄" rules={[{ required: true }]}>
            <InputNumber min={0} max={999} defaultValue={userInfo?.age} />
          </FormItem>
          <ProFormText
            width="md"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            rules={[{ required: true }]}
          />
        </ProForm.Group>
      </ModalForm>
    </Flex>
  );
};

export default mine;
