import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { ToolCallArgs, WidgetConfig } from '../types';

// Tool Definition for UI Generation
const generateUiTool: FunctionDeclaration = {
  name: 'generate_ui_component',
  description: 'Generates a structured UI component (chart, table, metric, cards) to visualize data or information interactively.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      componentType: {
        type: Type.STRING,
        enum: ['barChart', 'lineChart', 'pieChart', 'metricCard', 'dataTable', 'alert', 'cardGrid'],
        description: 'The type of UI component to render. Use "cardGrid" for creative lists (movies, recipes), "dataTable" for dense data comparisons.',
      },
      title: {
        type: Type.STRING,
        description: 'The title of the widget.',
      },
      description: {
        type: Type.STRING,
        description: 'A short description or context for the data.',
      },
      data: {
        type: Type.STRING,
        description: 'A JSON string representing the data. For "dataTable" and "cardGrid", this MUST be an array of objects.',
      },
    },
    required: ['componentType', 'title', 'data'],
  },
};

const tools: Tool[] = [{ functionDeclarations: [generateUiTool] }];

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  apiKey: string
): Promise<{ text: string; widget?: WidgetConfig }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are a helpful, versatile AI assistant. 
    
    TONE: Friendly, clear, and concise. Avoid overly robotic or sci-fi language.
    
    CAPABILITIES:
    1. **Data Analysis**: Help with business metrics, sales, or technical logs.
    2. **Personal Assistant**: Help with movie recommendations, travel planning, meal prep, and shopping comparisons.

    VISUALIZATION RULES:
    - If the user asks for a list, comparison, or data, visualize it using 'generate_ui_component'.
    
    WIDGET GUIDE:
    - **cardGrid**: Use for "fun" visual lists (Movies, Books, Places, Recipes, Products).
      - Data for CardGrid: [{ "title": "Inception", "description": "...", "rating": "9.0", "category": "Sci-Fi", "tags": ["Dream", "Action"] }]
    - **dataTable**: Use for detailed comparisons (Phone specs, Financials).
    - **metricCard**: Use for quick stats.
    - **Charts**: Use for trends or distributions.

    IMPORTANT:
    - Generate REALISTIC data.
    - For lists/tables, provide at least 5-6 items so the UI looks good.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: tools,
    },
    history: history.map(h => ({
        role: h.role,
        parts: h.parts
    })),
  });

  const response = await chat.sendMessage({ message });
  
  let outputText = "";
  let widget: WidgetConfig | undefined;

  if (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    if (call.name === 'generate_ui_component') {
      const args = call.args as unknown as any;
      
      try {
        let parsedData;
        if (typeof args.data === 'string') {
          parsedData = JSON.parse(args.data);
        } else {
          parsedData = args.data;
        }
        
        widget = {
          id: Math.random().toString(36).substr(2, 9),
          type: args.componentType,
          title: args.title,
          description: args.description,
          data: parsedData
        };
        
        if (!response.text) {
             outputText = "Here is the visual summary you asked for.";
        }
      } catch (e) {
        console.error("Failed to parse widget data", e);
        outputText = "I tried to generate a visual, but something went wrong with the data format.";
      }
    }
  } 
  
  if (response.text) {
      outputText = response.text;
  }

  return { text: outputText, widget };
};