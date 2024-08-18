"use client";
import React, { useEffect, useState, useMemo } from "react";
import ImgWrapper from "./ImgWrapper";
import formatTimeDifference from "@/lib/formatTime";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import CardSkeleton from "./CardSkeleton";
import { DialogTitle } from "@radix-ui/react-dialog";

interface props {
  item: any;
}

/**
 * Card component to display a news.
 * @param {Object} props - Component props.
 * @returns {JSX.Element} - Rendered component.
 */
const Card = ({ item }: props): JSX.Element => {
  // State for formatted time
  const [formattedTime, setFormattedTime] = useState("");
  // State to track the loading state of formatted time
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch formatted time difference
  useEffect(() => {
    const fetchFormattedTime = () => {
      const timeDifference = formatTimeDifference(item.time);
      setFormattedTime(timeDifference);
      setIsLoaded(true);
    };

    fetchFormattedTime();
  }, [item.time]);

  // State for toggling description
  const [showMore, setShowMore] = useState(false);

  // Memoized description to limit length
  const description = useMemo(() => {
    return showMore ? item.description : `${item.description.slice(0, 400)}...`;
  }, [showMore, item.description]);

  return (
    <div key={item.id} className="m-8">
      {!isLoaded ? (
        <CardSkeleton />
      ) : (
        <div className="flex flex-col items-start justify-between gap-8 md:gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-1">
            {/* Display formatted time */}
            <span className="text-sm">{formattedTime}</span>
            {/* Display headline */}
            <div className="text-2xl font-semibold text-white">
              {item.headline}
            </div>
            {/* Display description with toggle */}
            <div className="text-primaryText">{description}</div>
            <div className="mt-2">
              <div className="flex items-center justify-start gap-4">
                {/* Toggle description length */}
                <button
                  className="rounded-lg bg-primaryGray px-4 py-2 text-xs font-bold text-white"
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? "Hide" : "Read More"}
                </button>
                {/* Dialog trigger for AI summary */}
                <Dialog>
                  <DialogTrigger className="rounded-lg bg-primaryGray px-4 py-2 text-xs font-bold text-white">
                    Epoch Insight
                  </DialogTrigger>

                  {/* Dialog content for AI summary */}
                  <DialogContent className="glassmorphism border-none bg-transparent p-6">
                    {/* Dialog Heading */}
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-white">
                        Epoch Insight
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      <p className="-mt-1 text-lg text-primaryText">
                        {item?.summary}
                      </p>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {/* Display news image */}
          <div className="w-full lg:w-[30%]">
            <ImgWrapper img={item.img} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
