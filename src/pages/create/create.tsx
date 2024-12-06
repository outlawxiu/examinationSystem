import type { ProFormInstance } from "@ant-design/pro-components";
import {
  ProCard,
  ProFormDateTimeRangePicker,
  ProFormSelect,
  ProFormText,
  ProDescriptions,
  ProTable,
  StepsForm,
} from "@ant-design/pro-components";
import { message } from "antd";
import { useRef } from "react";
import {
  apiClassifyList,
  apiUserList,
  apiStudentGroupList,
  apiExamList,
  apiExaminationCreate,
} from "../../services/index";
import { useRequest } from "ahooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
export default () => {
  const navigate = useNavigate();
  const formRef = useRef<ProFormInstance>();
  const { data: classifyList, run: getClassifyList } =
    useRequest(apiClassifyList);
  const { data: userList, run: getUserList } = useRequest(apiUserList);
  const { data: studentGroupList, run: getStudentGroupList } =
    useRequest(apiStudentGroupList);
  const { data: examList, run: getExamList } = useRequest(apiExamList);
  const [examInfo, setExamInfo] = useState({});
  const actionRef = useRef();
  const columns = [
    { title: "试卷名称", dataIndex: "name" },
    { title: "试卷创建人", dataIndex: "creator" },
    { title: "科目", dataIndex: "classify" },
    { title: "试卷创建时间", dataIndex: "createTime", valueType: "date" },
  ];
  return (
    <ProCard>
      <StepsForm
        formRef={formRef}
        onFinish={async () => {
          await waitTime(1000);
        }}
        formProps={{
          validateMessages: {
            required: "此项为必填项",
          },
        }}
      >
        <StepsForm.StepForm
          name="step1"
          title="创建考试"
          stepProps={{
            description: "考试基本信息",
          }}
          onFinish={async (...rest) => {
            const data = formRef.current?.getFieldsValue();
            setExamInfo((prev) => ({
              ...prev,
              name: data.name,
              classify: data.classify,
              examiner: data.examiner,
              group: data.group,
              startTime: data.time[0].$d * 1,
              endTime: data.time[1].$d * 1,
            }));
            await waitTime(2000);
            return true;
          }}
        >
          <ProFormText
            name="name"
            label="考试名称"
            placeholder="请输入考试名称"
            rules={[{ required: true }]}
          />
          <ProFormDateTimeRangePicker
            name="time"
            label="考试时间"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            label="科目分类"
            name="classify"
            width="sm"
            rules={[{ required: true }]}
            onChange={(value, row) => {
              formRef.current?.setFieldValue("classify", row.label);
            }}
            options={classifyList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
          />
          <ProFormSelect
            label="监考人"
            name="examiner"
            width="sm"
            rules={[
              {
                required: true,
              },
            ]}
            options={userList?.data.data.list.map((item) => ({
              label: item.username,
              value: item._id,
            }))}
            onChange={(value, row) => {
              formRef.current?.setFieldValue("examiner", row.label);
            }}
          />
          <ProFormSelect
            label="考试班级"
            name="group"
            width="sm"
            rules={[
              {
                required: true,
              },
            ]}
            options={studentGroupList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="step2"
          title="添加试卷"
          stepProps={{
            description: "请选择考试试卷",
          }}
          onFinish={async () => {
            if (!formRef.current?.getFieldValue("examId")) {
              message.error("请选择试卷");
              return false;
            }
            setExamInfo((prev) => ({
              ...prev,
              examId: formRef.current?.getFieldValue("examId"),
              examName: formRef.current?.getFieldValue("examName"),
            }));
            return true;
          }}
        >
          <ProTable
            rowKey="_id"
            search={false}
            toolBarRender={false}
            tableAlertRender={false}
            pagination={{ hideOnSinglePage: true }}
            rowSelection={{
              type: "radio",
              onChange: (examId, row) => {
                formRef.current?.setFieldValue("examId", examId[0]);
                formRef.current?.setFieldValue("examName", row[0].name);
              },
            }}
            columns={columns}
            dataSource={examList?.data.data.list.filter((item) => {
              return item.classify === examInfo.classify;
            })}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="step3"
          title="发布考试"
          stepProps={{
            description: "校验考试详细信息",
          }}
          onFinish={async () => {
            const params = {
              name: examInfo.name,
              classify: examInfo.classify,
              examId: examInfo.examId,
              group: examInfo.group,
              examiner: examInfo.examiner,
              startTime: examInfo.startTime,
              endTime: examInfo.endTime,
            };
            const res = await apiExaminationCreate(params);
            if (res.data.code === 200) {
              message.success("考试创建成功");
              navigate("/exam/record");
            }
          }}
        >
          <ProDescriptions
            column={1}
            title="考试信息"
            actionRef={actionRef}
            dataSource={examInfo}
          >
            <ProDescriptions.Item dataIndex="name" />
            <ProDescriptions.Item
              dataIndex="startTime"
              label="考试开始时间"
              valueType="dateTime"
            />
            <ProDescriptions.Item
              dataIndex="endTime"
              label="考试结束时间"
              valueType="dateTime"
            />
            <ProDescriptions.Item dataIndex="examiner" label="监考人" />
            <ProDescriptions.Item dataIndex="group" label="考试班级" />
            <ProDescriptions.Item dataIndex="examName" label="试卷" />
          </ProDescriptions>
        </StepsForm.StepForm>
      </StepsForm>
    </ProCard>
  );
};
