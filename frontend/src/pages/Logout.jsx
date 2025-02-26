import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <h3>Logging out...</h3>;
}
