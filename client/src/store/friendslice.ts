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

const API_BASE_URL = '/api'; // 修改为代理路径

// 获取好友列表（使用 token 进行身份验证）
export const fetchFriends = createAsyncThunk(
  'friend/fetchFriends',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch friends');
      }
      return rejectWithValue('Failed to fetch friends');
    }
  }
);

// 发送好友请求（使用 token 进行身份验证）
export const sendFriendRequest = createAsyncThunk(
  'friend/sendFriendRequest',
  async (
    { friendId, token }: { friendId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send_friend_request`,
        { friend_id: friendId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Failed to send friend request');
      }
      return rejectWithValue('Failed to send friend request');
    }
  }
);

// 删除好友请求（使用 token 进行身份验证）
export const deleteFriendRequest = createAsyncThunk(
  'friend/deleteFriendRequest',
  async (
    { friendId, token }: { friendId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/delete_friend`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { friend_id: friendId },  // 使用 `data` 字段来传递请求体
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || 'Failed to delete friend request');
      }
      return rejectWithValue('Failed to delete friend request');
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
        state.error = null;
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
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFriendRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFriendRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default friendSlice.reducer;
