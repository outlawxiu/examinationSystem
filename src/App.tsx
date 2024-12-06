import React, { useState } from "react";
import style from "./App.module.scss";
import { useRoutes } from "react-router-dom";
import routes from "./router/index";
import {
  SmileOutlined,
  MoonOutlined,
  CustomerServiceOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { FloatButton, ConfigProvider, theme } from "antd";
import { useAppDispatch , useAppSelector } from './hooks/storeHook'
import { toggleTheme } from './store/setting'
const App = () => {
  const allRoutes = useRoutes(routes);
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState<boolean>(false);
  const isLight = useAppSelector(state => state.setting.isLight)
  return (
    <ConfigProvider
      theme={{
        algorithm: isLight ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
        <div className={`${style.whole}${isLight ? "" : " dark-theme"}`}>
          {allRoutes}
          <FloatButton.Group
            open={open}
            shape="circle"
            trigger="click"
            style={{ insetInlineEnd: 88 }}
            icon={<HeartOutlined />}
            onClick={() => setOpen(!open)}
          >
            <FloatButton icon={<CustomerServiceOutlined />} />
            <FloatButton icon={<SmileOutlined />} />
            <FloatButton
              icon={<MoonOutlined />}
              onClick={() => dispatch(toggleTheme(!isLight))}
            />
          </FloatButton.Group>
        </div>
    </ConfigProvider>
  );
};

export default App;
