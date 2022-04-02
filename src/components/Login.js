import { useState } from "react";
import axios from "axios";
import { Alert, Box } from "@mui/material";

function Login(props) {
    const addName = (name) => {
        localStorage.setItem("firstName", name);
    };

    const [loginForm, setloginForm] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    function logMeIn(event) {
        axios({
            method: "POST",
            url: "/api/token",
            data: {
                email: loginForm.email,
                password: loginForm.password,
            },
        })
            .then((response) => {
                props.setToken(response.data.access_token);
                console.log('addName', response.data.firstName)
                addName(response.data.firstName);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.data.msg);
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        setloginForm({
            email: "",
            password: "",
        });
        event.preventDefault();
    }
    function handleChange(event) {
        const { value, name } = event.target;
        setloginForm((prevNote) => ({
            ...prevNote,
            [name]: value,
        }));
    }
    return (
        <Box>
            <h1>Login</h1>
            <form className="login" onSubmit={logMeIn}>
                <input
                    onChange={handleChange}
                    type="text"
                    text={loginForm.email}
                    name="email"
                    placeholder="Email"
                    value={loginForm.email}
                />
                <input
                    onChange={handleChange}
                    type="password"
                    text={loginForm.password}
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                />
                <Box width="300px" sx={{ margin: "auto" }} py={2}>
                    {errorMessage !== "" ? (
                        <Alert severity="error">{errorMessage}</Alert>
                    ) : (
                        ""
                    )}
                </Box>
                <button type="submit">Submit</button>
            </form>
        </Box>
    );
}
export default Login;
