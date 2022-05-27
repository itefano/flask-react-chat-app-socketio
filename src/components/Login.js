import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Container,
    TextField,
    Typography,
    Button,
    Snackbar
} from "@mui/material";
import { useLocation } from "react-router-dom";

function Login(props) {
    const [loginForm, setloginForm] = useState({
        email: "",
        password: "",
    });
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const location = useLocation();
    useEffect(()=>{
        if (location.state && location.state.successMsg !== undefined && location.state.successMsg !== null && location.state.successMsg !== "") {
            setSnackBarMessage(location.state.successMsg);
        }
    }, [location])
    useEffect(()=>{
        if (snackBarMessage && snackBarMessage !== "") {
        setSnackBarOpen(true);
        }
    }, [snackBarMessage])
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  };

    function logMeIn(event) {
        if (loginForm.email !== "" && loginForm.password !== "") {
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
                        if (
                            error.response.data.msg &&
                            error.response.data.msg !== "" &&
                            error.response.data.msg !== null &&
                            error.response.data.msg !== undefined
                        ) {
                            setErrorMessage(error.response.data.msg);
                        } else {
                            setErrorMessage(
                                "Something went wrong. Please try again in a few seconds."
                            );
                        }
                        setError(true);
                        if (error.response.status !== 401) {
                            console.log(error.response);
                            console.log(error.response.status);
                            console.log(error.response.headers);
                        }
                    }
                });
        }
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
                        sx={{ paddingBottom: "1rem" }}
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
                    <Box width="100%" sx={{ margin: "auto" }} py={2}>
                        {errorMessage !== "" ? (
                            <Alert
                                severity="error"
                                variant="filled"
                                onClose={() => {
                                    setErrorMessage("");
                                    setError(false);
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        ) : (
                            ""
                        )}
                    </Box>
                    <Button variant="outlined" type="submit">
                        Submit
                    </Button>
                </form>
            </Container>
            <Snackbar open={snackBarOpen} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                
                {snackBarMessage}
            </Alert>
            </Snackbar>
        </Box>
    );
}
export default Login;
