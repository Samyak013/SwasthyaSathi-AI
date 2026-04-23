import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User as UserIcon, Languages, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES, LANGUAGE_PROMPTS, HEALTH_TOPICS } from "@/lib/languageConfig";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: string;
  timestamp: string;
}

interface AIChatbotProps {
  userId?: string;
}

export default function AIChatbot({ userId }: AIChatbotProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Use realistic timestamp for April 23, 2026 at 10:30 AM
  const getTimeString = () => {
    const date = new Date(2026, 3, 23, 10, 30);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: LANGUAGE_PROMPTS.en.greeting,
      language: "en",
      timestamp: getTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [languageChanged, setLanguageChanged] = useState(false);
  const { toast } = useToast();

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/ai-chat/history", userId],
    enabled: !!userId,
  });

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [messages]);

  // Language change handler with greeting message
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setLanguageChanged(true);
    
    // Add greeting in new language with realistic timestamp
    const greetingMessage: Message = {
      id: `greeting-${Date.now()}`,
      role: "assistant",
      content: (LANGUAGE_PROMPTS as any)[newLanguage]?.greeting || LANGUAGE_PROMPTS.en.greeting,
      language: newLanguage,
      timestamp: getTimeString(),
    };
    
    setMessages((prev) => [...prev, greetingMessage]);
    
    toast({
      title: "Language Changed",
      description: `Now responding in ${(SUPPORTED_LANGUAGES as any)[newLanguage]?.name}`,
    });
  };

  const chatMutation = useMutation({
    mutationFn: async ({ message, language: lang }: { message: string; language: string }) => {
      try {
        const response = await apiRequest("POST", "/api/ai-chat", {
          userId: userId || "guest",
          message,
          language: lang,
        });
        return await response.json();
      } catch (error: any) {
        console.error("Chat API error:", error);
        throw new Error(error.message || "Failed to get response from AI");
      }
    },
    onSuccess: (data) => {
      if (data?.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          language,
          timestamp: getTimeString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("No response from AI");
      }
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
      
      // Add error message in current language
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: (LANGUAGE_PROMPTS as any)[language]?.error || LANGUAGE_PROMPTS.en.error,
        language,
        timestamp: getTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      language,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    
    chatMutation.mutate({ message: messageText, language });
  };

  return (
    <Card className="w-full h-[600px] flex flex-col" data-testid="card-chatbot">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Health Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">
                {(SUPPORTED_LANGUAGES as any)[language]?.nativeName} • Responds in {(SUPPORTED_LANGUAGES as any)[language]?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40" data-testid="select-language">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  {(SUPPORTED_LANGUAGES as any)["en"].flag} English
                </SelectItem>
                <SelectItem value="hi">
                  {(SUPPORTED_LANGUAGES as any)["hi"].flag} हिंदी
                </SelectItem>
                <SelectItem value="mr">
                  {(SUPPORTED_LANGUAGES as any)["mr"].flag} मराठी
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4" ref={scrollRef}>
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                data-testid={`message-${message.id}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={message.role === "assistant" ? "bg-primary/10" : "bg-muted"}>
                    {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[70%]`}>
                  <div
                    className={`p-3 rounded-lg text-sm ${
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
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 max-w-[70%]">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder={(LANGUAGE_PROMPTS as any)[language]?.placeholder || "Ask about your health..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !chatMutation.isPending && handleSend()}
              disabled={chatMutation.isPending}
              data-testid="input-message"
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              data-testid="button-send"
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
