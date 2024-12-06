import React from 'react'
import { Button, Result } from 'antd'
import {
  Link
} from 'react-router-dom'

const Forbidden = () => {
  return (
    <Result
        status="403"
        title="403"
        subTitle="没有权限访问此页面，请联系管理员申请！"
        extra={<Link to="/"><Button type="primary">去首页</Button></Link>}
      />
  )
}

export default Forbidden