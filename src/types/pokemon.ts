export type Pokemon = {
  id: number;
  name: string;
  sprite: string;
  weight: number;
  height: number;
  base_experience: number;
  types: string[];
  abilities: string[];
};

export type Votes = {
  [key: string]: number;
};

export type ChatMessage = {
  from: string;
  message: string;
};
