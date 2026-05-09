import React from "react";
import { Composition } from "remotion";
import { DCHMotionGraphics } from "./DCHMotionGraphics";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DCHMotionGraphics"
        component={DCHMotionGraphics}
        durationInFrames={345}  // 11.5 seconds at 30fps
        fps={30}
        width={1920}            // landscape 16:9
        height={1080}
        defaultProps={{
          titleText: "DCH",
          tagline: "The intelligence layer behind growth.",
        }}
      />
    </>
  );
};
