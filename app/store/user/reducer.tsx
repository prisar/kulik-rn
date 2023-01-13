import {UserActionTypes} from './actions';
import {User} from './model';

export interface UserState {
  user: User;
  userProfile: User;
}

const initialState: UserState = {
  user: {}, // {uid: '', displayName: '', photoUrl: '', email: '', phoneNumber: ''},
  userProfile: {},
};

export const userReducer = (state = initialState, action: any): UserState => {
  const payload = action.payload;

  switch (action.type) {
    case UserActionTypes.ADD_USER:
      return {...state, user: payload};

    case UserActionTypes.UPDATE_USER:
      return {...state, user: payload};

    case UserActionTypes.LOAD_USER:
      return {
        ...state,
        user: payload,
      };

    case UserActionTypes.LOAD_USER_PROFILE:
      return {
        ...state,
        userProfile: payload,
      };

    default:
      return state;
  }
};
