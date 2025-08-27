import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import MessageListVirtualized from "../components/chat/MessageListVirtualized";
import ChatInput from "../components/chat/ChatInput";
import ChatControls from "../components/controls/ChatControls";
import Sidebar from "../components/chat/Sidebar";
import { TEXT_MODELS } from "../../../utils/constants";
import useChats from "../hooks/useChats";
import useChatActions from "../hooks/useChatActions";
import { ChevronLeft, ChevronRight } from "lucide-react";

function TextGeneration() {
  const { chats, chatId, messages, setMessages, chatVisible, chatIdSetter, loadChat, createNewChat, updateChatList } = useChats();
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [files, setFiles] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainSidebarCollapsed, setMainSidebarCollapsed] = useState(true);

  const isTemperatureLocked = model.startsWith("o") || model.startsWith("gpt-5");
  const currentModelObj = TEXT_MODELS.find((m) => m.value === model);
  const attachmentsAllowed = currentModelObj?.attachments ?? true;

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const { loading, handleSend, handleStop } = useChatActions({
    chatId,
    setChatId: chatIdSetter,
    messages,
    setMessages,
    updateChatList,
  });

  return (
    <Layout mainSidebarCollapsed={mainSidebarCollapsed}>
      <div className="flex w-full h-[calc(100vh-120px)] overflow-hidden bg-gray-50 font-inter">
        <div className={`absolute top-0 left-0 h-full transition-all duration-300 z-40 ${sidebarCollapsed ? "-ml-72" : "ml-0"}`}>
          <Sidebar chats={chats} chatId={chatId} loadChat={loadChat} createNewChat={createNewChat} updateChatList={updateChatList} />
        </div>

        <button
          onClick={() => { setMainSidebarCollapsed((prev) => !prev); toggleSidebar(); }}
          className={`absolute bottom-60 ${sidebarCollapsed ? "left-[0]" : "left-72"} z-40 h-16 w-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-r-xl shadow hover:brightness-105 transition-all duration-300`}
          title={sidebarCollapsed ? "Exibir chat" : "Ocultar chat"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-blue-500" /> : <ChevronLeft className="w-5 h-5 text-blue-500" />}
        </button>

        <div className="flex-1 flex flex-col h-full p-6 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? "0" : "18rem" }}>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-4xl font-bold mt-12 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-theme-dark)]">
                Olá, como posso ajudar hoje?
              </h2>
              <p className="text-gray-500 text-lg mt-4">Escolha diferentes modelos e teste novas ideias</p>
            </div>
          ) : (
            <MessageListVirtualized
              messages={messages}
              height={window.innerHeight - 200}
              width="100%"
            />
          )}

          <div className="mt-4 flex flex-col gap-3 rounded-3xl shadow-xl p-6 border border-gray-200">
            <ChatInput 
              input={input} 
              setInput={setInput} 
              handleSend={() => {
                handleSend({ input, files, model, temperature, maxTokens, isTemperatureLocked });
                setInput("");
                setFiles([]);
              }} 
              handleStop={handleStop} 
              loading={loading} 
              files={files} 
              setFiles={setFiles} 
              attachmentsAllowed={attachmentsAllowed} 
            />
            <ChatControls model={model} setModel={setModel} temperature={temperature} setTemperature={setTemperature} maxTokens={maxTokens} setMaxTokens={setMaxTokens} isTemperatureLocked={isTemperatureLocked} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default TextGeneration;
