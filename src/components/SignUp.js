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
    IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useNavigate } from "react-router-dom";

export default function SignUp(props) {
    const navigate = useNavigate();
    const [signUpForm, setSignUpForm] = useState({
        email: "",
        password1: "",
        password2: "",
        firstName: "",
        lastName: "",
        gender: "",
    });
    const [errorPassword, setErrorPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState({
        email: false,
        firstName: false,
        lastName: false,
        password: false,
        profilePicture: false,
        gender: false,
    });
    function logMeIn(event) {
        if (signUpForm.password1 !== signUpForm.password2) {
            setErrorPassword(true);
            setErrorMessage("Passwords don't match.");
        } else {
            if (
                signUpForm.email !== "" &&
                signUpForm.password1 !== "" &&
                signUpForm.password2 !== ""
            ) {
                const formData = new FormData();
                for (const [k, v] of Object.entries(signUpForm)) {
                    if (v && v.length > 0) {
                        formData.append(k, v);
                    }
                }
                formData.append("file", file);
                axios({
                    method: "POST",
                    url: "/api/signup",
                    data: formData,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                    .then((response) => {
                        navigate("/login", {
                            state: {
                                successMsg: "Account created successfully!",
                            },
                        });
                    })
                    .catch((err) => {
                        if (err.response) {
                            if (
                                err.response.data.error &&
                                err.response.data.error !== "" &&
                                err.response.data.error !== null &&
                                err.response.data.error !== undefined
                            ) {
                                setErrorMessage(err.response.data.error);
                            } else {
                                setErrorMessage(
                                    "Something went wrong. Please try again in a few seconds."
                                );
                            }
                            setError((prevState)=>{
                                const nState = {...prevState};
                                for (const k of Object.keys(nState)) {
                                    if (k === err.response.data.errorToSet)
                                    {
                                        nState[k] = true;
                                    }
                                    else {
                                        nState[k] = false;
                                    }
                                }
                                return nState;
                            });
                            if (err.response.status !== 401) {
                                console.log(err.response);
                                console.log(err.response.status);
                                console.log(err.response.headers);
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
                    Sign up
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
                        label="Email"
                        placeholder="Ex: email@domain.com"
                        value={signUpForm.email}
                        error={error.email}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        label="Password"
                        type="password"
                        text={signUpForm.password1}
                        name="password1"
                        placeholder="Password"
                        value={signUpForm.password1}
                        error={error.password}
                        sx={{ paddingBottom: "1rem" }}
                    />
                    <TextField
                        onChange={handleChange}
                        label="Confirm password"
                        type="password"
                        text={signUpForm.password2}
                        name="password2"
                        placeholder="Confirm Password"
                        value={signUpForm.password2}
                        error={error.password}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={signUpForm.firstName}
                        label="First Name"
                        name="firstName"
                        placeholder="John"
                        value={signUpForm.firstName}
                        error={error.firstName}
                        sx={{ paddingBottom: "1rem" }}
                    />

                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={signUpForm.lastName}
                        label="Last Name"
                        name="lastName"
                        placeholder="Doe"
                        value={signUpForm.lastName}
                        error={error.lastName}
                        sx={{ paddingBottom: "1rem" }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box width="60%">
                            <FormControl fullWidth>
                                <InputLabel id="genderSelect-label">
                                    Gender
                                </InputLabel>
                                <Select
                                    labelId="genderSelect-label"
                                    id="genderSelect"
                                    value={signUpForm.gender}
                                    label="Gender"
                                    error={error.gender}
                                    name="gender"
                                    onChange={handleChange}
                                    sx={{ textAlign: "left" }}
                                >
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Non-binary">
                                        Non-binary
                                    </MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                    <MenuItem value="Unknown">
                                        Prefer not to say
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box pl={2}>
                            <Button
                                variant="outlined"
                                color={
                                    error.profilePicture ? "error" : "primary"
                                }
                                component="label"
                            >
                                <Typography variant="p">
                                    Profile Picture
                                </Typography>
                                <input
                                    hidden
                                    accept="image/*"
                                    multiple
                                    type="file"
                                    onChange={(e) => {
                                        setFile(e.target.files[0]);
                                    }}
                                />
                            </Button>
                            <IconButton
                                color={
                                    error.profilePicture ? "error" : "primary"
                                }
                                aria-label="upload picture"
                                component="label"
                            >
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={(e) => {
                                        setFile(e.target.files[0]);
                                    }}
                                />
                                <PhotoCamera />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box width="100%" sx={{ margin: "auto" }} py={1}>
                        {errorMessage !== "" ? (
                            <Alert
                                severity="error"
                                variant="filled"
                                onClose={() => {
                                    setErrorMessage("");
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        ) : (
                            ""
                        )}
                    </Box>
                    <Button variant="contained" type="submit">
                        Sign up
                    </Button>
                </form>
            </Container>
        </Box>
    );
}
