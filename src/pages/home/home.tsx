import { PageContainer, ProCard, ProLayout } from "@ant-design/pro-components";
import { startTransition, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/storeHook";
import { getUser } from "../../store/user";
import {
  ProfileFilled,
  SmileFilled,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Spin, Dropdown } from "antd";
interface listItem {
  path: string;
  name: string;
  component: string;
  icon?: unknown;
  children?: listItem[];
}

const format = (list: listItem[]): listItem[] | undefined => {
  if (list.length === 0) return;
  return list.map((item) => {
    const componentStr = item.path.split("/")[1];
    if (item.children) {
      return {
        path: item.path,
        name: item.name,
        component:
          "./" + componentStr[0].toUpperCase() + componentStr.substring(1),
        icon: <ProfileFilled />,
        routes: format(item.children),
      };
    }
    return {
      path: item.path,
      name: item.name,
      component:
        "./" + componentStr[0].toUpperCase() + componentStr.substring(1),
    };
  });
};

const Home = () => {
  const [pathname, setPathname] = useState("/welcome");
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const menulist = useAppSelector((state) => state.user.menulist);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    dispatch(getUser());
    startTransition(() => {
      setPathname(location.pathname);
    });
  }, [location]);
  return (
    <div
      id="test-pro-layout"
      style={{
        height: "100vh",
      }}
    >
      <ProLayout
        siderWidth={256}
        bgLayoutImgList={[
          {
            src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
            left: 85,
            bottom: 100,
            height: "303px",
          },
          {
            src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
            bottom: -68,
            right: -45,
            height: "303px",
          },
          {
            src: "https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png",
            bottom: 0,
            left: 0,
            width: "331px",
          },
        ]}
        route={{
          path: "/",
          routes: [
            {
              path: "/welcome",
              name: "欢迎",
              icon: <SmileFilled />,
              component: "/Welcome",
            } as listItem,
          ].concat(format(menulist)!),
        }}
        location={{
          pathname,
        }}
        avatarProps={{
          src:
            userInfo?.avator ||
            "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
          title: userInfo?.username,
          render: (props, dom) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: (
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            navigate("/login");
                            localStorage.removeItem("token");
                          }}
                        >
                          退出登录
                        </Link>
                      ),
                    },
                    {
                      key: "mine",
                      icon: <UserOutlined />,
                      label: <Link to={"/userManage/personal"}>个人信息</Link>,
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              startTransition(() => {
                navigate(item.path!);
                setPathname(item.path!);
              });
            }}
          >
            {dom}
          </div>
        )}
      >
        <PageContainer>
          <ProCard
            style={{
              minHeight: 800,
              padding: 20,
              overflow: "auto",
            }}
          >
            {
              <Suspense
                fallback={
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Spin tip="Loading" size="large" />
                  </div>
                }
              >
                <Outlet></Outlet>
              </Suspense>
            }
          </ProCard>
        </PageContainer>
      </ProLayout>
    </div>
  );
};
export default Home;
