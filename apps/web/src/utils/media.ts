export const getMediaUrl = (path?: string | null): string => {
    if (!path) return "";
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("blob:") ||
        path.startsWith("data:")
    ) {
        return path;
    }
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
    const origin = apiUrl.replace(/\/api\/v1\/?$/, "");
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
};
