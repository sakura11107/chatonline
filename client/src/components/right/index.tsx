import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input, List } from 'antd';
import { RootState, AppDispatch } from '../../store/store';  // 引入 AppDispatch 类型
import { sendMessage, sendMessageToChatGPT } from '../../store/chatslice';  // 确保导入 sendMessageToChatGPT

const { TextArea } = Input;

const RightContainer: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();  // 使用 AppDispatch 类型化 dispatch
  const { selectedMenu, selectedSubMenu, messages } = useSelector((state: RootState) => state.chat);
  const [inputValue, setInputValue] = useState('');

  const currentChatMessages = messages.filter(
    (message) => message.target === (selectedMenu ?? '') && message.subTarget === (selectedSubMenu ?? '')
  );

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const isChatGPT = selectedMenu === 'chatgpt';  // 根据选定的用户或频道确定是否是 ChatGPT

      if (isChatGPT) {
        // 如果是 ChatGPT，对它发送消息
        await dispatch(sendMessageToChatGPT(inputValue.trim()));
      } else {
        // 发送普通消息
        dispatch(
          sendMessage({
            target: selectedMenu ?? '',
            subTarget: selectedSubMenu ?? '',
            content: inputValue.trim(),
            sender: '我',
          })
        );
      }
      setInputValue('');  // 清空输入框
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f5f5f5', padding: '10px' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px' }}>
        <List
          dataSource={currentChatMessages}
          renderItem={(item) => (
            <List.Item style={{ textAlign: item.sender === '我' ? 'right' : 'left' }}>
              <div style={{ backgroundColor: '#e6f7ff', padding: '8px', borderRadius: '8px', display: 'inline-block' }}>
                <strong>{item.sender}:</strong> {item.content}
              </div>
            </List.Item>
          )}
        />
      </div>

      <div>
        <TextArea
          rows={2}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="请输入聊天内容..."
        />
      </div>
    </div>
  );
};

export default RightContainer;
