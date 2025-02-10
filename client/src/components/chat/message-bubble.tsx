import { cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === "bot";
  
  return (
    <div className={cn(
      "flex w-full",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2 mb-2",
        isBot ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
      )}>
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
