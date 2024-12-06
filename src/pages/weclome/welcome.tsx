import React from "react";
import { Image} from 'antd'
import welcomePage from '../../../public/welcome.png'
const welcome = () => {
  return <div style={{ width: "100%", height: "100%" }}>
    <Image src={welcomePage} style={{borderRadius:10}}></Image>
  </div>;
};

export default welcome;
