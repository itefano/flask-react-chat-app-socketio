import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import AppBar from "./components/AppBar";
import Profile from "./components/Profile";
import UseToken from "./components/UseToken";
import { ThemeProvider } from "@mui/material/styles";
import Theme, { lightTheme, darkTheme } from "./context/Theme";
import { useContext, useState, useEffect } from "react";
import Contacts from "./components/Contacts";
import Groups from "./components/Groups";
import Chat from "./components/Chat"
import { InfoSharp } from "@mui/icons-material";
function App() {
    const [theme, setTheme] = useState(useContext(Theme));
    const [info, setInfo] = useState({});
    const [room, setRoom] = useState(null);
    const addInfo = (infos) => {
        let key = Object.keys(infos);
        let newInfo = { ...info };
        for (let i = 0; i < key.length; i++) {
            console.log('key:', key[i])
            newInfo[key[i]]= infos[key[i]];
        }
        setInfo(newInfo);
    };

    useEffect(()=>{
        let key = Object.keys(info);
        for (let i = 0; i < key.length; i++) {
            localStorage.setItem(String(key), info[key]);
        }
    }, [info])
    
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
                            info={info}
                        />
                        {!token && token !== "" && token !== undefined ? (
                            <Routes>
                                <Route
                                    exact
                                    path="/"
                                    element={<Login setToken={setToken} addInfo={addInfo} />}
                                ></Route>
                            </Routes>
                        ) : (
                            <Routes>
                                <Route exact path="/" element={<Homepage />} />
                                <Route
                                    exact
                                    path="/contacts"
                                    element={<Contacts token={token} />}
                                />
                                <Route
                                    exact
                                    path="/groups"
                                    element={<Groups token={token} room={room} setRoom={setRoom}/>}
                                />
                                <Route
                                    path="/chat"
                                    element={<Chat theme={theme} token={token} room={room} setRoom={setRoom}/>}
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
            </div>
        </ThemeProvider>
    );
}

export default App;
