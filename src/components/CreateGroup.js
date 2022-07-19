import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Container,
    TextField,
    Typography,
    Button,
    Snackbar,
    Autocomplete,
    IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useLocation, useNavigate } from "react-router-dom";
import { is_email } from "../utils";
//TODO: BUGFIX: fix broken sockets (delay too long from time to time)
//TODO: Group edit & deletion, group exit, custom group admin, friendship remove, message edits, message replies, profile edit, account creation, file sending
function CreateGroup(props) {
    const navigate = useNavigate();
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const location = useLocation();
    const [friends, setFriends] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [nameError, setNameError] = useState(false);
    const [participantsError, setParticipantsError] = useState(false);
    const [participantFieldValues, setParticipantFieldValues] = useState([]); //for the controlled prop display
    const [participantList, setParticipantList] = useState([]); //for the rest
    const [file, setFile] = useState(null);
    const updateParticipants = (info) => {
        if (typeof info[info.length - 1] === "string") {
            //for custom entered values (emails)
            if (is_email(info[info.length - 1])) {
                setParticipantFieldValues([
                    ...participantFieldValues,
                    info[info.length - 1],
                ]);
                setParticipantList([
                    ...participantList,
                    info[info.length - 1].trim(),
                ]); //trimming is technically useless, but it looks better
            } else {
                return false;
            }
        } else {
            setParticipantFieldValues([
                ...participantFieldValues,
                info[info.length - 1].firstName +
                    " " +
                    info[info.length - 1].lastName,
            ]);
            setParticipantList([
                ...participantList,
                info[info.length - 1].email.trim(), //trimming is technically useless, but it looks better
            ]);
        } //didn't know how to both filter and map at the same time. Should probably have used reduce() though
    };

    useEffect(() => {
        axios({
            method: "GET",
            url: "/api/contactlist",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                setFriends(res);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    }, [props.token]);
    useEffect(() => {
        if (
            location.state &&
            location.state.successMsg !== undefined &&
            location.state.successMsg !== null &&
            location.state.successMsg !== ""
        ) {
            setSnackBarMessage(location.state.successMsg);
        }
    }, [location]);

    useEffect(() => {
        if (snackBarMessage && snackBarMessage !== "") {
            setSnackBarOpen(true);
        }
    }, [snackBarMessage]);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setSnackBarOpen(false);
    };

    const createGroup = (e) => {
        e.preventDefault();
        if (participantList && participantList.length > 1) {
            if (groupName && groupName !== "") {
                setNameError(false);
                setErrorMessage("");
                setParticipantsError(false);
                const data = new FormData();
                data.append("file", file);
                data.append("emailList", participantList);
                data.append("groupName", groupName); 
                
                axios({
                    method: "POST",
                    url: "/api/createGroup",
                    data: data,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": "Bearer " + props.token,
                    },
                })
                    .then((response) => {
                        setSnackBarMessage(response.data.error);
                        setErrorMessage("");
                        if (response.data.success === true) {
                            navigate("/chat", {
                                state: { groupId: response.data.roomId },
                            });
                        }
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
                            if (error.response.status !== 401) {
                                console.log(error.response);
                                console.log(error.response.status);
                                console.log(error.response.headers);
                            }
                        }
                    });
            } else {
                setNameError(true);
                setErrorMessage("Please enter a name for the group!");
            }
        } else {
            setParticipantsError(true);
            if (groupName && groupName !== "") {
                setErrorMessage(
                    "Group chats need to have at least two (2) participants."
                );
            } else {
                setNameError(true);
                setErrorMessage("Please fill-in the required information.");
            }
        }
    };
    return (
        <Box sx={{ textAlign: "center" }} py={2}>
            <Container maxWidth="sm">
                <Typography variant="h4" color="text.primary" pb={2}>
                    Create a Group
                </Typography>
                <form
                    className="createGroupForm"
                    onSubmit={createGroup}
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <Box>
                        {friends && friends.length > 0 ? (
                            <Autocomplete
                                multiple
                                id="tags-standard"
                                options={friends}
                                value={participantFieldValues}
                                inputValue={inputValue}
                                freeSolo
                                onInputChange={(e, nv) => {
                                    setInputValue(nv);
                                }}
                                onChange={(e, nv) => {
                                    updateParticipants(nv);
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (
                                        option.firstName +
                                            " " +
                                            option.lastName ===
                                        value
                                    ) {
                                        return value;
                                    }
                                }}
                                getOptionLabel={(option) => {
                                    if (
                                        option &&
                                        option !== undefined &&
                                        option !== null &&
                                        option !== ""
                                    ) {
                                        if (typeof option === "string") {
                                            //for custom entered values (emails)
                                            return option;
                                        } else {
                                            return (
                                                option.firstName +
                                                " " +
                                                option.lastName
                                            );
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        error={participantsError}
                                        label="Participants"
                                        placeholder="Add by name or new email adress"
                                    />
                                )}
                            />
                        ) : (
                            <Autocomplete
                                multiple
                                id="tags-standard"
                                options={[]}
                                value={participantFieldValues}
                                inputValue={inputValue}
                                freeSolo
                                onInputChange={(e, nv) => {
                                    setInputValue(nv);
                                }}
                                onChange={(e, nv) => {
                                    updateParticipants(nv);
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (
                                        option.firstName +
                                            " " +
                                            option.lastName ===
                                        value
                                    ) {
                                        return value;
                                    }
                                }}
                                getOptionLabel={(option) => {
                                    if (
                                        option &&
                                        option !== undefined &&
                                        option !== null &&
                                        option !== ""
                                    ) {
                                        if (typeof option === "string") {
                                            //for custom entered values (emails)
                                            return option;
                                        } else {
                                            return (
                                                option.firstName +
                                                " " +
                                                option.lastName
                                            );
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        error={participantsError}
                                        label="Participants"
                                        placeholder="Add by name or new email adress"
                                    />
                                )}
                            />
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box width="60%">
                            <TextField
                                px={2}
                                onChange={(e) => {
                                    setGroupName(e.target.value);
                                }}
                                sx={{ width: "100%" }}
                                type="text"
                                error={nameError}
                                text={groupName}
                                variant="standard"
                                label="Name of the group"
                                name="groupName"
                                placeholder="Ex: Wednesday's Party, Family Chat, Tina's Birthday Gift Pool..."
                                value={groupName}
                            />
                        </Box>
                        <Box sx={{ pl: 2, pt: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="label"
                            >
                                <Typography variant="p">
                                    Group Picture
                                </Typography>
                                <input
                                    hidden
                                    accept="image/*"
                                    multiple
                                    type="file"
                                    onChange={(e)=>{setFile(e.target.files[0])}}
                                />
                            </Button>
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="label"
                            >
                                <input hidden accept="image/*" type="file"
                                    onChange={(e)=>{setFile(e.target.files[0])}} />
                                <PhotoCamera />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box width="100%" sx={{ margin: "auto" }} pb={2}>
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
                    <Button variant="contained" type="submit" sx={{fontWeight:'bold'}}>
                        Create group
                    </Button>
                </form>
            </Container>
            <Snackbar
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
export default CreateGroup;
