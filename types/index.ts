export interface Developer {
  name: string;
  handle: string;
  location: string;
  university: string;
  semester: number;
  stack: string[];
  values: {
    philosophy: string;
    approach: string;
  };
  contact: {
    email: string;
    status: "open-to-work";
  };
}

export type ProjectStatus = "LIVE" | "IN PROGRESS" | "COMPLETE";

export interface Project {
  id: string;
  title: string;
  fullTitle?: string;
  status: ProjectStatus;
  stack: string[];
  tagline: string;
  href: string;
}

export interface TerminalLine {
  id: string;
  type: "output" | "input" | "error" | "welcome";
  content: string;
}

export interface TerminalState {
  output: TerminalLine[];
  history: string[];
  histIdx: number;
}

export type TerminalAction =
  | { type: "PUSH"; line: TerminalLine }
  | { type: "CLEAR" }
  | { type: "PUSH_HISTORY"; cmd: string }
  | { type: "SET_HIST_IDX"; idx: number };
