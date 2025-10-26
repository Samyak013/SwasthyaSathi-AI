import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User as UserIcon, Languages } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  timestamp: string;
}

interface AIChatbotProps {
  onSendMessage?: (message: string, language: string) => void;
}

export default function AIChatbot({ onSendMessage }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    //todo: remove mock functionality
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI health assistant. How can I help you today?",
      language: "English",
      timestamp: "10:00 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    onSendMessage?.(input, language);

    //todo: remove mock functionality
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand your concern. Based on your question, I recommend consulting with your doctor for a proper evaluation.",
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col" data-testid="card-chatbot">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Health Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">Multilingual Support</p>
            </div>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32" data-testid="select-language">
              <Languages className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                data-testid={`message-${message.id}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={message.role === "assistant" ? "bg-primary/10" : "bg-muted"}>
                    {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[70%]`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your health..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              data-testid="input-message"
            />
            <Button onClick={handleSend} size="icon" data-testid="button-send">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
