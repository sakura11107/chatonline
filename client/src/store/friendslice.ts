import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Friend {
  id: string;
  username: string;
}

interface FriendState {
  friends: Friend[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  loading: false,
  error: null,
};

const API_BASE_URL = 'http://localhost:5000'; // API URL 提取为常量

// 获取好友列表（使用 token 进行身份验证）
export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (token: string, { rejectWithValue }) => { // 只需传递 token
    try {
      const response = await axios.get(`${API_BASE_URL}/get_friends`, {
        headers: {
          Authorization: `Bearer ${token}`, // 使用 Authorization 头
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) { // 检查错误是否为 AxiosError 类型
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch friends');
      }
      return rejectWithValue('Failed to fetch friends'); // 对于非 Axios 错误
    }
  }
);

// 发送好友请求（使用 token 进行身份验证）
export const sendFriendRequest = createAsyncThunk(
  'friend/sendFriendRequest',
  async (
    { friendId, token }: { friendId: string; token: string }, // 去掉 userId 参数
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send_friend_request`,
        { friend_id: friendId }, // 不再需要 user_id，由后端从 token 解析
        {
          headers: {
            Authorization: `Bearer ${token}`, // 使用 Authorization 头
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) { // 检查错误是否为 AxiosError 类型
        return rejectWithValue(error.response?.data?.error || 'Failed to send friend request');
      }
      return rejectWithValue('Failed to send friend request'); // 对于非 Axios 错误
    }
  }
);

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null; // 清除之前的错误
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null; // 清除之前的错误
      })
      .addCase(sendFriendRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default friendSlice.reducer;
