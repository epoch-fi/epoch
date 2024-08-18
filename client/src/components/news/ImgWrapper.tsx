import Image from "next/image";
import React from "react";

interface Props {
  img: any;
}

const ImgWrapper = ({ img }: Props) => {
  return (
    <div>
      <Image
        src={img}
        alt="news"
        width={300}
        height={300}
        priority={true}
        className=" mx-auto h-[250px] w-[250px] rounded-3xl object-cover"
      />
    </div>
  );
};

export default ImgWrapper;
