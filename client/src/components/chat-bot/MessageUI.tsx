/**
 * Represents the UI component for displaying a message in the chat bot.
 * @component
 */
import React, { RefObject } from "react";
import { v4 as uuidv4 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Spinner from "../Spinner";
import DisplayStream from "./DisplayStream";
import { MagnifyingGlass } from "react-loader-spinner";

/**
 * Props for the MessageUI component.
 */
interface Props {
  message: {
    role: string;
    text?: string | undefined;
    error?: string | undefined;
    id: string;
    loading: boolean;
  };
  isLoading: boolean;
  user: any;
  containerRef: RefObject<HTMLDivElement>;
  hasUserScrolled: boolean;
}

/**
 * MessageUI is a memoized functional component that renders the UI for displaying a message in the chat bot.
 * @param {Props} props - The component props.
 * @returns {TSX.Element} The rendered component.
 */
const MessageUI = React.memo(
  ({ message, isLoading, user, containerRef, hasUserScrolled }: Props) => {
    return (
      <div key={message.id} className="mt-2 w-full">
        {message.role === "user" ? (
          <div className="flex w-full flex-col items-end justify-end gap-4 sm:flex-row sm:items-start">
            <div className="order-2 rounded-[20px] rounded-tr-none border bg-gray-300 px-4 py-2 text-base font-[500] text-gray-900 sm:order-1">
              {message?.text}
            </div>
            <Avatar className="order-1 sm:order-2">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName!} />
              <AvatarFallback className="text-xs text-gray-800">
                <Spinner />
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="align-center flex w-full flex-col items-start justify-start gap-2 sm:flex-row sm:gap-4">
            <Avatar className="">
              <AvatarImage src="/logo.png" className="scale-[0.70]" />
              <AvatarFallback>Bot</AvatarFallback>
            </Avatar>
            <div className=" md:text-md max-w-full flex-1 rounded-[20px] rounded-tl-none border bg-secondaryBg px-4 py-1 text-gray-300 md:px-5">
              {message.loading && isLoading ? (
                <div className="flex items-center gap-3">
                  <div>
                    Analyzing stocks for you! Sit tight, financial insights are
                    on the way!
                  </div>
                  <MagnifyingGlass
                    visible={true}
                    height="60"
                    width="60"
                    ariaLabel="magnifying-glass-loading"
                    wrapperStyle={{}}
                    wrapperClass="magnifying-glass-wrapper"
                    glassColor="#c0efff"
                    color="#000"
                  />
                </div>
              ) : message?.error ? (
                <div className="flex w-full flex-col items-start gap-2 py-2 text-[#FF0000]">
                  Oops! Looks like there&apos;s a turbulence in our financial
                  data stream. <br />
                  Please retry, and we&apos;ll try to navigate you to smoother
                  insights. <br />
                  <span className="text-sm">Error: {message?.error}</span>
                </div>
              ) : (
                <>
                  <DisplayStream
                    paragraph={message.text}
                    containerRef={containerRef}
                    hasUserScrolled={hasUserScrolled}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
MessageUI.displayName = "MessageUI";

export default MessageUI;
