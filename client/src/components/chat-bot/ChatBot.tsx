"use client";
import { useState, useRef, useEffect } from "react";
import UserForm from "./UserForm";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import MessageUI from "./MessageUI";
import ConversationStarter from "./ConversationStarter";
import { FormSchema } from "@/lib/formSchema";

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
  const { isSignedIn, user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConversationStarter, setShowConversationStarter] =
    useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const msgIdRef = useRef<string | null>(null);

  const userId = user?.id as string;

  const [messages, setMessages] = useState<
    {
      id: string;
      text?: string;
      error?: string;
      role: string;
      loading: boolean;
    }[]
  >([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      query: "",
    },
    resolver: zodResolver(FormSchema),
  });

  interface WebSocketResponse {
    data: string;
  }

  // WebSocket Handling
  useEffect(() => {
    const newSocket = new WebSocket(
      "wss://fin-gpt-production.up.railway.app/epoch-ws",
    );

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (response: WebSocketResponse) => {
      console.log("Response from server:", response);
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.id === msgIdRef.current
            ? { ...msg, text: response.data, loading: false }
            : msg,
        );
        return updatedMessages;
      });
      setIsLoading(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setMessages((prevMessages) => {
        const updatedMessages = (prevMessages || []).map((msg) =>
          msg.id === msgIdRef.current
            ? { ...msg, error: error.toString(), loading: false }
            : msg,
        );
        return [...updatedMessages];
      });
      setIsLoading(false);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsLoading(false);
    };

    return () => {
      // Clean up event handlers
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
    };
  }, [socket]);

  /**
   * Handles the form submission event.
   * @param data The form data.
   */
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("Query Received: ", data.query);

    form.resetField("query");
    setIsLoading(true);
    setShowConversationStarter(false);

    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: data.query,
        role: "user",
        loading: false,
      },
    ]);

    const msgId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: "bot",
        loading: true,
      },
    ]);

    msgIdRef.current = msgId;

    if (socket?.readyState === WebSocket.CLOSED) {
      setMessages((prevMessages) => {
        const updatedMessages = (prevMessages || []).map((msg) =>
          msg.id === msgIdRef.current
            ? { ...msg, error: "WebSocket connection failed!", loading: false }
            : msg,
        );
        return [...updatedMessages];
      });
      setIsLoading(false);
    } else if (socket?.readyState === WebSocket.OPEN) {
      const message = { message: data.query, user_id: userId };
      socket.send(JSON.stringify(message));
    }
  };

  // Auto Scrolling -> Start
  const chatContainer = useRef<HTMLDivElement>(null);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  const scrollToBottom = () => {
    const container = chatContainer.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (!hasUserScrolled) {
      scrollToBottom();
    }
  }, [messages, hasUserScrolled]);

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
        // subtracting 10 to cover up the padding
      );
    }
  };
  // Auto Scrolling -> End
  return (
    <div className="relative h-screen">
      <div
        ref={chatContainer}
        onScroll={handleScroll}
        className="chat-scrollbar max-h-[calc(100vh_-_80px)] w-full overflow-y-scroll pb-6 pt-16 md:pt-0"
      >
        {/* Start: Default message container */}
        <div className="mt-4 flex flex-col items-center justify-center px-5 py-2 sm:p-0">
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
        <div className="-mb-10 flex w-full flex-col gap-2 px-4 pt-12 sm:gap-4 sm:px-8 md:px-12">
          {messages?.map((message) => (
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
          <div className="flex w-full flex-1 px-4 pb-6 sm:px-8 md:px-12">
            <ConversationStarter onSubmit={onSubmit} />
          </div>
        )}
        {/*End: Conversation Starter */}
      </div>

      {/*Start: User Search container */}
      <UserForm isLoading={isLoading} onSubmit={onSubmit} form={form} />
      {/*End: User Search container */}
    </div>
  );
};

export default ChatBot;
