import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 消息接口
interface Message {
  target: string;
  subTarget: string;
  content: string;
  sender: string;
}

// 聊天状态接口
interface ChatState {
  selectedMenu: string | null;
  selectedSubMenu: string | null;
  selectedChannelType: string | null;
  selectedChannel: string | null;
  messages: Message[];
  loading: boolean;  // 新增: 用于异步操作的加载状态
  error: string | null;  // 新增: 用于存储错误信息
}

const initialState: ChatState = {
  selectedMenu: null,
  selectedSubMenu: null,
  selectedChannelType: null,
  selectedChannel: null,
  messages: [],  // 初始聊天记录为空
  loading: false,  // 新增: 初始加载状态为 false
  error: null,  // 新增: 初始错误信息为 null
};

// 异步操作：发送消息到 ChatGPT
export const sendMessageToChatGPT = createAsyncThunk(
  'chat/sendMessageToChatGPT',
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chatgpt', { message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );  // 使用后端 API 地址
      return response.data.response;  // 返回 ChatGPT 的回复
    } catch (error) {
      return rejectWithValue('Failed to communicate with ChatGPT');  // 返回错误信息
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectMenu: (state, action: PayloadAction<string>) => {
      state.selectedMenu = action.payload;
      state.selectedSubMenu = null;  // 切换菜单时清空子菜单选择
      state.selectedChannel = null;  // 切换菜单时清空频道选择
    },
    selectSubMenu: (state, action: PayloadAction<string>) => {
      state.selectedSubMenu = action.payload;
    },
    selectChannelType: (state, action: PayloadAction<string>) => {
      state.selectedChannelType = action.payload;
    },
    selectChannel: (state, action: PayloadAction<string>) => {
      state.selectedChannel = action.payload;
    },
    sendMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);  // 添加新消息到消息列表
    },
    resetChatState:(state) => {
      Object.assign(state, initialState);  // 重置聊天状态为初始状态
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToChatGPT.pending, (state) => {
        state.loading = true;  // 设置加载状态为 true
        state.error = null;  // 清空错误信息
      })
      .addCase(sendMessageToChatGPT.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;  // 设置加载状态为 false
        state.messages.push({
          target: 'ChatGPT',  // 默认 AI 用户
          subTarget: '',
          content: action.payload,
          sender: 'ChatGPT',
        });
      })
      .addCase(sendMessageToChatGPT.rejected, (state, action) => {
        state.loading = false;  // 设置加载状态为 false
        state.error = action.payload as string;  // 设置错误信息
      });
  },
});

export const { selectMenu, selectSubMenu, selectChannelType, selectChannel, sendMessage,resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
