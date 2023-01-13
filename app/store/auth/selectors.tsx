import {useSelector} from 'react-redux';
import {RootState} from '../rootReducer';
import {User} from '../user/model';

export const selectLoggedInUser = (): User =>
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSelector((state: RootState) => state.auth.loggedInUser as any);
