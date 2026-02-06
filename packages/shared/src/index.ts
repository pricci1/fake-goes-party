export const APP_NAME = "Fake Goes Party";

export function greet(name: string): string {
  return `Welcome to ${APP_NAME}, ${name}!`;
}

export type User = {
  id: string;
  name: string;
};
