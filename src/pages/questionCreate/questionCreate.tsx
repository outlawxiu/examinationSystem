import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Space, Segmented, Modal } from "antd";
import Dragger from "antd/es/upload/Dragger";
import React, { useEffect, useRef, useState } from "react";
import {
  apiQuestionCreateMultiple,
  apiQuestionTypeList,
  apiClassifyList,
  apiQuestionCreate,
} from "../../services/index";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useRequest } from "ahooks";
import {
  ProForm,
  ProFormDependency,
  ProFormGroup,
  ProFormSelect,
  ProFormText,
  ProFormRadio,
  ProFormCheckbox,
} from "@ant-design/pro-components";

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
interface Question {
  科目: string;
  题目: string;
  选项: string;
  答案: string;
  题型: string;
  描述: string;
}
const readExcelFile = (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // 假设Excel文件只有一个工作表，并且第一行是列头
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 将JSON数据转换为Question类型数组（跳过列头行）
      const question: Question[] = jsonData.slice(1).map((row) => {
        let classify = row[0];
        let question = row[1];
        let options = row[2].split("\n");
        let answer = row[3];
        let type = row[4];
        let desc = row[5];
        if (type === "单选题") {
          type = "1";
        } else if (type === "多选题") {
          type = "2";
        } else if (type === "判断题") {
          type = "3";
        } else if (type === "填空题") {
          type = "4";
        }
        return {
          classify,
          question,
          options,
          answer,
          type,
          desc,
        };
      });

      resolve(question);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

const questionCreate = () => {
  const [question, setQuestions] = useState<Question[]>([]);
  const [isUpload, setIsUpLoad] = useState(false);
  const { data: questionTypeList } = useRequest(apiQuestionTypeList);
  const { data: classifyList } = useRequest(apiClassifyList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dragger = useRef(null);
  const formRef = useRef();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Space style={{ width: "100%", padding: "30px 0" }}>
        <Segmented
          options={[
            { label: "手动添加", value: false },
            { label: "批量导入", value: true },
          ]}
          onChange={(value) => {
            setIsUpLoad(value);
          }}
        />
      </Space>
      <Modal
        title="继续添加提示"
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
        }}
        onCancel={() => {
          setIsModalOpen(false);
          navigate("/question/item-bank");
        }}
      >
        <p>是否要继续添加题目</p>
      </Modal>
      {isUpload && (
        <>
          <Dragger
            ref={dragger}
            maxCount={1}
            onChange={(info) => {
              const file = info.file.originFileObj;
              if (file) {
                // info.file.status = "done";
                // info.file.response = '{"status": "success"}';
                readExcelFile(file)
                  .then((data) => {
                    setQuestions(data);
                  })
                  .catch((error) => {
                    console.error("Error reading Excel file:", error);
                  });
              }
            }}
            onRemove={(...rest) => {
              console.log(rest);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖动文件到此区域上传</p>
            <p className="ant-upload-hint">仅支持上传单个文件</p>
          </Dragger>
          <Space style={{ width: "100%", padding: "30px 0" }}>
            <Button
              type="primary"
              onClick={async () => {
                if (question.length < 1) {
                  return message.info("还未添加试题");
                }
                const res = await apiQuestionCreateMultiple({ list: question });
                if (res.data.code === 200) {
                  message.success("批量添加成功");
                  navigate("/question/item-bank");
                }
              }}
            >
              提交
            </Button>
          </Space>
        </>
      )}
      {!isUpload && (
        <>
          <ProForm
            formRef={formRef}
            onFinish={async (values) => {
              const options = [values.A, values.B, values.C, values.D].filter(
                (item) => item
              );
              let answer = Array.isArray(values.answer)
                ? values.answer.map((item) => values[item]).join(",")
                : values[values.answer];
              const params = {
                question: values.question,
                type: values.type,
                classify: values.classify,
                options,
                answer,
                desc: values.desc,
              };
              await waitTime(2000);
              const res = await apiQuestionCreate(params);
              if (res.data.code === 200) {
                message.success("提交成功");
                formRef.current?.resetFields();
                setIsModalOpen(true)
              }
            }}
          >
            <ProFormGroup>
              <ProFormDependency name={["type", ["options"]]}>
                {() => {
                  return (
                    <ProFormSelect
                      options={questionTypeList?.data.data.list.map((item) => ({
                        label: item.name,
                        value: item.value,
                      }))}
                      rules={[{ required: true }]}
                      width="xs"
                      name="type"
                      label={`题型`}
                    />
                  );
                }}
              </ProFormDependency>
              <ProFormSelect
                options={classifyList?.data.data.list.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
                rules={[{ required: true }]}
                width="xs"
                onChange={(value, row) => {
                  formRef.current?.setFieldValue("classify", row.label);
                }}
                name="classify"
                label={`科目`}
              />
              <ProFormText
                name="question"
                label="题目"
                rules={[{ required: true }]}
              ></ProFormText>
            </ProFormGroup>

            <ProForm.Item noStyle shouldUpdate>
              {(form) => {
                if (form.getFieldValue("type") === 1) {
                  return (
                    <ProFormRadio.Group
                      rules={[{ required: true }]}
                      name="answer"
                      label="选项"
                      options={[
                        {
                          label: (
                            <ProFormText
                              name="A"
                              label="A"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "A",
                        },
                        {
                          label: (
                            <ProFormText
                              name="B"
                              label="B"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "B",
                        },
                        {
                          label: (
                            <ProFormText
                              name="C"
                              label="C"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "C",
                        },
                        {
                          label: (
                            <ProFormText
                              name="D"
                              label="D"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "D",
                        },
                      ]}
                    ></ProFormRadio.Group>
                  );
                }
                if (form.getFieldValue("type") === 2) {
                  return (
                    <ProFormCheckbox.Group
                      rules={[{ required: true }]}
                      name="answer"
                      label="选项"
                      options={[
                        {
                          label: (
                            <ProFormText
                              name="A"
                              label="A"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "A",
                        },
                        {
                          label: (
                            <ProFormText
                              name="B"
                              label="B"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "B",
                        },
                        {
                          label: (
                            <ProFormText
                              name="C"
                              label="C"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "C",
                        },
                        {
                          label: (
                            <ProFormText
                              name="D"
                              label="D"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "D",
                        },
                      ]}
                    ></ProFormCheckbox.Group>
                  );
                }
                if (form.getFieldValue("type") === 3) {
                  return (
                    <ProFormRadio.Group
                      rules={[{ required: true }]}
                      name="answer"
                      label="选项"
                      options={[
                        {
                          label: (
                            <ProFormText
                              name="A"
                              label="对"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "对",
                        },
                        {
                          label: (
                            <ProFormText
                              name="B"
                              label="对"
                              rules={[{ required: true }]}
                            ></ProFormText>
                          ),
                          value: "错",
                        },
                      ]}
                    ></ProFormRadio.Group>
                  );
                }
                if (form.getFieldValue("type") === 3) {
                  return (
                    <ProFormGroup>
                      <ProFormText
                        name="answer"
                        label="答案"
                        rules={[{ required: true }]}
                      ></ProFormText>
                    </ProFormGroup>
                  );
                }
              }}
            </ProForm.Item>
            <ProForm.Item>
              <ProFormText name="desc" label="解析"></ProFormText>
            </ProForm.Item>
          </ProForm>
        </>
      )}
    </div>
  );
};

export default questionCreate;
