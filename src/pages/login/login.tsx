import {
  LockOutlined,
  UserOutlined
} from "@ant-design/icons";
import style from "./login.module.scss";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { apiLoginCaptcha } from "../../services/index";
import { Form, Input , message } from "antd";
import type { loginParams } from "../../type";
import { apiLogin } from '../../services/index'
import { replace, useNavigate } from "react-router-dom";

const Page = () => {
  const navigate = useNavigate()
  const [codeSrc, setCodeSrc] = useState("");
  const refresh = async () => {
    const res = await apiLoginCaptcha();
    setCodeSrc(res.data.data.code);
  };
  const login = async (value:loginParams) => {
    const res = await apiLogin(value)
    if (res.data.code === 200) {
      localStorage.setItem("token",res.data.data.token)
      navigate("/")
    }else {
      message.error(res.data.msg)
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        logo="https://github.githubassets.com/favicons/favicon.png"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Github"
        subTitle="全球最大的代码托管平台"
        actions={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column"
            }}
          ></div>
        }
        onFinish={login}
      >
        <ProFormText
        name="username"
          fieldProps={{
            size: "large",
            prefix: <UserOutlined className={"prefixIcon"} />,
          }}
          placeholder={"请输入用户名"}
          rules={[
            {
              required: true,
              message: "请输入用户名!",
            },
          ]}
        />
        <ProFormText.Password
                name="password"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined className={"prefixIcon"} />,
          }}
          placeholder={"请输入密码"}
          rules={[
            {
              required: true,
              message: "请输入密码！",
            },
          ]}
        />
        <Form.Item
          name="code"
          rules={[
            {
              required: true,
              message: "请输入验证码！",
            },
          ]}
        >
          <div className={style.code}>
            <Input size="large" placeholder="输入验证码" />
            <img onClick={refresh} src={codeSrc} alt="" />
          </div>
        </Form.Item>
      </LoginFormPage>
    </div>
  );
};

export default () => {
  return <Page />;
};
