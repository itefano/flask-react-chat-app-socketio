import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    Avatar,
    Box,
    Container,
    Typography,
    TextField,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    DialogTitle,
    Autocomplete,
    Alert,
    Chip,
} from "@mui/material";
import "./Chat.css";
import CloseIcon from "@mui/icons-material/Close";
import ChatMsg from "@mui-treasury/components/chatMsg/ChatMsg";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { is_email } from "../utils";
const ENDPOINT = "http://localhost:5000/chat";

const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};
export default function Chat(props) {
    const [fieldErrors, setFieldErrors] = useState({
        groupName: false,
        participants: false,
        admins: false,
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [leaveGroupOpen, setLeaveGroupOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputValueAdmins, setInputValueAdmins] = useState("");
    const [adminsFieldValues, setAdminsFieldValues] = useState([]);
    const [friends, setFriends] = useState([]);
    const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
    const [editGroupOpen, setEditGroupOpen] = useState(false);
    const location = useLocation();
    //TODO: BUGFIX: fix broken sockets (delay too long from time to time)

    const socket = useRef(null); //use of ref allows us to re-render components while keeping the connexion active
    const [groupInfo, setGroupInfo] = useState(null);
    const [messages, setMessages] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [value, setValue] = useState("");
    const [msgError, setMsgError] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const [participantsFieldValues, setParticipantsFieldValues] = useState([]);
    const navigate = useNavigate();

    const includes_email = (main_arr, currentValue) => {
        for (const elem of main_arr) {
            if (elem.email && elem.email === currentValue) {
                return true;
            }
        }
        return false;
    };
    const updateParticipants = (info) => {
        let formattedInfo = [];
        for (const e of info) {
            if (typeof e === "string") {
                if (is_email(e)) {
                    formattedInfo.push({ email: e });
                }
            } else {
                formattedInfo.push(e);
            }
        }
        setParticipantsFieldValues(formattedInfo);
    };
    const updateAdminValues = (info) => {
        let formattedInfo = [];
        for (const e of info) {
            if (typeof e === "string") {
                if (
                    is_email(e) &&
                    includes_email(participantsFieldValues, e.email)
                ) {
                    formattedInfo.push({ email: e });
                }
            } else {
                if (
                    e.email &&
                    includes_email(participantsFieldValues, e.email)
                ) {
                    formattedInfo.push(e);
                }
            }
        }
        setAdminsFieldValues(formattedInfo);
    };

    const handleChange = (event) => {
        setValue(event.target.value);
    };
    const handleDeleteGroupOpen = () => {
        setDeleteGroupOpen(true);
    };
    const handleDeleteGroupClose = () => {
        setDeleteGroupOpen(false);
    };
    const handleLeaveGroupOpen = () => {
        setLeaveGroupOpen(true);
    };
    const handleEditGroupClose = () => {
        setEditGroupOpen(false);
    };
    const handleEditGroupOpen = () => {
        setEditGroupOpen(true);
    };
    const handleLeaveGroupClose = () => {
        setLeaveGroupOpen(false);
    };

    const editGroup = () => {
        axios({
            method: "PUT",
            url: "/api/editGroup",
            data: {
                groupId: roomId,
                users: participantsFieldValues,
                groupName: groupInfo.name,
                admins: adminsFieldValues,
            },
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                let gInfo = { ...res.groupInfo };
                let me = { ...props.info };
                let usersArr = gInfo["users"].filter((e) => {
                    return e.email !== props.info.email;
                });
                let adminsArr = gInfo["admins"].filter((e) => {
                    return e.email !== props.info.email;
                });
                gInfo["users"] = usersArr;
                usersArr.unshift(me);
                adminsArr.unshift(me);
                setParticipantsFieldValues(usersArr);

                setGroupInfo(gInfo);
                setAdminsFieldValues(adminsArr);
                setErrorMessage("");
                setFieldErrors({
                    groupName: false,
                    participants: false,
                    admins: false,
                });
                handleEditGroupClose();
            })
            .catch((error) => {
                if (error.response.data.errorToSet) {
                    setFieldErrors((previousValue) => ({
                        ...previousValue,
                        [error.response.data.errorToSet]: true,
                    }));
                    if (
                        error.response.data.error &&
                        error.response.data.error.length > 0
                    ) {
                        setErrorMessage(error.response.data.error);
                    } else {
                        setErrorMessage("Something went wrong.");
                    }
                }
                if (
                    error.response.status !== 401 &&
                    error.response.status !== 403
                ) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    };
    const deleteGroup = () => {
        axios({
            method: "DELETE",
            url: "/api/deleteGroup",
            data: {
                groupId: roomId,
            },
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                navigate("/");
            })
            .catch((error) => {
                if (error.response.status !== 401) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    };

    const leaveGroup = () => {
        axios({
            method: "PATCH",
            url: "/api/leaveGroup",
            data: {
                groupId: roomId,
            },
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                navigate("/");
            })
            .catch((error) => {
                if (error.response.status !== 401) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    };
    useEffect(() => {
        return () => {
            socket.current.disconnect();
            props.setRoom(null);
        };
    }, [props]);
    useEffect(() => {
        setRoomId(location.state.groupId);
    }, [location.state.groupId]);

    const sendMessage = (e) => {
        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value.trim().length !== 0
        ) {
            setMsgError(false);
            socket.current.emit("message sent", {
                message: value,
                groupId: roomId,
            });
        } else {
            setMsgError(true);
        }
        setValue("");
        e.preventDefault();
    };
    const mapMessages = (messageList) => {
        let newMessageMapping = [];
        let currentUser = null;
        messageList.forEach((e) => {
            if (e.sender.email !== currentUser) {
                newMessageMapping.push({
                    messageList: [e.content],
                    picturePath: e.picturePath,
                    sender: e.sender,
                    timestamp: e.timestamp,
                });
            } else {
                newMessageMapping[
                    newMessageMapping.length - 1
                ].messageList.push(e.content);
            }
            if (e.picturePath) {
                newMessageMapping[
                    newMessageMapping.length - 1
                ].messageList.push(
                    <img
                        src={e.picturePath}
                        alt={e.sender.firstName + "'s picture"}
                    />
                );
            }
            currentUser = e.sender.email;
        });
        return newMessageMapping;
    };
    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        useEffect(() => {
            elementRef.current.scrollIntoView({ behaviour: "smooth" });
        }, []);
        return <div ref={elementRef} />;
    };

    useEffect(() => {
        //connexion à la socket
        socket.current = io(ENDPOINT, {
            extraHeaders: {
                Authorization: "Bearer " + props.token,
            },
        });
        socket.current.on("connect", () => {
            //forgot why this was here
            // console.log("connected");
        });
        if (roomId) {
            socket.current.emit("join", { groupId: roomId });
        }
        socket.current.on("message", (data) => {
            setMessages((messages) => [...messages, data]);
        });
        axios({
            method: "GET",
            url: "/api/contactlist",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = [...response.data];
                setFriends(res);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    }, [roomId, props.token]);

    useEffect(() => {
        //message reception
        if (
            roomId &&
            roomId !== null &&
            roomId !== undefined &&
            props.token !== null &&
            props.token !== undefined &&
            props.token !== ""
        ) {
            axios({
                method: "GET",
                url: "/api/messagelist",
                params: { groupId: roomId },
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    const res = response.data;
                    let gInfo = { ...res.groupInfo };
                    let me = {};
                    let usersArr = gInfo["users"].filter((e) => {
                        if (e.email === res.currentUser) {
                            me = { ...e };
                            return false;
                        }
                        return true;
                    }); //puts the user first for legibility's sake
                    usersArr.unshift(me);
                    gInfo["users"] = usersArr;
                    setParticipantsFieldValues(gInfo["users"]);
                    setAdminsFieldValues(gInfo["admins"]);
                    setMessages(res.messages);
                    setCurrentUser(res.currentUser);
                    setGroupInfo({ ...gInfo });
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });

            return () => {
                socket.current.disconnect(); //not sure which one I should be using
                props.setRoom(null);
            };
        }
    }, [roomId, props]);

    return (
        <>
            <Paper sx={{ height: "100%" }}>
                {groupInfo ? (
                    <Box
                        sx={{ display: "flex", justifyContent: "center" }}
                        m={2}
                    >
                        <Box mx={2} color="primary">
                            <Avatar
                                //TODO: BUGFIX: avatar is invisible...?
                                src={groupInfo.picturePath}
                                alt={groupInfo.name + " group picture"}
                            />
                        </Box>
                        <Typography variant="h4" color="text.primary">
                            {groupInfo.name.replace(/\b\w/, (c) =>
                                c.toUpperCase()
                            )}
                        </Typography>
                    </Box>
                ) : (
                    ""
                )}
                <Box sx={{ width: "xs", textAlign: "right" }} py={2} pr={5}>
                    {groupInfo &&
                    includes_email(groupInfo.admins, props.info.email) ? (
                        <>
                            {groupInfo &&
                            groupInfo.name &&
                            groupInfo.name.length > 0 ? ( //checks whether convos are 1 to 1, in which case they can't be "left" or "deleted". You can only delete the friendship itself.
                                <IconButton
                                    onClick={() => {
                                        handleDeleteGroupOpen();
                                    }}
                                >
                                    <DeleteIcon color="error" />
                                </IconButton>
                            ) : (
                                ""
                            )}
                            <IconButton
                                onClick={() => {
                                    handleEditGroupOpen();
                                }}
                            >
                                <SettingsIcon color="success" />
                            </IconButton>
                        </>
                    ) : (
                        ""
                    )}
                    {groupInfo &&
                    groupInfo.name &&
                    groupInfo.name.length > 0 ? (
                        <IconButton
                            onClick={() => {
                                handleLeaveGroupOpen();
                            }}
                        >
                            <LogoutIcon color="warning" />
                        </IconButton>
                    ) : (
                        ""
                    )}
                </Box>
                <Box>
                    <Container>
                        <Paper
                            elevation={2}
                            sx={{
                                maxHeight: "50vh",
                                overflowY: "auto",
                                padding: "2vw",
                                overflowX: "hidden",
                                color: "primary.main",
                            }}
                        >
                            {messages !== null && //we check whether we actually have messages here
                            //forgot why this comment was there. I'd have done this no matter what. What did I mean by that? WHY AM I SO MYSTERIOUS?
                            messages !== undefined &&
                            messages.length > 0
                                ? mapMessages(messages).map(
                                      (message, index) => {
                                          return (
                                              <span
                                                  key={message.sender + index}
                                              >
                                                  {message.sender.email ===
                                                  currentUser ? (
                                                      <>
                                                          <ChatMsg
                                                              side={"right"}
                                                              avatar={
                                                                  message.sender
                                                                      .profilePicturePath
                                                              }
                                                              useStules={{
                                                                  backgroundColor:
                                                                      "primary.main",
                                                              }}
                                                              messages={
                                                                  message.messageList
                                                              }
                                                          />
                                                          <p
                                                              style={{
                                                                  display:
                                                                      "inline",
                                                                  float: "right",
                                                                  color: "grey",
                                                                  marginTop:
                                                                      "0px",
                                                                  fontSize:
                                                                      "0.7rem",
                                                              }}
                                                          >
                                                              Sent
                                                          </p>
                                                      </>
                                                  ) : (
                                                      <>
                                                          <ChatMsg
                                                              avatar={
                                                                  message.sender
                                                                      .profilePicturePath
                                                              }
                                                              messages={
                                                                  message.messageList
                                                              }
                                                          />
                                                          <Box mb={1}>
                                                              <Typography
                                                                  variant="body2"
                                                                  style={{
                                                                      display:
                                                                          "block",
                                                                      //   color: "grey",
                                                                      fontSize:
                                                                          "0.7rem",
                                                                      marginTop:
                                                                          "0px",
                                                                      marginBotto:
                                                                          "0px",
                                                                  }}
                                                                  color="primary.disabled"
                                                              >
                                                                  Sent by :{" "}
                                                                  {
                                                                      message
                                                                          .sender
                                                                          .firstName
                                                                  }
                                                              </Typography>
                                                              <Typography
                                                                  variant="caption"
                                                                  style={{
                                                                      display:
                                                                          "block",
                                                                      color: "grey",
                                                                      fontSize:
                                                                          "0.5rem",
                                                                      marginTop:
                                                                          "0px",
                                                                      marginBotto:
                                                                          "0px",
                                                                  }}
                                                                  color="primary.disabled"
                                                              >
                                                                  {
                                                                      message.timestamp
                                                                  }
                                                              </Typography>
                                                          </Box>
                                                      </>
                                                  )}
                                                  <AlwaysScrollToBottom />
                                              </span>
                                          );
                                      }
                                  )
                                : ""}
                        </Paper>
                    </Container>
                    <Box pt={2} sx={{ width: "50%", margin: "auto" }}>
                        <form onSubmit={sendMessage}>
                            <Paper
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "auto",
                                    textAlign: "center",
                                }}
                            >
                                <TextField
                                    sx={{
                                        color: "primary.main",
                                        display: "flex",
                                        width: "100%",
                                    }}
                                    error={msgError}
                                    inputProps={{
                                        margin: "auto",
                                        pattern: "+",
                                    }}
                                    id="filled-multiline-flexible"
                                    label="Enter your message here"
                                    multiline
                                    value={value}
                                    onChange={handleChange}
                                    variant="filled"
                                />
                                <Button variant="contained" type="submit">
                                    Send
                                </Button>
                            </Paper>
                        </form>
                    </Box>
                </Box>
            </Paper>

            <Dialog
                open={leaveGroupOpen}
                onClose={handleLeaveGroupClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <BootstrapDialogTitle id="alert-dialog-title">
                    {"Are you sure you want to leave this group?"}
                </BootstrapDialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography variant="p" sx={{ fontWeight: "normal" }}>
                            You can join this group later, but only if you are
                            invited back.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                            leaveGroup();
                        }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleLeaveGroupClose();
                        }}
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deleteGroupOpen}
                onClose={handleDeleteGroupClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <BootstrapDialogTitle id="alert-dialog-title">
                    {
                        "Are you sure you want to delete this group? This action is irreversible."
                    }
                </BootstrapDialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography variant="p" sx={{ fontWeight: "normal" }}>
                            You can join this group later, but only if you are
                            invited back.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={deleteGroup}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteGroupClose}
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editGroupOpen}
                onClose={handleEditGroupClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
            >
                <BootstrapDialogTitle id="alert-dialog-title">
                    {groupInfo ? groupInfo.name : ""}
                </BootstrapDialogTitle>
                <DialogContent>
                    <Box py={1}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            error={fieldErrors["groupName"]}
                            label="Group name"
                            value={(groupInfo && groupInfo.name) || ""}
                            onChange={(e) => {
                                setGroupInfo((prevValue) => ({
                                    ...prevValue,
                                    "name": e.target.value,
                                }));
                            }}
                        />
                        <Box pt={2}>
                            <Autocomplete
                                multiple
                                options={friends}
                                value={participantsFieldValues}
                                inputValue={inputValue}
                                freeSolo
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={
                                                option.email ===
                                                props.info.email
                                                    ? "You"
                                                    : option.firstName +
                                                      " " +
                                                      option.lastName
                                            }
                                            {...getTagProps({ index })}
                                            disabled={
                                                option.email ===
                                                props.info.email
                                            }
                                        />
                                    ))
                                }
                                onInputChange={(e, nv) => {
                                    setInputValue(nv);
                                }}
                                onChange={(e, nv) => {
                                    updateParticipants(nv);
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    if (option.email === value.email) {
                                        return option;
                                    }
                                }}
                                getOptionLabel={(option) => {
                                    if (
                                        option &&
                                        option !== undefined &&
                                        option !== null &&
                                        option !== ""
                                    ) {
                                        if (
                                            !option.firstName ||
                                            !option.lastName
                                        ) {
                                            //for custom entered values (emails)
                                            return option.email;
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
                                        fullWidth
                                        {...params}
                                        error={fieldErrors["participants"]}
                                        variant="outlined"
                                        label="Current participants"
                                        placeholder="Add by name or new email adress"
                                    />
                                )}
                            />
                            <Box pt={2}>
                                <Autocomplete
                                    multiple
                                    options={
                                        groupInfo && groupInfo.users
                                            ? groupInfo.users
                                            : []
                                    }
                                    value={adminsFieldValues}
                                    inputValue={inputValueAdmins}
                                    freeSolo
                                    onInputChange={(e, nv) => {
                                        setInputValueAdmins(nv);
                                    }}
                                    onChange={(e, nv) => {
                                        updateAdminValues(nv);
                                    }}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => (
                                            <Chip
                                                label={
                                                    option.email ===
                                                    props.info.email
                                                        ? "You"
                                                        : option.firstName +
                                                          " " +
                                                          option.lastName
                                                }
                                                {...getTagProps({ index })}
                                                disabled={
                                                    option.email ===
                                                    props.info.email
                                                }
                                            />
                                        ))
                                    }
                                    isOptionEqualToValue={(option, value) => {
                                        if (option.email === value.email) {
                                            return option;
                                        }
                                    }}
                                    getOptionLabel={(option) => {
                                        if (
                                            option &&
                                            option !== undefined &&
                                            option !== null &&
                                            option !== ""
                                        ) {
                                            if (
                                                !option.firstName ||
                                                !option.lastName
                                            ) {
                                                //for custom entered values (emails)
                                                return option.email;
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
                                            fullWidth
                                            {...params}
                                            error={fieldErrors["admins"]}
                                            variant="outlined"
                                            label="Current admins"
                                            placeholder="Add by name or new email adress"
                                        />
                                    )}
                                />
                            </Box>

                            {errorMessage !== "" ? (
                                <Box py={2}>
                                    <Alert
                                        severity="error"
                                        variant="filled"
                                        onClose={() => {
                                            setErrorMessage("");
                                            setFieldErrors({
                                                groupName: false,
                                                participants: false,
                                                admins: false,
                                            });
                                        }}
                                    >
                                        {errorMessage}
                                    </Alert>
                                </Box>
                            ) : (
                                ""
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            editGroup();
                        }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleEditGroupClose();
                        }}
                        autoFocus
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
