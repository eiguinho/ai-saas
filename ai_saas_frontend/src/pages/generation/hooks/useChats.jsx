import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { chatRoutes } from "../../../services/apiRoutes";

export default function useChats() {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(chatRoutes.list, { credentials: "include" });
        const data = await res.json();
        console.log("[useChats] Chats fetched:", data);
        setChats(data || []);
      } catch {
        toast.error("Erro ao carregar chats");
      }
    };
    fetchChats();
  }, []);

  const loadChat = async (id) => {
    try {
      console.log("[useChats] Loading chat:", id);
      setChatVisible(false);
      setTimeout(async () => {
        setChatId(id);
        console.log("[useChats] ChatId set to:", id);

        const res = await fetch(chatRoutes.messages(id), { credentials: "include" });
        const data = await res.json();
        setMessages(data.messages || []);
        console.log("[useChats] Messages loaded for chat:", id, data.messages || []);
        setChatVisible(true);
      }, 200);
    } catch {
      toast.error("Erro ao carregar mensagens do chat");
    }
  };

  const createNewChat = () => {
    setChatVisible(false);
    setTimeout(() => {
      setChatId(null);
      setMessages([]);
      setChatVisible(true);
    }, 200);
  };

  const updateChatList = (chatData, action, newTitle) => {
  console.log("[useChats] updateChatList called:", chatData.id, action, newTitle);

  setChats((prev) => {
    console.log("[useChats] Previous chats:", prev);

    let updated;

    if (action === "add") {
      const exists = prev.find((c) => c.id === chatData.id);
      updated = exists
        ? prev.map((c) => (c.id === chatData.id ? { ...c, ...chatData } : { ...c }))
        : [{ ...chatData }, ...prev.map(c => ({ ...c }))];

      setChatId(chatData.id);
      loadChat(chatData.id);
      console.log("[useChats] Updated chats (after add):", updated);
      return updated;
    }

    // rename, archive, unarchive, delete
    updated = prev
      .map((ch) => {
        if (ch.id !== chatData.id) return { ...ch }; // força novo objeto
        if (action === "rename") return { ...ch, title: newTitle };
        if (action === "archive") return { ...ch, archived: true };
        if (action === "unarchive") return { ...ch, archived: false };
        return { ...ch };
      })
      .filter((ch) => !(action === "delete" && ch.id === chatData.id));

    console.log("[useChats] Updated chats (after action):", updated);

    if (action === "delete" && chatData.id === chatId) {
  setChatId(null);
  setMessages([]);
}

// PARA RENAME/ARCHIVE/UNARCHIVE: não altera o chat atual
// Então só retorna a lista atualizada
return updated;
  });
};

  return {
    chats,
    chatId,
    messages,
    setMessages,
    chatVisible,
    chatIdSetter: setChatId,
    loadChat,
    createNewChat,
    updateChatList,
  };
}
