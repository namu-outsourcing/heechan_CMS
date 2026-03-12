import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL as string;

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        const session = data.session;
        if (!session) {
          setStatus("denied");
          return;
        }
        const userEmail = session.user.email ?? "";
        if (userEmail.toLowerCase() !== OWNER_EMAIL?.toLowerCase()) {
          supabase.auth.signOut().then(() => setStatus("denied"));
          return;
        }
        setStatus("allowed");
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (!session) setStatus("denied");
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
