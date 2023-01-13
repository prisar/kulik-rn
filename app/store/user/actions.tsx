import {User} from './model';

export enum UserActionTypes {
  ADD_USER = 'user/ADD_USER',
  UPDATE_USER = 'user/UPDATE_USER',
  LOAD_USER = 'user/LOAD_USER',
  LOAD_USER_PROFILE = 'user/LOAD_USER_PROFILE',
}

export const addUser = (user: User) => ({
  type: UserActionTypes.ADD_USER,
  payload: user,
});

export const updateUser = (user: User) => ({
  type: UserActionTypes.UPDATE_USER,
  payload: user,
});

export const loadUser = (user: User[]) => ({
  type: UserActionTypes.LOAD_USER,
  payload: user,
});

export const loadUserProfile = (user: User) => ({
  type: UserActionTypes.LOAD_USER_PROFILE,
  payload: user,
});
