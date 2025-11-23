export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  widget?: WidgetConfig;
  isError?: boolean;
}

export type ComponentType = 'barChart' | 'lineChart' | 'pieChart' | 'metricCard' | 'dataTable' | 'alert' | 'cardGrid';

export interface WidgetConfig {
  id: string;
  type: ComponentType;
  title: string;
  data: any; // Flexible data structure depending on type
  description?: string;
}

// Function Calling Tool Types
export interface ToolCallArgs {
  componentType: ComponentType;
  title: string;
  data: string; // JSON string that needs parsing
  description: string;
}