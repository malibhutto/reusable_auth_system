import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Access active authentication context parameters and triggers.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper');
  }
  return context;
};

export default useAuth;
