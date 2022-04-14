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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import ChatMsg from "@mui-treasury/components/chatMsg/ChatMsg";

import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000/chat";

export default function Groups(props) {
    const socket = useRef(null); //l'utilisation d'une ref permet de garder la connexion ouverte lors d'un re-render de composants
    const [groupInfo, setGroupInfo] = useState(null);
    const [messages, setMessages] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [value, setValue] = useState("");
    const [msgError, setMsgError] = useState(false);
    const handleChange = (event) => {
        setValue(event.target.value);
    };
    const navigate = useNavigate();
    const sendMessage = (e) => {
        console.log(value.trim().length);
        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value.trim().length !== 0
        ) {
            setMsgError(false);
            socket.current.emit("message sent", {
                message: value,
                groupId: props.room,
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
            if (e.sender.email != currentUser) {
                newMessageMapping.push({
                    messageList: [e.content],
                    picturePath: e.picturePath,
                    sender: e.sender,
                });
            } else {
                newMessageMapping[
                    newMessageMapping.length - 1
                ].messageList.push(e.content);
            }
            if (e.picturePath) {
                newMessageMapping[
                    newMessageMapping.length - 1
                ].messageList.push(<img src={e.picturePath} />);
            }
            currentUser = e.sender.email;
        });
        return newMessageMapping;
    };
    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        useEffect(() => {
            elementRef.current.scrollIntoView({ behaviour: "smooth" });
        }, [messages]);
        return <div ref={elementRef} />;
    };

    const capitalize = ([first, ...rest], lowerRest = false) =>
        first.toUpperCase() +
        (lowerRest ? rest.join("").toLowerCase() : rest.join(""));

    useEffect(() => {
        //connexion à la socket
        socket.current = io(ENDPOINT, {
            extraHeaders: {
                Authorization: "Bearer " + props.token,
            },
        });
        socket.current.on("connect", () => {
            socket.current.on("disconnect", () => {
                console.log("disconnocting poopie");
            });
        });
        socket.current.emit("join", { groupId: props.room });
        socket.current.on("message", (data) => {
            setMessages((messages) => [...messages, data]);
        });
    }, [ENDPOINT, props.token]);

    useEffect(() => {
        //réceptions de messages par la socket
        //récupération des messages déjà existants
        if (props.room === null || props.room === undefined) {
            navigate("/");
        }
        axios({
            method: "POST",
            url: "/api/messagelist",
            data: { groupId: props.room },
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                setGroupInfo(res.groupInfo);
                setMessages(res.messages);
                setCurrentUser(res.currentUser);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });

        return () => {
            socket.current.disconnect();
            props.setRoom(null);
        };
    }, []);

    return (
        <>
            <Typography variant="h4" color="text.primary">
                {groupInfo !== null && groupInfo !== undefined ? (
                    <Box
                        sx={{ display: "flex", justifyContent: "center" }}
                        m={2}
                    >
                        <Box mx={2}>
                            <Avatar
                                src={groupInfo.picturePath}
                                alt={groupInfo.name + " group picture"}
                            />
                        </Box>
                        {capitalize(groupInfo.name, true)}
                    </Box>
                ) : (
                    ""
                )}
            </Typography>
            <Box>
                <Container>
                    <Paper
                        sx={{
                            maxHeight: "50vh",
                            overflowY: "auto",
                            padding: "2vw",
                            overflowX: "hidden",
                            color: "primary.main",
                        }}
                    >
                        {messages !== null &&
                        messages !== undefined &&
                        messages.length > 0
                            ? mapMessages(messages).map((message, index) => {
                                console.log(message);
                                return(
                                  <span key={message.sender + index}>
                                      {message.sender.email === currentUser ? (
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
                                                  messages={message.messageList}
                                              />
                                              <p
                                                  style={{
                                                      display: "inline",
                                                      float: "right",
                                                      color: "grey",
                                                      marginTop: "0px",
                                                      fontSize: "0.7rem",
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
                                                  messages={message.messageList}
                                              />
                                              <p
                                                  style={{
                                                      display: "inline",
                                                      float: "left",
                                                      //   color: "grey",
                                                      fontSize: "0.7rem",
                                                      marginTop: "0px",
                                                  }}
                                                  color="primary.disabled"
                                              >
                                                  Sent by :{" "}
                                                  {message.sender.firstName}
                                              </p>
                                          </>
                                      )}
                                      <AlwaysScrollToBottom />
                                  </span>
                            )})
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
                                inputProps={{ margin: "auto", pattern: "+" }}
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
        </>
    );
}
