import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from 'antd';
import { selectMenu, selectSubMenu } from '../../store/chatslice';
import { fetchFriends } from '../../store/friendslice';
import { RootState, AppDispatch } from '../../store/store';
// import { jwtDecode } from 'jwt-decode';  // 正确导入 jwt-decode

// interface DecodedToken {
//   user_id: string;
//   exp: number;
// }

const LeftContainer: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const token = localStorage.getItem('token');

  // // 解码 token 并获取 user_id
  // let userId: string | null = null;
  // if (token) {
  //   try {
  //     const decoded: DecodedToken = jwtDecode(token);  // 使用正确的jwtDecode函数
  //     userId = decoded.user_id;
  //     console.log('User ID:', userId);
  //   } catch (error) {
  //     console.error('Invalid token');
  //   }
  // }

  // 从 Redux 状态中获取好友列表和加载状态
  const { friends, loading: friendsLoading, error: friendsError } = useSelector(
    (state: RootState) => state.friend
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchFriends(token)); // 只传递 token
    }
  }, [dispatch, token]);

  const handleMenuClick = (key: string, subKey?: string) => {
    if (subKey) {
      dispatch(selectMenu(key));
      dispatch(selectSubMenu(subKey));
    } else {
      dispatch(selectMenu(key));
    }
  };

  const friendMenuItems = friends.map((friend) => ({
    key: friend.id,
    label: friend.username,
    onClick: () => handleMenuClick('friends', friend.username),
  }));

  const channelMenuItems = [
    { key: 'channel1', label: '频道1', onClick: () => handleMenuClick('channels', '频道1') },
    { key: 'channel2', label: '频道2', onClick: () => handleMenuClick('channels', '频道2') },
  ];

  const menuItems = [
    {
      key: 'chatgpt',
      label: 'ChatGPT',
      onClick: () => handleMenuClick('chatgpt'),
    },
    {
      key: 'friends',
      label: '好友列表',
      children: friendMenuItems,
    },
    {
      key: 'channels',
      label: '频道列表',
      children: channelMenuItems,
    },
  ];

  return (
    <div>
      {friendsLoading ? (
        <p>Loading friends...</p>
      ) : friendsError ? (
        <p>Error: {friendsError}</p>
      ) : (
        <Menu mode="inline" items={menuItems} />
      )}
    </div>
  );
};

export default LeftContainer;
