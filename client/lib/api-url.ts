// Dynamic API URL resolution for Docker compatibility
// Client-side (browser): uses NEXT_PUBLIC_API_URL (http://localhost:3900/api/v1)
// Server-side (Docker): uses API_URL_INTERNAL (http://server-dev:3900/api/v1)

const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use public URL for browser requests
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3900/api/v1";
    } else {
        // Server-side: use internal Docker service name
        return process.env.API_URL_INTERNAL || "http://localhost:3900/api/v1";
    }
};

const nestApiUrl = getApiUrl();

export default nestApiUrl;
