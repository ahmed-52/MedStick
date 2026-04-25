import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { useChat } from './useChat'

export function ChatScreen() {
  const { messages, send, streaming, appendInline } = useChat()
  return (
    <div className="h-full flex flex-col">
      <MessageList messages={messages} />
      <Composer onSend={send} onAppendInline={appendInline} disabled={streaming} />
    </div>
  )
}
