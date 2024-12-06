import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { useLocation, Navigate } from 'react-router-dom'

const RoutePermission: React.FC<{ children: React.ReactNode }> = (props) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const location = useLocation()

  // 用当前页面地址去权限列表中查找
  if (userInfo?.permission.find(v => v.path === location.pathname)) {
    return props.children
  }
  return <Navigate to="/forbidden" />
}

export default RoutePermission