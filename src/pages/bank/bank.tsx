import React, { useRef, useState } from "react";
import { ProTable } from "@ant-design/pro-components";
import { Button, message, Space, Table, Popconfirm } from "antd";
import { apiExamList } from "../../services/index";
import { useRequest } from "ahooks";
import type { ProColumns } from "@ant-design/pro-components";
import { apiExamRemove, apiExamDetail } from "../../services/index";
import PaperShow from "../../components/PaperShow/PaperShow.js";
export type TableListItem = {
  classify: string;
  createTime: number;
  creator: string;
  name: string;
  questions: string[];
  __v: number;
  _id: string;
};
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../assets/SourceHanSerifCN-SemiBold-normal.js";
export default () => {
  const { data: examList, run: getExamList } = useRequest(apiExamList);
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [drawerData, setDrawerData] = useState();
  const [paperInfo, setPaperInfo] = useState();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: "试卷名称",
      dataIndex: "name",
      key: "_id",
    },
    {
      title: "科目类型",
      dataIndex: "classify",
    },
    {
      title: "创建人",
      dataIndex: "creator",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "dateTime",
    },
    {
      title: "操作",
      dataIndex: "action",
      render(value, row) {
        return (
          <Space>
            <Popconfirm
              title="删除试卷"
              description="确定删除该试卷"
              okText="确定"
              cancelText="取消"
              onConfirm={async () => {
                const res = await apiExamRemove({ id: row._id });
                if (res.data.code === 200) {
                  message.success("试卷删除成功");
                  getExamList();
                }
              }}
            >
              <Button type="primary" danger>
                删除
              </Button>
            </Popconfirm>
            <Button
              onClick={async () => {
                const res = await apiExamDetail({ id: row._id });
                if (res.data.code === 200) {
                  setDrawerVisit(true);
                  setDrawerData(res.data.data);
                }else{
                  message.error("数据获取失败");
                }
              }}
            >
              预览
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ProTable<TableListItem>
        rowKey="_id"
        columns={columns}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
        }}
        tableAlertOptionRender={({ selectedRowKeys, selectedRows }) => {
          return (
            <Space size={16}>
              <a>批量删除</a>
              <a
                onClick={() => {
                  console.log(selectedRowKeys);
                  Promise.all(
                    selectedRowKeys.map((id) => apiExamDetail({ id }))
                  ).then((ress) => {
                    console.log(ress);
                    const datas = ress.map((res) => {
                      if (res.data.code === 200) {
                        return res.data.data;
                      }
                      return "数据获取失败";
                    });
                    datas.map((data) => {
                      (() => {
                        const doc = new jsPDF();
                        doc.setFont("SourceHanSerifCN-SemiBold", "normal");
                        autoTable(doc, {
                          tableWidth: "auto",
                          head: [
                            ["试卷名称", "科目", "题目", "创建者", "创建时间"],
                          ],
                          body: [
                            [
                              data.name,
                              data.classify,
                              data.creator,
                              data.questions
                                .map((question) => {
                                  if (!question) {
                                    return;
                                  }
                                  return `${
                                    question.question
                                  }\n ${question.options
                                    .map((option, index) => {
                                      return `${(index + 10)
                                        .toString(16)
                                        .toUpperCase()}:${option}\n`;
                                    })
                                    .join("")}\n`;
                                })
                                .join(""),
                              new Date(data.createTime).toLocaleDateString(),
                            ],
                          ],
                          styles: {
                            font: "SourceHanSerifCN-SemiBold",
                            fontStyle: "normal",
                          },
                        });
                        doc.save(`${data.name}.pdf`);
                      })();
                    });
                  });
                }}
              >
                导出数据
              </a>
            </Space>
          );
        }}
        dataSource={examList?.data.data.list}
        options={false}
        search={false}
        pagination={{
          pageSize: 5,
        }}
        headerTitle="批量操作"
      />
      <PaperShow
        drawerData={drawerData}
        drawerVisit={drawerVisit}
        setDrawerVisit={setDrawerVisit}
      ></PaperShow>
    </div>
  );
};
