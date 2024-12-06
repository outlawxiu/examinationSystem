import React, { useState } from "react";
import {
  apiClassifyList,
  apiStudentGroupList,
  apiExaminationList,
  apiUserList,
  apiExaminationRemove,
  apiExamDetail,
} from "../../services/index";
import { useRequest } from "ahooks";
import { DownloadOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Button, message, Select, Space } from "antd";
import { useRef } from "react";
import type { examinationList } from "../../type";
import { DrawerForm } from "@ant-design/pro-components";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const statusSelect = new Map();
statusSelect.set(1, { text: "已结束" });
statusSelect.set(2, { text: "未开始" });
statusSelect.set(3, { text: "进行中" });

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

const record = () => {
  const pageRef = useRef(null);
  const { data: classifyList } = useRequest(apiClassifyList);
  const { data: studentGroupList } = useRequest(apiStudentGroupList);
  const { data: examinationList, run: getExaminationList } =
    useRequest(apiExaminationList);
  const { data: userList, run: getUserList } = useRequest(apiUserList);
  const actionRef = useRef<ActionType>();
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [drawerData, setDrawerData] = useState();
  const columns: ProColumns<examinationList>[] = [
    {
      title: "考试名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "科目分类",
      dataIndex: "classify",
      key: "classify",
      renderFormItem(schema, config, form, action) {
        return (
          <Select
            options={classifyList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            placeholder="请选择"
            onChange={(value, row) => {
              form.setFieldValue("classify", row.label);
            }}
          ></Select>
        );
      },
    },
    {
      title: "创建者",
      dataIndex: "creator",
      key: "creator",
      renderFormItem(schema, config, form, action) {
        return (
          <Select
            options={userList?.data.data.list.map((item) => ({
              label: item.username,
              value: item._id,
            }))}
            placeholder="请选择"
            onChange={(value, row) => {
              form.setFieldValue("creator", row.label);
            }}
          ></Select>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      valueType: "dateTime",
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      valueType: "dateTime",
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      key: "endTime",
      valueType: "dateTime",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      valueType: "select",
      render(value, row) {
        if (row.status === 1) {
          return "已结束";
        } else if (row.status === 3) {
          return "进行中";
        } else if (row.status === 2) {
          return "未开始";
        }
      },
      valueEnum: () => {
        return statusSelect;
      },
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => (
        <Space>
          <Button
            type="text"
            onClick={async () => {
              const res = await apiExamDetail({ id: record.examId });
              if (res.data.code === 200) {
                setDrawerVisit(true);
                setDrawerData(res.data.data);
              } else {
                message.error("试卷不存在");
              }
            }}
          >
            查看
          </Button>
          <Button
            type="text"
            onClick={async () => {
              const params = { id: record._id };
              const res = await apiExaminationRemove(params);
              if (res.data.code === 200) {
                message.success("删除成功");
                actionRef.current?.reset();
                getExaminationList();
              }
            }}
            disabled={record.status !== 2}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const handleDownloadPdf = async () => {
    const pageElement = pageRef.current;
    if (pageElement) {
      const canvas = await html2canvas(pageElement);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save("试卷.pdf");
    }
  };
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ProTable
        rowKey="_id"
        columns={columns}
        actionRef={actionRef}
        dataSource={examinationList?.data.data.list}
        cardBordered
        search={{
          labelWidth: "auto",
        }}
        onSubmit={(params) => {
          getExaminationList(params);
        }}
        onReset={() => {
          getExaminationList();
          actionRef.current?.reset();
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 5,
          pageSizeOptions: [5, 10, 15, 20],
        }}
        dateFormatter="string"
        toolbar={undefined}
        toolBarRender={false}
      />
      <DrawerForm
        onOpenChange={setDrawerVisit}
        title="新建表单"
        drawerProps={{
          extra: (
            <Button
              type="primary"
              shape="round"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPdf}
            >
              导出PDF
            </Button>
          ),
        }}
        open={drawerVisit}
        submitter={{
          render: (props, defaultDoms) => {
            return [defaultDoms[1]];
          },
        }}
        onFinish={async () => {
          return true;
        }}
      >
        <div
          ref={pageRef}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "30px",
          }}
        >
          <ProDescriptions column={1} title="试卷信息" dataSource={drawerData}>
            <ProDescriptions.Item dataIndex="name" />
            <ProDescriptions.Item dataIndex="classify" label="考试科目" />
            {drawerData?.questions.map((item) => {
              if (!item) {
                return "";
              }
              return (
                <div>
                  <h3>
                    题目:{item.question} {item.type === 1 && "单选题"}
                    {item.type === 2 && "多选题"}
                    {item.type === 3 && "判断题"}
                  </h3>
                  <ul>
                    {item.options.map((option, index) => (
                      <li key={index}>
                        {(index + 10).toString(16).toUpperCase()} {option}
                      </li>
                    ))}
                  </ul>
                  <b>
                    答案:
                    {Array.isArray(item.answer)
                      ? item.answer.map((a) => a)
                      : item.answer}
                  </b>
                </div>
              );
            })}
          </ProDescriptions>
        </div>
      </DrawerForm>
    </div>
  );
};

export default record;
