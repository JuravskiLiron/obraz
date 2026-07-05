// Single source of truth for persisted credentials + guest cart token.
// The API client and the auth store both go through here (avoids cycles).

const TOKENS_KEY = "farax.tokens";
const CART_TOKEN_KEY = "farax.cartToken";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export function getTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: StoredTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY);
}

export function getCartToken(): string | null {
  return localStorage.getItem(CART_TOKEN_KEY);
}

export function getOrCreateCartToken(): string {
  let token = localStorage.getItem(CART_TOKEN_KEY);
  if (!token) {
    token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CART_TOKEN_KEY, token);
  }
  return token;
}

export function clearCartToken(): void {
  localStorage.removeItem(CART_TOKEN_KEY);
}
