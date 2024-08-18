"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import UserForm from "./UserForm";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import MessageUI from "./MessageUI";
import { useMutation } from "react-query";
import ConversationStarter from "./ConversationStarter";

interface Props {}

const defaultMessage = {
  id: 1,
  text: `# Welcome to Epoch! 🌟
  
  Discover the power of informed decision-making with these features:
  
  - **Explore New Investment Opportunities:** Identify potential investments using Artificial Intelligence and your own customized criteria.
  
  - **Leverage Real-time News:** Get key insights into relevant news and events in real-time.
  
  - **Bring Your Own Data:** Leverage latest Artificial Intelligence techniques on your data.
  
  \n #### Ready to accelerate your investing adventure? 🚀 `,
  role: "bot",
};

const ChatBot = (props: Props) => {
  /**
   * Represents the state of the user in the chat bot component.
   * @property {boolean} isSignedIn - Indicates whether the user is signed in.
   * @property {User} user - The user object.
   * @property {boolean} isLoaded - Indicates whether the user data is loaded.
   */
  const { isSignedIn, user, isLoaded } = useUser();
  const [showConversationStarter, setShowConversationStarter] =
    useState<boolean>(true);
  /**
   * Represents the user ID.
   * @remarks
   * This ID is used to identify the current user.
   */
  const userId = user?.id as string;

  /**
   * Represents the messages state.
   * @remarks
   * This state stores an array of messages, each containing an ID, text (optional), error (optional), role, and loading status.
   */
  const [messages, setMessages] = useState<
    {
      id: string;
      text?: string;
      error?: string;
      role: string;
      loading: boolean;
    }[]
  >([]);

  const FormSchema = z.object({
    query: z.string().min(2, {
      message: "Query must have at least 2 characters.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      query: "",
    },
    resolver: zodResolver(FormSchema),
  });

  /**
   * Represents the parameters for the sendQueryMutation function.
   */
  interface SendQueryMutationParams {
    message: string;
    user_id: string;
    msgId: string;
  }

  /**
   * Sends a query mutation to the server.
   * @param message The message to send.
   * @param user_id The user ID.
   * @returns The response data from the server.
   */
  const sendQueryMutation = async ({
    message,
    user_id,
  }: SendQueryMutationParams) => {
    const response = await axios.post(
      "http://localhost:8000/epoch",
      { message, user_id },
    );
    console.log(response);
    return response.data;
  };

  const { mutate, isError, isSuccess, isLoading } = useMutation(
    sendQueryMutation,
    {
      /**
       * Handles the success of the mutation.
       * @param data The response data from the server.
       * @param variables The mutation variables.
       */
      onSuccess: (data, variables) => {
        setMessages((prevMessages) => {
          const updatedMessages = (prevMessages || []).map((msg) =>
            msg.id === variables.msgId
              ? { ...msg, text: data, loading: false }
              : msg,
          );
          return [...updatedMessages];
        });
      },
      /**
       * Handles the error of the mutation.
       * @param error The error object.
       * @param variables The mutation variables.
       */
      onError: (error, variables) => {
        console.error("Error sending message from React-Query:", error);
        setMessages((prevMessages) => {
          const updatedMessages = (prevMessages || []).map((msg) =>
            msg.id === variables.msgId
              ? {
                  ...msg,
                  error: (error as Error).message,
                  loading: false,
                }
              : msg,
          );
          return [...updatedMessages];
        });
      },
    },
  );

  /**
   * Handles the form submission event.
   * @param data The form data.
   */
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data.query);
    /**
     * Resets the value of the "query" field in the form.
     */
    form.resetField("query");
    setShowConversationStarter(false);

    /**
     * Sets the user query in the messages state.
     * @param {string} data.query - The user query.
     */
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: data.query,
        role: "user",
        loading: false,
      },
    ]);

    /**
     * Adds a new message to the chat with role as bot.
     * @param {string} msgId - The unique identifier for the message.
     */
    const msgId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: "bot",
        loading: true,
      },
    ]);

    /**
     * Sends a mutation request to the server with the provided message, user ID, and message ID.
     * @param {string} message - The message to send.
     * @param {string} user_id - The user ID.
     * @param {string} msgId - The message ID.
     */
    mutate({ message: data.query, user_id: userId, msgId: msgId });
  };

  /**
   * Ref to the chat container element.
   */
  const chatContainer = useRef<HTMLDivElement>(null);
  /**
   * Represents the state of whether the user has scrolled or not.
   */
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  /**
   * Scrolls the chat container to the bottom.
   */
  const scrollToBottom = () => {
    const container = chatContainer.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  /**
   * useEffect hook that scrolls to the bottom of the chat container if the user has not scrolled manually.
   * @returns {void}
   */
  useEffect(() => {
    if (!hasUserScrolled) {
      scrollToBottom();
    }
  }, [messages, hasUserScrolled]);

  /**
   * Event handler for scrolling in the chat container.
   * Sets the hasUserScrolled state based on whether the user has scrolled to the bottom or not.
   * @returns {void}
   */
  const handleScroll = (): void => {
    const container = chatContainer.current;
    if (container) {
      setHasUserScrolled(
        /**
         * @param {number} scrollTop - The current scrollTop value of the container.
         * @param {number} scrollHeight - The total height of the container's content.
         * @param {number} clientHeight - The height of the container's visible area.
         */
        container.scrollTop <
          container.scrollHeight - container.clientHeight - 10,
        // subtracting 10 to remove the padding
      );
    }
  };

  return (
    <>
      <div
        ref={chatContainer}
        onScroll={handleScroll}
        className="chat-scrollbar max-h-[calc(100vh_-_80px)] w-full overflow-y-scroll pt-16 md:pt-0"
      >
        {/* Start: Default message container */}
        <div className="mt-4 flex items-center justify-center px-5 py-2 sm:p-0">
          <div className="w-full rounded-lg border-[1.5px] border-primaryGray px-3 sm:max-w-xl sm:px-5 sm:py-1 md:text-base lg:max-w-3xl">
            <Markdown
              remarkPlugins={[remarkGfm]}
              className="markdown prose dark:prose-invert w-full max-w-none text-base leading-8 md:text-sm"
            >
              {defaultMessage?.text}
            </Markdown>
          </div>
        </div>
        {/*End: Default message container */}

        {/*Start: Message list container */}
        <div className=" flex w-full flex-1 flex-col gap-5 px-4 py-8 sm:px-8 md:px-12">
          {messages?.map((message, i) => (
            <MessageUI
              key={message.id}
              message={message}
              isLoading={isLoading}
              user={user}
              containerRef={chatContainer}
              hasUserScrolled={hasUserScrolled}
            />
          ))}
        </div>
        {/*End: Message list container */}

        {/*Start: Conversation Starter */}
        {showConversationStarter && (
          <div className="p flex w-full flex-1 px-4 pb-6 sm:px-8 md:px-12">
            <ConversationStarter onSubmit={onSubmit} />
          </div>
        )}
        {/*End: Conversation Starter */}
      </div>

      {/*Start: User Search container */}
      <UserForm isLoading={isLoading} onSubmit={onSubmit} form={form} />
      {/*End: User Search container */}
    </>
  );
};

export default ChatBot;
