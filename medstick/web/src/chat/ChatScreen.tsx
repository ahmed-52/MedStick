import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { ChatHeader } from './ChatHeader'
import { useChat } from './useChat'

export function ChatScreen() {
  const { messages, send, streaming, appendInline, reset, deleteCurrent } = useChat()
  return (
    <div className="h-full flex flex-col">
      <ChatHeader hasMessages={messages.length > 0} onNew={reset} onDelete={deleteCurrent} />
      <MessageList messages={messages} />
      <Composer onSend={send} onAppendInline={appendInline} disabled={streaming} />
    </div>
  )
}
