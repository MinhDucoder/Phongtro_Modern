import { authenticate } from './checkToken.js';

const authMiddleware = authenticate();

export default authMiddleware;

// Export authenticateToken as alias for authenticate
export const authenticateToken = authMiddleware;