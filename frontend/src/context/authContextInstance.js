import { createContext } from "react";

/**
 * Auth context instance — isolated so AuthProvider.jsx
 * only exports a component and satisfies Fast Refresh.
 */
export const AuthContext = createContext(null);
