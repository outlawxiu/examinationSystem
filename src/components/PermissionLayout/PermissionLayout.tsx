import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

interface Props {
  permission: string
  children: React.ReactNode
}
import type { userInfo} from '../../type'
const PermissionLayout: React.FC<Props> = ({
  permission,
  children
}) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo as userInfo)
  if (userInfo?.permission!.find(v => v.path === permission)) {
    return children
  }
  return null
}

export default PermissionLayout