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
import { Navigate, useLocation } from "react-router-dom";

function AddUser(props) {
    const [addUserForm, setAddUserForm] = useState({
        email: "",
    });
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    
    const [errorMessage, setErrorMessage] = useState("");
    const [error, setError] = useState(false);
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
    const addUser = (e) => {
        e.preventDefault();
        if (addUserForm && addUserForm.email !== "")
        {
            axios({
                method: "POST",
                url: "/api/addUser",
                data: {
                    email: addUserForm.email,
                },
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    setSnackBarMessage(response.data.message);
                    setAddUserForm({ email: "" });
                    setErrorMessage("");
                    setError(false);
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
    const handleChange = (event) => {
        const { value, name } = event.target;
        setAddUserForm((prevNote) => ({
            ...prevNote,
            [name]: value,
        }));
    }
    return (
        <Box sx={{ textAlign: "center" }} py={2}>
            <Container maxWidth="sm">
                <Typography variant="h4" color="text.primary" pb={2}>
                    Add user
                </Typography>
                <form
                    className="addUserForm"
                    onSubmit={addUser}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <TextField
                        onChange={handleChange}
                        type="text"
                        text={addUserForm.email}
                        name="email"
                        placeholder="User email"
                        value={addUserForm.email}
                        sx={{ paddingBottom: "1rem" }}
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
                        Add a friend
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
export default AddUser;
