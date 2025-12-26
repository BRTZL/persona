export type Model = {
  id: string;
  name: string;
  description: string;
};

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini Flash",
    description: "Fast & balanced. Great for everyday conversations",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude Sonnet",
    description: "Thoughtful & nuanced. Excels at complex reasoning",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Versatile & reliable. Good all-around performance",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1",
    description: "Open & direct. Community-driven intelligence",
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0];

export function getModelById(id: string): Model | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
