import {User} from '../user/model';

export enum AuthActionTypes {
  LOGIN = 'user/LOGIN',
  LOGOUT = 'user/LOGOUT',
  SET_LOGGED_IN_USER = 'user/LOGGED_IN_USER',
}

export const login = (user: User) => ({
  type: AuthActionTypes.LOGIN,
  payload: user,
});

export const logout = () => ({
  type: AuthActionTypes.LOGOUT,
});

export const setLoggedInUser = (user: User) => ({
  type: AuthActionTypes.SET_LOGGED_IN_USER,
  payload: user,
});
