import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const Home : React.FC = () => {   
    const navigate = useNavigate();

    const gologin = () => {
        navigate('/login');
    }

    return (
        <div>
            <h1 style={{color:"white"}}>欢迎进入聊天室</h1>
            <Button type="primary" onClick={gologin}>去登陆</Button>
        </div>
    )
}

export default Home;