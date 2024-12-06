import type { ProFormInstance } from "@ant-design/pro-components";
import {
  ProCard,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
  ModalForm,
  ProTable,
  ProDescriptions,
} from "@ant-design/pro-components";
import { message, Segmented, Space, Button, InputNumber, Table } from "antd";
import react, { useEffect, useRef, useState } from "react";
import {
  apiClassifyList,
  apiExamCreate,
  apiQuestionList,
} from "../../services/index";
import { useRequest } from "ahooks";
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
  const { data: classifyList } = useRequest(apiClassifyList);
  const [questionList, setQuestionList] = useState();
  const [paperInfo, setPaperInfo] = useState({});
  const [paperMethod, setPaperMethod] = useState(true);
  const [questionsNumber, setQuestionsNumber] = useState(0);
  const [modalVisit, setModalVisit] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState();
  const protable = useRef();
  const getQuestionList = async (params) => {
    const res = await apiQuestionList(params);
    if (res.data.code === 200) {
      setQuestionList(res.data.data.list);
    }
  };

  const columns = [
    {
      title: "题干",
      dataIndex: "question",
      key: "_id",
    },
    {
      title: "题型",
      dataIndex: "type",
      render(value, row) {
        if (row.type === 1) {
          return "单选题";
        } else if (row.type === 2) {
          return "多选题";
        } else if (row.type === 3) {
          return "判断题";
        } else if (row.type === 4) {
          return "填空题";
        }
      },
    },
  ];

  return (
    <ProCard>
      <StepsForm
        stepsProps={{
          direction: "vertical",
        }}
        formRef={formRef}
        onFinish={async () => {
          const res = await apiExamCreate(paperInfo);
          if (res.data.code === 200) {
            await waitTime(1000);
            message.success("试卷已创建");
            navigate("/paper/paper-bank");
          } else {
            message.error("提交成功");
          }
        }}
        formProps={{
          validateMessages: {
            required: "此项为必填项",
          },
        }}
      >
        <StepsForm.StepForm
          name="base"
          title="创建试卷"
          stepProps={{
            description: "请填写试卷基本信息",
          }}
          onFinish={async () => {
            setPaperInfo({ name: formRef.current?.getFieldValue("name") });
            await waitTime(2000);
            return true;
          }}
        >
          <ProFormText
            name="name"
            label="试卷名称"
            width="md"
            placeholder="请输入试卷名称"
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            name="remark"
            label="备注"
            width="lg"
            placeholder="请输入备注"
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="step2"
          title="配置试卷题目"
          stepProps={{
            description: "请选择组卷方式,配置试卷题目",
          }}
          onFinish={async () => {
            if (!paperInfo.questions || !paperInfo.questions.length) {
              message.error("还未配置试卷试题");
              return false;
            }
            setPaperInfo((prev) => ({
              ...prev,
              classify: formRef.current?.getFieldValue("classify"),
            }));
            return true;
          }}
        >
          <ProFormSelect
            name="classify"
            label="请选择科目"
            rules={[{ required: true }]}
            options={classifyList?.data.data.list.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value, row) => {
              formRef.current?.setFieldValue("classify", row.label);
              getQuestionList({ classify: row.label });
            }}
          ></ProFormSelect>

          <Segmented
            options={[
              { label: "选择组卷", value: true },
              { label: "随机组卷", value: false },
            ]}
            onChange={(value) => {
              setPaperMethod(value);
            }}
          />
          <br />
          {paperMethod ? (
            <Space style={{ margin: "20px 0" }}>
              <Button
                type="primary"
                onClick={() => {
                  setModalVisit(true);
                }}
              >
                选择试题
              </Button>
            </Space>
          ) : (
            <Space style={{ margin: "20px 0" }}>
              试题数量:
              <InputNumber
                name="questionNumber"
                min={0}
                max={questionList?.length}
                value={questionsNumber}
                onChange={(value) => {
                  setQuestionsNumber(value);
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  if (!formRef.current?.getFieldValue("classify")) {
                    return message.error("请选择科目");
                  }
                  if (!questionsNumber) {
                    return message.error("请选择考题数量");
                  }
                  const questions = [];
                  const datas = JSON.parse(JSON.stringify(questionList));
                  while (questions.length < questionsNumber) {
                    questions.push(...
                      datas.splice(
                        Math.ceil(Math.random() * datas.length - 1),
                        1
                      )
                    );
                  }
                  setPaperInfo((prev) => ({ ...prev, questions }));
                }}
              >
                随机匹配考题
              </Button>
            </Space>
          )}
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="step3"
          title="试卷信息"
          stepProps={{
            description: "请校验试卷信息并提交",
          }}
          onFinish={async () => {
            return true;
          }}
        >
          {paperInfo?.questions && (
            <ProDescriptions column={1} title="试卷信息" dataSource={paperInfo}>
              <ProDescriptions.Item dataIndex="name" />
              <ProDescriptions.Item dataIndex="classify" label="考试科目" />
              {paperInfo?.questions?.map((item) => {
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
                      {Array.isArray(item.options) ? item.options.map((option, index) => (
                        <li key={index}>
                          {(index + 10).toString(16).toUpperCase()} {option}
                        </li>
                      )) : item.options}
                    </ul>
                    <b>
                      答案:
                      {item.answer}
                    </b>
                  </div>
                );
              })}
            </ProDescriptions>
          )}
        </StepsForm.StepForm>
      </StepsForm>
      <ModalForm
        title="选择试题"
        open={modalVisit}
        onFinish={async () => {
          setPaperInfo((prev) => ({ ...prev, questions: selectedQuestions }));
          message.success("提交成功");
          return true;
        }}
        onOpenChange={setModalVisit}
      >
        <ProTable
          actionRef={protable}
          rowKey="_id"
          columns={columns}
          dataSource={questionList}
          options={false}
          search={false}
          pagination={{
            pageSize: 5,
          }}
          rowSelection={{
            selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedQuestions(selectedRows);
            },
          }}
          headerTitle="批量操作"
        />
      </ModalForm>
    </ProCard>
  );
};
