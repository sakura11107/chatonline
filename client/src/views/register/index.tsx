import { Form, Input } from "antd";
import './index.css';
import { Button, message } from 'antd';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

interface RegisterFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
}

const Register: React.FC = () => {

    const navigate = useNavigate();
    const [form] = Form.useForm<RegisterFormValues>();

    const gologin = () => {
        navigate('/login');
    }

    const handleRegister = async (values: RegisterFormValues) => {
        try {
            const response = await axios.post('/api/register', values);
            if (response.status === 201) {
                navigate('/login');
                message.success('注册成功,请登录');
            } else {
                message.error('注册失败: ' + response.data.error);
            }
        } catch (err) {
            console.log('注册失败', err);
        }
    }

    return (
        <div>
            <h2 style={{ color: 'white' }}>注册页面</h2>
            <Form
                form={form}
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 20 }}
                style={{ maxWidth: 600 }}
                className="form-item-label"
                onFinish={handleRegister}
            >
                <Form.Item
                    label='Username'
                    name='username'
                    rules={[{ required: true, message: '请输入用户名' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label='Password'
                    name='password'
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label='Passwordconfirm'
                    name='passwordconfirm'
                    dependencies={['password']}
                    rules={[{ required: true, message: '请再次输入密码' }, ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject('两次密码不一致');
                        }
                    })
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <div className="container">
                    <Button type="primary" className="button-container" htmlType="submit">
                        注册
                    </Button>
                    <Button type="primary" className="button-container" style={{ backgroundColor: 'green' }} onClick={gologin}>
                        已有账号？去登陆
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default Register;