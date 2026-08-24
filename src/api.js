// Central API Base URL helper
// Uses relative '/api' when served by Express in production, or fallback for standalone client dev
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
