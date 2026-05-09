import React from 'react';
import { Composition } from 'remotion';
import { SoteriaAd } from './compositions/SoteriaAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SoteriaAd"
        component={SoteriaAd}
        durationInFrames={300}  // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
