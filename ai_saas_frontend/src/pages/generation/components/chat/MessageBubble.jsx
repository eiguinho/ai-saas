import React from "react";
import TypingIndicator from "./TypingIndicator";
import MessageContent from "./MessageContent";
import { chatRoutes } from "../../../../services/apiRoutes";

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const { content, attachments } = msg;

  const truncateText = (text, max = 30) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  return (
    <div
      className={`max-w-[75%] p-4 rounded-2xl shadow-md break-words my-6 leading-relaxed ${
        isUser
          ? "ml-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-theme-dark)] text-white"
          : "mr-auto bg-white text-gray-800"
      }`}
    >
      {content === "typing" ? (
        <TypingIndicator />
      ) : (
        <>
          {content && (
            <div className="markdown">
              <MessageContent content={content} isUserMessage={msg.role === "user"} />
            </div>
          )}
          {attachments && attachments.length > 0 && (
            <div
              className={`mt-5 flex flex-wrap gap-4 ${
                attachments.length === 1 ? "justify-center" : "justify-start"
              }`}
            >
              {attachments.map((att, i) => {
                const isImage = att.mimetype?.startsWith("image/");
                const isPDF = att.mimetype === "application/pdf";
                const attUrl = att.isPreview ? att.url : chatRoutes.attachments(att.id);

                if (isPDF) {
                  return (
                    <a
                      key={i}
                      href={attUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center w-28 h-28 rounded-lg bg-red-500 p-2 text-center hover:bg-red-700 transition"
                    >
                      <div className="flex flex-col items-center justify-center w-full h-full rounded-md bg-white p-3">
                        <span className="font-bold text-lg text-red-500">.PDF</span>
                        <span className="text-xs mt-1 text-gray-800 break-all">{att.name}</span>
                      </div>
                    </a>
                  );
                }

                if (!isImage) {
                  return (
                    <a
                      key={i}
                      href={attUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline break-all px-2 py-1"
                    >
                      {att.name || "Arquivo"}
                    </a>
                  );
                }

                return (
                  <img
                    key={i}
                    src={attUrl}
                    alt={att.name || "imagem"}
                    className={
                      attachments.length === 1
                        ? "rounded-md object-contain max-w-[400px] max-h-[250px]"
                        : "rounded-md object-cover w-28 h-28"
                    }
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(MessageBubble);