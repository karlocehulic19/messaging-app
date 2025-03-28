import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from "./contexts/AuthProvider";
import NonAuthRoute from "./routes/NonAuthRoute";
import PrivateRoute from "./routes/PrivateRoute";
import Main from "./pages/Main";
import Logout from "./pages/Logout";
import Settings from "./pages/Settings";
import PropTypes from "prop-types";

function App({
  routerRender = (children) => <BrowserRouter>{children}</BrowserRouter>,
}) {
  return (
    <>
      {routerRender(
        <AuthProvider>
          <Routes>
            <Route element={<NonAuthRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route path="/logout" element={<Logout />} />
              <Route path="/settings" element={<Settings />} />
              <Route path=":receiverUsername?" element={<Main />}></Route>
            </Route>
          </Routes>
        </AuthProvider>
      )}
    </>
  );
}

App.propTypes = {
  routerRender: PropTypes.func,
};

export default App;
