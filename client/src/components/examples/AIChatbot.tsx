import AIChatbot from "../AIChatbot";

export default function AIChatbotExample() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AIChatbot onSendMessage={(msg, lang) => console.log("Message sent:", msg, lang)} />
    </div>
  );
}
