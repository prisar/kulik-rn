import AsyncStorage from '@react-native-community/async-storage';

import {AuthActionTypes} from './actions';
import {User} from '../user/model';

export interface AuthState {
  loggedInUser?: User;
}

const initialState: AuthState = {
  loggedInUser: undefined,
};

export const authReducer = (state = initialState, action: any): AuthState => {
  const payload = action.payload;

  switch (action.type) {
    case AuthActionTypes.LOGIN:
      AsyncStorage.setItem('user', JSON.stringify(payload)).then().catch();
      return {...state, loggedInUser: payload};

    case AuthActionTypes.LOGOUT:
      AsyncStorage.removeItem('user').then().catch();
      return {...state, loggedInUser: undefined};

    case AuthActionTypes.SET_LOGGED_IN_USER:
      return {
        ...state,
        loggedInUser: payload,
      };

    default:
      return state;
  }
};
