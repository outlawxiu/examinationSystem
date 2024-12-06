import { lazy } from "react";
import RoutePermission from "./RoutePermission";
import { Navigate } from "react-router-dom";
const Home = lazy(() => import("../pages/home/home"));
const Login = lazy(() => import("../pages/login/login"));
const NotFound = lazy(() => import("../pages/notFound/notFound"));
const Welcome = lazy(() => import("../pages/weclome/welcome"));
const Record = lazy(() => import("../pages/record/record"));
const Create = lazy(() => import("../pages/create/create"));
const UserList = lazy(() => import("../pages/userList/userList"));
const MenuManage = lazy(() => import("../pages/menuManage/menuManage"));
const System = lazy(() => import("../pages/system/system"));
const Mine = lazy(() => import("../pages/mine/mine"));
const Forbidden = lazy(() => import("../pages/forbidden/forbidden"));
const Bank = lazy(() => import("../pages/bank/bank"));
const CreatePaper = lazy(() => import("../pages/createPaper/createPaper"));
const GroupList = lazy(() => import("../pages/groupList/groupList"));
const GroupStudents = lazy(
  () => import("../pages/groupStudents/groupStudents")
);

const QuestionCreate = lazy(
  () => import("../pages/questionCreate/questionCreate")
);
const QuestionsBank = lazy(
  () => import("../pages/questionsBank/questionsBank")
);
const routes = [
  {
    path: "/",
    element: <Home></Home>,
    children: [
      {
        path: "/",
        element: <Navigate to="/welcome" replace></Navigate>,
      },
      {
        path: "/welcome",
        element: <Welcome></Welcome>,
      },
      {
        path: "/exam",
        children: [
          {
            path: "/exam/",
            element: <Navigate to="/exam/record" replace></Navigate>,
          },
          {
            path: "/exam/record",
            element: <Record></Record>,
          },
          {
            path: "/exam/create",
            element: <Create></Create>,
          },
        ],
      },
      {
        path: "/userManage",
        children: [
          {
            path: "/userManage/",
            element: <Navigate to="/userManage/personal" replace></Navigate>,
          },
          {
            path: "/userManage/manage-page",
            element: <UserList></UserList>,
          },
          {
            path: "/userManage/system",
            element: <System></System>,
          },
          {
            path: "/userManage/menuManage",
            element: <MenuManage></MenuManage>,
          },
          {
            path: "/userManage/personal",
            element: <Mine></Mine>,
          },
        ],
      },
      {
        path: "/paper",
        children: [
          {
            path: "/paper/",
            element: <Navigate to="/paper/paper-bank" replace></Navigate>,
          },
          {
            path: "/paper/paper-bank",
            element: <Bank></Bank>,
          },
          {
            path: "/paper/create-paper",
            element: <CreatePaper></CreatePaper>,
          },
        ],
      },
      {
        path: "/manage-group",
        children: [
          {
            path: "/manage-group/",
            element: (
              <Navigate to="/manage-group/group-list" replace></Navigate>
            ),
          },
          {
            path: "/manage-group/group-list",
            element: <GroupList></GroupList>,
          },
          {
            path: "/manage-group/group-students",
            element: <GroupStudents></GroupStudents>,
          },
        ],
      },
      {
        path: "/question",
        children: [
          {
            path: "/question/",
            element: <Navigate to="/question/item-bank" replace></Navigate>,
          },
          {
            path: "/question/item-bank",
            element: <QuestionsBank></QuestionsBank>,
          },
          {
            path: "/question/create-item",
            element: <QuestionCreate></QuestionCreate>,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/forbidden",
    element: <Forbidden></Forbidden>,
  },
  {
    path: "*",
    element: <NotFound></NotFound>,
  },
];
const formatRoutes = (routes) => {
  routes.forEach((item) => {
    if (item.isPermission) {
      item.element = <RoutePermission>{item.element}</RoutePermission>;
    }
    if (item.children) {
      item.children = formatRoutes(item.children);
    }
  });
  return routes;
};

export default formatRoutes(routes);
