import './index.css';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';


interface LoginFormValues{
  username: string;
  password: string;
}

interface ErrorResponse {
  error: string;
}

const Login : React.FC = () => {

  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>();


  const goregister = () => {
    navigate('/register');
  }

  const handlelogin = async (values:LoginFormValues) =>{
    try{
      const response = await axios.post('/api/login', values);
      if(response.status === 200){
        localStorage.setItem('token', response.data.token);
        navigate('/chat');
        message.success('登陆成功');
        form.resetFields();
      }
    }catch(err){
      const axiosError = err as AxiosError<ErrorResponse>;
      message.error('登陆失败' +axiosError.response?.data?.error);
    }
  }

  return (
    <>
      <div>
        <h2 style={{ color: 'white' }}>登陆页面</h2>
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          className="form-item-label"
          onFinish={handlelogin}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password" 
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <div className="container">
            <Button type="primary" className="button-container" htmlType="submit">
              登陆
            </Button>
            <Button type="primary" className="button-container" style={{ backgroundColor: 'green' }} onClick={goregister}>
              没有账号？去注册
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Login;
