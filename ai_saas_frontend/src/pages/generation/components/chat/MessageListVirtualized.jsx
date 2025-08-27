import React from "react";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "./MessageBubble";

function MessageListVirtualized({ messages, height }) {
  return (
    <Virtuoso
      style={{ height, width: "100%" }}
      totalCount={messages.length}
      itemContent={(index) => (
        <div className="px-2">
          <MessageBubble msg={messages[index]} />
        </div>
      )}
      followOutput="auto"
      overscan={200}
    />
  );
}

export default MessageListVirtualized;
