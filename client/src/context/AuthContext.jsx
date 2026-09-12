import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if Supabase session is active
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Check for local demo user session
      const savedDemo = localStorage.getItem("algocraft_demo_user");
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
        } catch (e) {
          console.error("Failed to parse demo user", e);
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or use 'Instant Demo Login'.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or use 'Instant Demo Login'.");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  };

  const signInWithOAuth = async (provider) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet. Please configure OAuth in your Supabase dashboard or use 'Instant Demo Login'.");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem("algocraft_demo_user");
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  const demoLogin = (customName = "Shivansh Rai", customEmail = "shivanshrai282@gmail.com") => {
    const demoUser = {
      id: "demo-user-algocraft",
      email: customEmail,
      user_metadata: {
        full_name: customName,
        avatar_url: ""
      },
      isDemo: true
    };
    localStorage.setItem("algocraft_demo_user", JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
