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
        description: 'The type of UI component to render. Use "cardGrid" for rich visual lists (Recipes, Movies, Steps, Products).',
      },
      title: {
        type: Type.STRING,
        description: 'The title of the widget (in Chinese).',
      },
      description: {
        type: Type.STRING,
        description: 'A short description or context for the data (in Chinese).',
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
    You are a helpful, versatile AI assistant named Nexus. 
    
    LANGUAGE RULES:
    - **ALWAYS respond in Simplified Chinese (简体中文)**.
    - Ensure all generated charts, titles, and descriptions are in Chinese.
    
    UI/VISUALIZATION STRATEGY (CRITICAL):
    - Users prefer **Beautiful UI** over plain text.
    - **Cooking/Recipes (烹饪/食谱)**: If asked "How to cook X" (怎么做X), ALWAYS use a **'cardGrid'** to show 3-4 distinct recipe variations (e.g., Spicy, Home-style, Steam).
      - Data Format: [{ "title": "家常红烧肉", "description": "经典做法，肥而不腻...", "rating": "难度: 中", "category": "热门", "tags": ["五花肉", "45分钟"] }]
    - **Lists/Recommendations**: Use 'cardGrid' (Movies, Books, Travel Plans).
    - **Comparisons**: Use 'dataTable' (Phone specs, Prices).
    - **Stats/Trends**: Use 'metricCard' or Charts.

    WIDGET DATA SPECS:
    - **cardGrid**: 
       - Fields: title, description, rating (can be text like "4.5" or "Easy"), category, tags (array of strings).
       - Provide at least 3-4 items.
    - **dataTable**: Ensure columns are useful.

    TONE: Friendly, professional, clear.
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
             outputText = `已为您生成 "${args.title}" 的相关视图：`;
        }
      } catch (e) {
        console.error("Failed to parse widget data", e);
        outputText = "尝试生成可视化组件时数据格式出现错误。";
      }
    }
  } 
  
  if (response.text) {
      outputText = response.text;
  }

  return { text: outputText, widget };
};