import { useState, createContext, useContext, ReactNode } from 'react';
import type { UserRole, User } from '@/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = (selectedRole: UserRole) => {
    const userMap: Record<UserRole, string> = {
      consumer: 'consumer1',
      provider: 'provider1',
      driver: 'driver1',
      admin: 'admin1',
    };
    setUser(mockUsers[userMap[selectedRole]]);
    setRole(selectedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const switchRole = (newRole: UserRole) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
