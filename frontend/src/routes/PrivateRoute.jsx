import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function PrivateRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to={"/login"}></Navigate>;
  return <Outlet></Outlet>;
}

export default PrivateRoute;
