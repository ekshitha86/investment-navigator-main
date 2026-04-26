import { useEffect, useState } from "react";
import { Login } from "@/components/aura/Login";
import { Dashboard } from "@/components/aura/Dashboard";
import { getUser, type User } from "@/lib/storage";

/** Root page: gates Dashboard behind a name-based login. */
const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
    document.title = "InvestmentsCalc";
  }, []);

  if (!ready) return <div className="min-h-dvh bg-background" />;

  return user ? (
    <Dashboard user={user} onLogout={() => setUser(null)} />
  ) : (
    <Login onAuthed={() => setUser(getUser())} />
  );
};

export default Index;
