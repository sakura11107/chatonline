import React, { useState } from 'react';
import { Button, Input, List, message, Layout, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LeftContainer from '../left';
import MiddleContainer from '../middle';
import RightContainer from '../right';
import './index.css';

const { Sider, Content } = Layout;

const Chat: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [userList, setUserList] = useState<Array<{ id: number; username: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post('http://localhost:5000/logout', { token }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      localStorage.removeItem('token');  // 删除 token
      message.success('成功注销');
      navigate('/login');
    } catch (err) {
      console.error(err);
      message.error('注销失败');
    }
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      message.warning('请输入用户名');
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const response = await axios.get('http://localhost:5000/search', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { username },  // 传递用户名作为查询参数
      });

      setUserList([response.data]);  // 保存查询结果到状态中
      message.success('查询成功');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        message.error('用户未找到');
      } else {
        message.error('查询失败');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = (userId: number) => {
    message.success(`发送好友请求给用户ID: ${userId}`);
    // 这里可以添加发送好友请求的逻辑
  };

  const handleDeleteFriend = (userId: number) => {
    message.success(`删除好友请求用户ID: ${userId}`);
    // 这里可以添加删除好友的逻辑
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setUsername('');
    setUserList([]);
  };

  return (
    <>
      <Button type="primary" onClick={handleLogout}>注销</Button>
      <Button type="primary" onClick={showModal}>查询用户</Button>
      
      <Modal
        title="查询用户"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}  // 自定义footer内容
      >
        <Input
          placeholder="输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          loading={loading}
          style={{ marginBottom: '10px' }}
        >
          查询
        </Button>
        <Button onClick={handleCancel}>退出</Button>

        {userList.length > 0 && (
          <List
            dataSource={userList}
            renderItem={user => (
              <List.Item>
                <List.Item.Meta
                  title={`ID: ${user.id}`}
                  description={`用户名: ${user.username}`}
                />
                <Button type="primary" onClick={() => handleFriendRequest(user.id)}>发送好友请求</Button>
                <Button type="default" danger onClick={() => handleDeleteFriend(user.id)} style={{ marginLeft: '10px' }}>
                  删除好友
                </Button>
              </List.Item>
            )}
          />
        )}
      </Modal>

      <Layout className="layoutcontainer">
        <Sider width={'200px'} style={{ backgroundColor: '#0a0149' }}>
          <LeftContainer />
        </Sider>
        <Sider width={'200px'}>
          <MiddleContainer />
        </Sider>
        <Content className="contentcontainer">
          <RightContainer />
        </Content>
      </Layout>
    </>
  );
};

export default Chat;
