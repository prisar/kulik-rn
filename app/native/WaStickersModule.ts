import {NativeModules} from 'react-native';
const {WaStickers} = NativeModules;
interface WaStickersInterface {
  memes(): void;
}
export default WaStickers as WaStickersInterface;
