import {combineReducers} from 'redux';
import {userReducer} from './user/reducer';
import {authReducer} from './auth/reducer';

export const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
