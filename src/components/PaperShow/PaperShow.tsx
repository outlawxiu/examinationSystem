import React, { useEffect, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { ProDescriptions } from "@ant-design/pro-components";
import { Button } from "antd";
import { useRef } from "react";
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

const PaperShow = (props) => {
  const pageRef = useRef(null);
  // const [drawerVisit, setDrawerVisit] = useState(false);
  // const [drawerData, setDrawerData] = useState();
  // useEffect(() => {
  //   props.setDrawerVisit(drawerVisit);
  // }, [drawerVisit]);
  // useEffect(() => {
  //   setDrawerData(props.drawerData);
  //   setDrawerVisit(props.drawerVisit)
  // }, []);

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
    <DrawerForm
      onOpenChange={props.setDrawerVisit}
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
      open={props.drawerVisit}
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
        <ProDescriptions column={1} title="试卷信息" dataSource={props.drawerData}>
          <ProDescriptions.Item dataIndex="name" />
          <ProDescriptions.Item dataIndex="classify" label="考试科目" />
          {props.drawerData?.questions.map((item) => {
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
  );
};
export default PaperShow;
