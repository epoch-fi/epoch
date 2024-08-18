import React from "react";

interface Props {}

const ComingSoon = (props: Props) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-8 animate-pulse text-5xl font-bold text-white">
        Coming Soon
      </h1>
      <p className="mb-8 text-lg text-white">
        We&apos;re working hard to bring you something amazing. Stay tuned!
      </p>
    </div>
  );
};

export default ComingSoon;
