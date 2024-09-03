import { useDispatch, useSelector } from 'react-redux';
import { Menu, Slider, Switch } from 'antd';
import { RootState } from '../../store/store';
import { selectChannelType, selectChannel } from '../../store/chatslice';

const MiddleContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedMenu, selectedSubMenu, selectedChannelType, selectedChannel } = useSelector(
    (state: RootState) => state.chat
  );

  let content: React.ReactNode = '请选择聊天对象';

  if (selectedMenu === 'chatgpt') {
    content = '与 ChatGPT 进行聊天';
  } else if (selectedMenu === 'friends' && selectedSubMenu) {
    content = `与好友 ${selectedSubMenu ?? ''} 进行聊天`;
  } else if (selectedMenu === 'channels' && selectedSubMenu) {
    content = `已进入 ${selectedSubMenu ?? ''} 频道`;

    const channelItems = [
      {
        key: 'text',
        label: '文字频道',
        children: [
          { key: 'textChannel1', label: '频道1' },
          { key: 'textChannel2', label: '频道2' },
        ],
      },
      {
        key: 'voice',
        label: '语音频道',
        children: [
          { key: 'voiceChannel1', label: '频道3' },
          { key: 'voiceChannel2', label: '频道4' },
        ],
      },
    ];

    content = (
      <>
        <Menu
          mode="inline"
          selectedKeys={[selectedChannel ?? '']}
          onClick={({ keyPath }) => {
            const [channelKey, channelTypeKey] = keyPath;  // keyPath 包含子项和父项的 key
            dispatch(selectChannelType(channelTypeKey));  // 设置频道类型
            dispatch(selectChannel(channelKey));          // 设置频道
          }}
          items={channelItems}
        />
        {selectedChannel && <p>已进入 {selectedChannel ?? ''} 频道</p>}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {typeof content === 'string' ? <p>{content}</p> : content}
      </div>

      {selectedMenu === 'channels' && selectedChannel && selectedChannelType === 'voice' && (
        <div style={{ borderTop: '1px solid #ddd', padding: '10px 20px', backgroundColor: '#f9f9f9' }}>
          <h3>频道设置</h3>
          <div>
            <h4>对方音量调节</h4>
            <Slider defaultValue={30} />
          </div>
          <div>
            <h4>自己音量调节</h4>
            <Slider defaultValue={70} />
          </div>
          <div>
            <h4>麦克风开关</h4>
            <Switch defaultChecked />
          </div>
        </div>
      )}
    </div>
  );
};

export default MiddleContainer;
