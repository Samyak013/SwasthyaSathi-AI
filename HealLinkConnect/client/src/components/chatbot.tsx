import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatbotProps {
  userRole: 'doctor' | 'patient' | 'pharmacy';
}

export default function Chatbot({ userRole }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Hello! I'm your AI health assistant. I can help with ${
        userRole === 'doctor' 
          ? 'patient summaries, symptom analysis, and medical queries' 
          : userRole === 'patient'
          ? 'health information, appointment scheduling, and medical questions'
          : 'prescription verification, drug interactions, and inventory management'
      }. How can I assist you today?`,
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const { toast } = useToast();

  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/chatbot/query", {
        message: query,
        context: userRole
      });
      return await res.json();
    },
    onSuccess: (response) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      toast({
        title: "AI Assistant Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40 md:bottom-4 bg-accent hover:bg-accent/90"
        onClick={() => setIsOpen(true)}
        data-testid="button-chatbot-toggle"
      >
        <Bot className="h-6 w-6 text-accent-foreground" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-36 right-4 w-80 max-w-[calc(100vw-2rem)] shadow-xl z-40 md:bottom-20">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-card-foreground">AI Health Assistant</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
            data-testid="button-chatbot-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-card-foreground'
                }`}
                data-testid={`message-${msg.sender}-${msg.id}`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted/30 rounded-lg p-3 text-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="input-chatbot-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || chatMutation.isPending}
              className="bg-accent hover:bg-accent/90"
              data-testid="button-chatbot-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
