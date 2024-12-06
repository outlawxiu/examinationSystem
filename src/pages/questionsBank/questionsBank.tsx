import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, message, Space, Table, Popconfirm } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRequest } from "ahooks";
import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import {
  apiQuestionList,
  apiQuestionRemove,
  apiQuestionUpdate,
  apiQuestionCreate,
  apiClassifyList,
  apiQuestionTypeList,
} from "../../services/index";
export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

interface GithubIssueItem {
  answer: string;
  classify: string;
  options: string[];
  question: string;
  type: string;
  desc?: string;
  __v: number;
  _id: string;
}

export default () => {
  const { data: classifyList, run: getClassifyList } =
    useRequest(apiClassifyList);
  const { data: questionTypeList, run: getQuestionTypeList } =
    useRequest(apiQuestionTypeList);
  const { data: questionList, run: getQuestionList } =
    useRequest(apiQuestionList);
  const actionRef = useRef<ActionType>();
  const classifyValueEnum = useMemo(() => {
    const res = {};
    classifyList?.data.data.list.forEach((item) => {
      res[item.name] = { text: item.name };
    });
    return res;
  }, [classifyList]);
  const questionTypeValueEnum = useMemo(() => {
    const res = {};
    questionTypeList?.data.data.list.forEach((item) => {
      res[item.value] = { text: item.name };
    });
    return res;
  }, [questionTypeList]);

  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: "题目",
      dataIndex: "question",
    },
    {
      title: "学科",
      dataIndex: "classify",
      key: "classify",
      valueType: "select",
      valueEnum: classifyValueEnum,
    },
    {
      title: "题型",
      dataIndex: "type",
      valueType: "select",
      key: "type",
      valueEnum: questionTypeValueEnum,
      render(value, row) {
        if (row.type === "1") {
          return "单选题";
        } else if (row.type === "2") {
          return "多选题";
        } else if (row.type === "3") {
          return "判断题";
        } else if (row.type === "4") {
          return "填空题";
        }
      },
    },
    {
      title: "操作",
      dataIndex: "actions",
      render(value, row) {
        return (
          <Popconfirm
            title="删除"
            description="确定删除该题吗?"
            okText="确定"
            cancelText="取消"
            onConfirm={async () => {
              const res = await apiQuestionRemove({ id: row._id });
              if (res.data.code === 200) {
                message.success("删除成功");
                getQuestionList();
              }
            }}
          >
            <a type="primary">删除</a>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        dataSource={questionList?.data.data.list}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
        }}
        rowKey="_id"
        search={{
          labelWidth: "auto",
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 15, 20],
          hideOnSinglePage: true,
        }}
        onSubmit={(params) => {
          getQuestionList(params);
        }}
        onReset={getQuestionList}
        tableAlertOptionRender={({ onCleanSelected, selectedRows }) => {
          return (
            <Space>
              <a onClick={onCleanSelected}>取消选择</a>
              <a
                onClick={() => {
                  console.log(selectedRows);
                  (() => {
                    const headers = [
                      "科目",
                      "题目",
                      "选项",
                      "答案",
                      "题型",
                      "描述",
                    ];
                    const ws_data = [
                      headers,
                      ...selectedRows.map((item) => {
                        const classify = item.classify;
                        const question = item.question;
                        let options = item.options;
                        if (Array.isArray(options)) {
                          options = options.map((item) => item).join("\n");
                        }
                        let answer = item.answer;
                        if (Array.isArray(answer)) {
                          answer = answer.map((item) => item).join("\n");
                        }
                        let type = item.type;
                        if (type === "1") {
                          type = "单选题";
                        } else if (type === "2") {
                          type = "多选题";
                        } else if (type === "3") {
                          type = "判断题";
                        } else if (type === "4") {
                          type = "填空题";
                        }
                        let desc = item.desc;
                        return [
                          classify,
                          question,
                          options,
                          answer,
                          type,
                          desc,
                        ];
                      }),
                    ];
                    // 将数据转换为工作表
                    const ws = XLSX.utils.aoa_to_sheet(ws_data);
                    // 创建一个工作簿并附加工作表
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                    // 生成Excel文件并触发下载
                    const wbout = XLSX.write(wb, {
                      bookType: "xlsx",
                      type: "array",
                    });
                    const blob = new Blob([wbout], {
                      type: "application/octet-stream",
                    });
                    FileSaver.saveAs(blob, "data.xlsx");
                  })();
                }}
              >
                批量导出Excel
              </a>
            </Space>
          );
        }}
        dateFormatter="string"
        headerTitle="试题列表"
        toolBarRender={false}
      />
    </div>
  );
};
