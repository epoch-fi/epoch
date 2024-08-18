import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {}

const CardSkeleton = (props: Props) => {
  return (
    <div className="flex w-full flex-col items-start justify-between gap-10 md:gap-4 lg:flex-row">
      <div className="flex w-full flex-1 flex-col items-start justify-center gap-2">
        {/* Time placeholder */}
        <Skeleton className="h-3  w-20 rounded-lg" />
        {/* Headline placeholder */}
        <Skeleton className="h-6 w-full rounded-lg" />
        {/* Description placeholder */}
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[90%]" />
        <Skeleton className="h-3 w-[90%]" />
        <div className="mt-2">
          <div className="flex items-center justify-start gap-4">
            <Skeleton className="h-[30px] w-[80px] rounded-lg" />
            {/* Button placeholder */}
            <Skeleton className="h-[30px] w-[80px] rounded-lg" />
            {/* Button placeholder */}
          </div>
        </div>
      </div>
      <Skeleton className="mx-auto h-[250px] w-[250px] rounded-lg lg:w-[30%]" />
      {/* Image placeholder */}
    </div>
  );
};

export default CardSkeleton;
