import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from "./contexts/AuthProvider";
import NonAuthRoute from "./routes/NonAuthRoute";
import PrivateRoute from "./routes/PrivateRoute";
import Main from "./pages/Main";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<NonAuthRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route path="*" element={<Main />}></Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
