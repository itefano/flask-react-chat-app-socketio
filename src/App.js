import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import AppBar from "./components/AppBar";
import Profile from "./components/Profile";
import UseToken from "./components/UseToken";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import Theme, { lightTheme, darkTheme } from "./context/Theme";
import { useContext, useState, useEffect } from "react";
import Contacts from "./components/Contacts";
import Groups from "./components/Groups";
import Chat from "./components/Chat";
import axios from "axios";

function App() {
    const [theme, setTheme] = useState(useContext(Theme));
    const [info, setInfo] = useState({});
    const [room, setRoom] = useState(null);
    const addInfo = (infos) => {
        setInfo({ ...infos });
    };

    useEffect(() => {
        if (
            info &&
            info !== null &&
            info !== undefined &&
            Object.keys(info).length > 0
        ) {
            localStorage.setItem("info", JSON.stringify({ ...info }));
        } else if (token !== null && token !== undefined && token !== "") {
            axios({
                method: "POST",
                url: "/api/get_info",
                headers: {
                    Authorization: "Bearer " + token,
                },
            })
                .then((response) => {
                    setInfo(response.data);
                })
                .catch((error) => {
                    //disconnects user for safety in case something goes wrong
                    axios({
                        method: "POST",
                        url: "/api/logout",
                    })
                        .then((response) => {
                            removeToken();
                            localStorage.clear();
                        })
                        .catch((error) => {
                            if (error.response) {
                                //at this point I don't even know what to do
                                console.log(error.response);
                                console.log(error.response.status);
                                console.log(error.response.headers);
                            }
                        });
                    if (error.response && error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    }, [info]);

    useEffect(() => {
        if (
            !info ||
            Object.keys(info).length === 0 ||
            info === null ||
            info === undefined
        ) {
            setInfo(JSON.parse(localStorage.getItem("info")));
        }
    }, []);

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
            <Box
                className="App"
                sx={{
                    bgcolor: "background.default",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <BrowserRouter>
                    <div className="App">
                        <AppBar
                            removeToken={removeToken}
                            token={token}
                            handleTheme={handleTheme}
                            info={info}
                        />
                        {!token || token === "" || token === undefined ? (
                            <Routes>
                                <Route
                                    path="*"
                                    element={
                                        <Login
                                            setToken={setToken}
                                            addInfo={addInfo}
                                        />
                                    }
                                ></Route>
                            </Routes>
                        ) : (
                            <Routes>
                                <Route
                                    exact
                                    path="/"
                                    element={<Homepage info={info} />}
                                />
                                <Route
                                    exact
                                    path="/contacts"
                                    element={
                                        <Contacts
                                            token={token}
                                            setRoom={setRoom}
                                            room={room}
                                        />
                                    }
                                    setRoom={setRoom}
                                />
                                <Route
                                    exact
                                    path="/groups"
                                    element={
                                        <Groups
                                            token={token}
                                            room={room}
                                            setRoom={setRoom}
                                        />
                                    }
                                />
                                <Route
                                    path="/chat"
                                    element={
                                        <Chat
                                            theme={theme}
                                            token={token}
                                            room={room}
                                            setRoom={setRoom}
                                        />
                                    }
                                />
                                <Route
                                    exact
                                    path="/profile"
                                    element={
                                        <Profile
                                            token={token}
                                            setToken={setToken}
                                        />
                                    }
                                />
                            </Routes>
                        )}
                    </div>
                </BrowserRouter>
            </Box>
        </ThemeProvider>
    );
}

export default App;
