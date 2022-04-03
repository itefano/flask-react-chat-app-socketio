import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    Avatar,
    Box,
    Container,
    Typography,
    TextField,
    Paper,
    Button
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "./Chat.css"
import ChatMsg from "@mui-treasury/components/chatMsg/ChatMsg";
export default function Groups(props) {
    const [groupInfo, setGroupInfo] = useState(null);
    const [messages, setMessages] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const { chatRoomId } = useParams();
    const [value, setValue] = useState("");
    const handleChange = (event) => {
        setValue(event.target.value);
    };
    const sendMessage = () =>
    {

    }
    const mapMessages = (messageList) => {
        let newMessageMapping = [];
        let currentUser = null;
        messageList.forEach((e) => {
            if (e.sender.email != currentUser) {
                newMessageMapping.push({
                    messageList: [e.content],
                    sender: e.sender,
                });
            } else {
                newMessageMapping[
                    newMessageMapping.length - 1
                ].messageList.push(e.content);
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
        axios({
            method: "POST",
            url: "/api/messagelist",
            data: { groupId: chatRoomId },
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
    }, []);

    return (
        <>
            <h1>
                {groupInfo !== null && groupInfo !== undefined ? (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Avatar
                            src={groupInfo.picturePath}
                            alt={groupInfo.name + " group picture"}
                        />
                        <Typography variant="h5" pl={2}>
                            {capitalize(groupInfo.name, true)}
                        </Typography>
                    </Box>
                ) : (
                    ""
                )}
            </h1>
            <Box>
                <Container
                >
                <Paper sx={{color:'text.primary',
                        maxHeight: "50vh",
                        overflowY: "auto",
                        padding:'2vw',
                        overflowX:"hidden",
                        color: "primary.main",}}>
                    {messages !== null &&
                    messages !== undefined &&
                    messages.length > 0
                        ? mapMessages(messages).map((message, index) => (
                              <span key={message.sender + index}>
                                  {message.sender.email === currentUser ? (
                                      <>
                                          <ChatMsg
                                              side={"right"}
                                              avatar={
                                                  message.sender
                                                      .profilePicturePath
                                              }
                                              useStules={{backgroundColor:'primary.main'}}
                                              messages={message.messageList}
                                          />
                                          <p
                                              style={{
                                                  display: "inline",
                                                  float: "right",
                                                  color: "grey",
                                                  fontSize: "0.7rem",
                                              }}
                                          >
                                              Sent.
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
                                                  color: "grey",
                                                  fontSize: "0.7rem",
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
                          ))
                        : ""}
                        </Paper>
                </Container>
                <Box pt={2} sx={{width:'50%', margin:'auto'}}>
                <Paper sx={{display:'flex', justifyContent:'center', width:'auto', 
                            textAlign:'center'}}>
                    <TextField
                        sx={{
                            color: "primary.main",
                            display:'flex',
                            width:'100%',
                        }}
                        inputProps={{margin:'auto' }}
                        id="filled-multiline-flexible"
                        label="Enter your message here"
                        multiline
                        value={value}
                        onChange={handleChange}
                        variant="filled"
                    />
                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                </Paper></Box>
            </Box>
        </>
    );
}
