import React from "react";
import { Button, Result } from "antd";
import { NavLink } from "react-router-dom";

const App: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <NavLink to="/" replace>
        <Button type="primary">返回首页</Button>
      </NavLink>
    }
  />
);

export default App;
