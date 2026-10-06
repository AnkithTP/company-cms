const TOKEN_KEY = "company_cms_token";
const USER_KEY = "company_cms_user";

export const storage = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getUser(): any | null {
        const item = localStorage.getItem(USER_KEY);
        if (!item) return null;
        try {
            return JSON.parse(item);
        } catch {
            return null;
        }
    },

    setUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
};
