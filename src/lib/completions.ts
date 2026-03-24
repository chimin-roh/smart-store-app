import fs from "fs";
import path from "path";
import type { CompletionState } from "./types";

const FILE_PATH = path.join(process.cwd(), "data", "completions.json");

export function loadCompletions(): CompletionState {
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setCompletion(
  productOrderId: string,
  completed: boolean,
): CompletionState {
  const state = loadCompletions();
  if (completed) {
    state[productOrderId] = true;
  } else {
    delete state[productOrderId];
  }
  const dir = path.dirname(FILE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(state, null, 2));
  return state;
}
