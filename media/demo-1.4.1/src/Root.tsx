import {Composition} from 'remotion';
import {ProductDemo} from './ProductDemo';
import data from './demo-data.json';
export const RemotionRoot=()=> <Composition id="NowWhat-English" component={ProductDemo} width={1920} height={1080} fps={30} durationInFrames={data.duration*30}/>;
