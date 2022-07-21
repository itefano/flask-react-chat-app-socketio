import { useEffect, useState } from "react";
import axios from "axios";
import {
    Avatar,
    Typography,
    Stack,
    Paper,
    Container,
    Box,
    AccordionSummary,
    AccordionDetails,
    Accordion,
    Link,
    Skeleton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
export default function Contacts(props) {
    const [expanded, setExpanded] = useState("");
    const [contacts, setContacts] = useState(null);
    const [groups, setGroups] = useState(null);
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState(null);

    const handleChange = (panel, email) => {
        if (expanded !== panel) {
            axios({
                method: "GET",
                url: "/api/contactgroup",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
                params: { email: email },
            })
                .then((response) => {
                    setGroups({ ...groups, [email]: response.data.groups });
                    setExpanded(panel);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        } else {
            setExpanded("");
        }
    };

    useEffect(() => {
        if (roomId !== null && roomId !== undefined) {
            axios({
                method: "POST",
                url: "/api/check_room",
                data: { groupId: roomId },
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    props.setRoom(roomId);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [roomId, props]);

    useEffect(() => {
        if (roomId && props.room === roomId) {
            navigate("/chat/");
        }
    }, [props.room, navigate, roomId]);

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
                setContacts(res);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    }, [props.token]);
    return (
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="text.primary" py={2}>
                Contacts
            </Typography>
            <Box sx={{ maxHeight: "80vh", overflow: "auto" }}>
                <Stack spacing={2}>
                    {contacts !== null &&
                    contacts !== undefined &&
                    contacts.length > 0 ? (
                        contacts.map((contact, index) => {
                            return (
                                <Accordion
                                    TransitionProps={{ unmountOnExit: true }}
                                    expanded={expanded === "panel" + index}
                                    onChange={() => {
                                        handleChange(
                                            "panel" + index,
                                            contact.email
                                        );
                                    }}
                                    key={index}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                textDecoration: "none",
                                            }}
                                            p={2}
                                        >
                                            <Avatar
                                                src={contact.profilePicturePath}
                                                alt={
                                                    "Profile Picture of " +
                                                    contact.firstName
                                                }
                                            />
                                            <Typography variant="h5" pl={2}>
                                                {contact.email}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails key={index}>
                                        <Stack spacing={1}>
                                            {groups !== null &&
                                            groups[contact.email] !==
                                                undefined &&
                                            groups[contact.email].length > 0
                                                ? groups[contact.email].map(
                                                      (group, index) => {
                                                          return (
                                                              <Link
                                                                  key={index}
                                                                  href="#"
                                                                  underline="none"
                                                                  onClick={() => {
                                                                      setRoomId(
                                                                          group.id
                                                                      );
                                                                  }}
                                                              >
                                                                  <Paper
                                                                      elevation={
                                                                          4
                                                                      }
                                                                      sx={{
                                                                          padding: 2,
                                                                      }}
                                                                  >
                                                                      <Typography variant="h6">
                                                                          {
                                                                              group.name
                                                                          }
                                                                      </Typography>
                                                                  </Paper>
                                                              </Link>
                                                          );
                                                      }
                                                  )
                                                : ""}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })
                    ) : (
                        <>
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                            <Skeleton variant="rectangular" height={100} />
                        </>
                    )}
                </Stack>
            </Box>
        </Container>
    );
}
