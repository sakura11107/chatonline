import React, { useEffect, useState } from 'react';
import { Button, Input, List, message, Layout, Modal, Badge } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch,  } from 'react-redux'; // 导入 Redux hooks
import { AppDispatch,  } from '../../store/store'; // 导入 Redux store 类型
import { sendFriendRequest, deleteFriendRequest, fetchFriends } from '../../store/friendslice'; // 导入 Redux actions
import LeftContainer from '../left';
import MiddleContainer from '../middle';
import RightContainer from '../right';
import './index.css';
import { resetChatState } from '../../store/chatslice';

const { Sider, Content } = Layout;

interface FriendRequest {
  id: number;
  username: string;
}

const Chat: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [userList, setUserList] = useState<Array<{ id: number; username: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // 使用 Redux dispatch

  useEffect(() => {
    fetchPendingRequestsCounts();
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchFriends(token)); // 获取好友列表
    }
  }, [dispatch]);

  const fetchPendingRequestsCounts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/get_pending_requests_count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingRequestsCount(response.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriendRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/get_friend_requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFriendRequests(response.data);
    } catch (err) {
      console.error(err);
      message.error('获取好友请求失败');
    }
  };

  const handleViewRequests = () => {
    fetchFriendRequests();
    setIsRequestModalVisible(true);
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/accept_friend_request', 
        { friend_id: friendshipId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('好友请求已接受');
      fetchFriendRequests();
      fetchPendingRequestsCounts();
      dispatch(fetchFriends(token!));
    } catch (err) {
      console.error(err);
      message.error('接受好友请求失败');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/reject_friend_request', 
        { friend_id: friendshipId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('好友请求已拒绝');
      fetchFriendRequests();
      fetchPendingRequestsCounts();
    } catch (err) {
      console.error(err);
      message.error('拒绝好友请求失败');
    }
  };

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
      dispatch(resetChatState());  // 重置聊天状态
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

  const handleFriendRequest = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('未找到用户身份，请重新登录');
      return;
    }

    try {
      await dispatch(sendFriendRequest({ friendId: userId.toString(), token })).unwrap();
      message.success(`发送好友请求给用户ID: ${userId}`);
      await fetchPendingRequestsCounts(); // 重新获取未处理请求数量
    } catch (error) {
      message.error(`发送好友请求失败: ${error}`);
    }
  };

  const handleDeleteFriend = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('未找到用户身份，请重新登录');
      return;
    }

    try {
      await dispatch(deleteFriendRequest({ friendId: userId.toString(), token })).unwrap();
      message.success(`删除好友请求用户ID: ${userId}`);
      await fetchPendingRequestsCounts(); // 重新获取未处理请求数量
    } catch (error) {
      message.error(`删除好友请求失败: ${error}`);
    }
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
      <Badge count={pendingRequestsCount} offset={[10, 0]}>
        <Button type="primary" onClick={handleViewRequests}>查看消息</Button>
      </Badge>

      <Modal
        title="好友请求"
        open={isRequestModalVisible}
        onCancel={() => setIsRequestModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={friendRequests}
          renderItem={request => (
            <List.Item>
              <List.Item.Meta
                title={`${request.username} 发送了好友请求`}
              />
              <Button type="primary" onClick={() => handleAcceptRequest(request.id)}>同意</Button>
              <Button type="default" danger onClick={() => handleRejectRequest(request.id)} style={{ marginLeft: '10px' }}>
                拒绝
              </Button>
            </List.Item>
          )}
        />
      </Modal>

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
