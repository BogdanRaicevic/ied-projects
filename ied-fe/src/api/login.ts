import { LoginSchema } from "./types/auth-types";

export const login = async ({ email, password }: LoginSchema) => {
  const response = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(LoginSchema.parse({ email, password })),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};
