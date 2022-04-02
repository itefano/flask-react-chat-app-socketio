import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Header from "./components/Header";
import AppBar from "./components/AppBar";
import Profile from "./components/Profile";
import UseToken from "./components/UseToken";
import { ThemeProvider } from "@mui/material/styles";
import Theme, { lightTheme, darkTheme } from "./context/Theme";
import { useContext, useState, useEffect } from "react";

function App() {
    const [theme, setTheme] = useState(useContext(Theme));
    const handleTheme = () => {
        if (theme.palette.mode === "light") {
            setTheme(darkTheme);
        } else {
            setTheme(lightTheme);
        }
    };
    const { token, removeToken, setToken } = UseToken();
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <BrowserRouter>
                    <div className="App">
                        <AppBar
                            removeToken={removeToken}
                            token={token}
                            handleTheme={handleTheme}
                        />
                        {!token && token !== "" && token !== undefined ? (
                            <Routes>
                                <Route
                                    exact
                                    path="/"
                                    element={<Login setToken={setToken} />}
                                ></Route>
                            </Routes>
                        ) : (
                            <Routes>
                                <Route
                                    exact
                                    path="/profile"
                                    element={
                                        <Profile
                                            token={token}
                                            setToken={setToken}
                                        />
                                    }
                                ></Route>
                            </Routes>
                        )}
                    </div>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    );
}

export default App;
