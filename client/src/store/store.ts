import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatslice';
import friendReducer from './friendslice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    friend: friendReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
