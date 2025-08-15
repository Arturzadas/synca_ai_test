import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { chatStyles as styles, globalStyles } from "./styles";
import { useEffect, useRef } from "react";

export const Chat = ({
  chatMessages,
  setChatInput,
  sendMessage,
  chatInput,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 10);
  }, [chatMessages]);

  return (
    <Box {...styles.chatBox}>
      <Heading {...styles.chatHeading}>Chat</Heading>
      <VStack {...styles.chatMessages} ref={chatContainerRef}>
        {chatMessages.length ? (
          chatMessages.map((msg, i) => (
            <Box key={i} {...styles.chatMessage(msg.from === "You")}>
              <Text>{msg.message}</Text>
              <Text
                w={"fit-content"}
                justifySelf={msg.from === "You" ? "flex-end" : "flex-start"}
                fontSize={"10px"}
              >
                {msg.from}
              </Text>
            </Box>
          ))
        ) : (
          <Text>No messages yet :(</Text>
        )}
      </VStack>
      <HStack {...styles.chatInputBox}>
        <Input
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          {...globalStyles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} colorScheme="blue">
          Send
        </Button>
      </HStack>
    </Box>
  );
};
