import { useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Container,
    TextField,
    Typography,
    Button,
} from "@mui/material";

function Login(props) {
    const [loginForm, setloginForm] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(false);
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
                let info = { ...response.data };
                delete info.access_token;
                setError(false);
                setErrorMessage("");
                props.addInfo(info);
            })
            .catch((error) => {
                if (error.response) {
                    setErrorMessage(error.response.data.msg);
                    setError(true);
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
        <Box sx={{ textAlign: "center" }} py={2}>
            <Container maxWidth="sm">
                <Typography variant="h4" color="text.primary" pb={2}>
                    Login
                </Typography>
                <form
                    className="login"
                    onSubmit={logMeIn}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={loginForm.email}
                        name="email"
                        placeholder="Email"
                        value={loginForm.email}
                        error={error}
                        sx={{paddingBottom:'1rem'}}
                    />
                    
                    <TextField
                        onChange={handleChange}
                        type="password"
                        text={loginForm.password}
                        name="password"
                        placeholder="Password"
                        value={loginForm.password}
                        error={error}
                    />
                    <Box width="300px" sx={{ margin: "auto" }} py={2}>
                        {errorMessage !== "" ? (
                            <Alert severity="error">{errorMessage}</Alert>
                        ) : (
                            ""
                        )}
                    </Box>
                    <Button variant="outlined" type="submit">
                        Submit
                    </Button>
                </form>
            </Container>
        </Box>
    );
}
export default Login;
