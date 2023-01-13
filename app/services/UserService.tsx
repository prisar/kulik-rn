import {User} from '../store/user/model';

class UserService {
  static getUser = async (): Promise<User> => {
    return {uid: '', displayName: ''};
  };
}

export default UserService;
