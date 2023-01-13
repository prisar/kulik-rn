import {useSelector} from 'react-redux';
import {RootState} from '../rootReducer';
import {User} from './model';

export const selectUser = (): User =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSelector((state: RootState) => state.user.user);

export const selectUserProfile = (): User =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSelector((state: RootState) => state.user.userProfile);
