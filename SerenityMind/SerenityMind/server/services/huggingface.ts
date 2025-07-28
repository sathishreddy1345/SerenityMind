interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

interface SentimentResponse {
  label: string;
  score: number;
}

export class HuggingFaceService {
  private apiKey: string;
  private apiUrl: string = "https://api-inference.huggingface.co/models";

  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY || process.env.HF_TOKEN || "";
    if (!this.apiKey) {
      console.warn("Hugging Face API key not found. Chatbot functionality will be limited.");
    }
  }

  private async makeRequest(endpoint: string, payload: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Hugging Face API key not configured");
    }

    const response = await fetch(`${this.apiUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async generateChatResponse(message: string, context: string = ""): Promise<string> {
    try {
      // Use DialoGPT for conversational responses
      const prompt = context ? `${context}\nUser: ${message}\nAssistant:` : `User: ${message}\nAssistant:`;
      
      const response = await this.makeRequest("microsoft/DialoGPT-medium", {
        inputs: prompt,
        parameters: {
          max_length: 150,
          temperature: 0.7,
          do_sample: true,
          pad_token_id: 50256
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Extract the assistant's response
      let generatedText = response[0]?.generated_text || "I'm here to listen and support you.";
      
      // Clean up the response to only include the assistant's part
      if (generatedText.includes("Assistant:")) {
        generatedText = generatedText.split("Assistant:").pop()?.trim() || generatedText;
      }

      // Add mental health context and empathy
      return this.addMentalHealthContext(generatedText, message);
    } catch (error) {
      console.error("Error generating chat response:", error);
      return this.getFallbackResponse(message);
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    try {
      const response = await this.makeRequest("cardiffnlp/twitter-roberta-base-sentiment-latest", {
        inputs: text
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const result = response[0] as SentimentResponse;
      return {
        sentiment: result.label.toLowerCase(),
        confidence: result.score
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return { sentiment: "neutral", confidence: 0.5 };
    }
  }

  async detectCrisisKeywords(message: string): Promise<boolean> {
    const crisisKeywords = [
      "suicide", "kill myself", "end it all", "no point living", "better off dead",
      "harm myself", "hurt myself", "can't go on", "giving up", "hopeless",
      "want to die", "end my life", "not worth living"
    ];

    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private addMentalHealthContext(response: string, userMessage: string): string {
    // Check if user message indicates distress
    const distressKeywords = ["anxious", "sad", "depressed", "worried", "scared", "stressed"];
    const isDistressed = distressKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (isDistressed) {
      const empathicResponses = [
        "I hear you, and what you're feeling is valid. ",
        "It sounds like you're going through a tough time. ",
        "Thank you for sharing that with me. ",
        "I'm here to support you through this. "
      ];
      
      const randomEmpathy = empathicResponses[Math.floor(Math.random() * empathicResponses.length)];
      return randomEmpathy + response;
    }

    return response;
  }

  private getFallbackResponse(message: string): string {
    const fallbackResponses = [
      "I'm here to listen and support you. Can you tell me more about how you're feeling?",
      "Thank you for sharing that with me. How has your day been going?",
      "I understand this might be difficult to talk about. What would help you feel better right now?",
      "It's important that you're reaching out. What's been on your mind lately?",
      "I'm here for you. Would you like to try a breathing exercise or talk about something else?"
    ];

    // Simple keyword matching for more relevant fallback responses
    if (message.toLowerCase().includes("anxious") || message.toLowerCase().includes("anxiety")) {
      return "Anxiety can feel overwhelming, but you're not alone. Would you like to try a breathing exercise together?";
    }
    
    if (message.toLowerCase().includes("sad") || message.toLowerCase().includes("depressed")) {
      return "I hear that you're feeling sad. It's okay to feel this way. What has been most challenging for you today?";
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

export const huggingFaceService = new HuggingFaceService();
