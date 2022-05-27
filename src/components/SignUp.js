import { useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Container,
    TextField,
    Typography,
    Button,
    Select,
    InputLabel,
    MenuItem,
    FormControl,
} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function SignUp(props) {
    const navigate = useNavigate();
    const [signUpForm, setSignUpForm] = useState({
        email: "",
        password1: "",
        password2: "",
        firstName: "",
        lastName: "",
        gender: "",
        profilePicture: "",
    });
    const [errorPassword, setErrorPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(false);
    function logMeIn(event) {
        if (signUpForm.password1 !== signUpForm.password2) {
            setErrorPassword(true);
            setErrorMessage("Passwords don't match.");
        } else {
            if (signUpForm.email !== "" && signUpForm.password !== "") {
                axios({
                    method: "POST",
                    url: "/api/signup",
                    data: {
                        email: signUpForm.email,
                        firstName: signUpForm.firstName,
                        password1: signUpForm.password1,
                        password2: signUpForm.password2,
                        lastName: signUpForm.lastName,
                        gender: signUpForm.gender,
                        profilePicture: signUpForm.profilePicture,
                    },
                })
                    .then((response) => {
                        navigate('/login', { state: { successMsg:'Account created successfully!' }});
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
        }
        event.preventDefault();
    }
    function handleChange(event) {
        const { value, name } = event.target;
        setSignUpForm((prevNote) => ({
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
                        text={signUpForm.email}
                        name="email"
                        placeholder="Email"
                        value={signUpForm.email}
                        error={error}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        type="password"
                        text={signUpForm.password1}
                        name="password1"
                        placeholder="Password"
                        value={signUpForm.password1}
                        error={errorPassword}
                    />
                    <TextField
                        onChange={handleChange}
                        type="password"
                        text={signUpForm.password2}
                        name="password2"
                        placeholder="Confirm Password"
                        value={signUpForm.password2}
                        error={errorPassword}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={signUpForm.firstName}
                        name="firstName"
                        placeholder="First Name"
                        value={signUpForm.firstName}
                        error={error}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={signUpForm.lastName}
                        name="lastName"
                        placeholder="Last Name"
                        value={signUpForm.lastName}
                        error={error}
                        sx={{ paddingBottom: "1rem" }}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="genderSelect-label">Gender</InputLabel>
                        <Select
                            labelId="genderSelect-label"
                            id="genderSelect"
                            value={signUpForm.gender}
                            label="Gender"
                            name="gender"
                            onChange={handleChange}
                            sx={{textAlign:"left"}}
                        >
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Non-binary">Non-binary</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                            <MenuItem value="Unknown">
                                Prefer not to say
                            </MenuItem>
                        </Select>
                    </FormControl>
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
        </Box>
    );
}
