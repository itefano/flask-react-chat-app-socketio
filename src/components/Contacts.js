import { useEffect, useState } from "react";
import axios from "axios";
import {
    Avatar,
    Typography,
    Stack,
    Paper,
    Container,
    Box,
    Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
export default function Contacts(props) {
    const [contacts, setContacts] = useState(null);

    const loadChat = (email) => {
        console.log("loading:", email);
        axios({
            method: "POST",
            url: "/api/contactgroup",
            headers: {
                Authorization: "Bearer " + props.token,
            },
            data: { email: email },
        })
            .then((response) => {
                console.log("got:", response.data.groupId);
                if (!isNaN(response.data.groupId)) {
                    //don't trust myself on that one, so I check if I get a number
                    props.setRoom(response.data.groupId);
                }
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
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
                setContacts(res);
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
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="text.primary" py={2}>
                Contacts
            </Typography>
            <Box sx={{ maxHeight: "80vh", overflow: "auto" }}>
                <Stack spacing={2}>
                    {contacts !== null &&
                    contacts !== undefined &&
                    contacts.length > 0
                        ? contacts.map((contact, index) => {
                              return (
                                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                    onClick={() => {
                                        loadChat(contact.email);
                                    }}
                                  >
                                  <Paper key={index}>
                                          <Box
                                              sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  textDecoration: "none",
                                              }}
                                              p={2}
                                          >
                                              <Avatar
                                                  src={
                                                      contact.profilePicturePath
                                                  }
                                                  alt={
                                                      "Profile Picture of " +
                                                      contact.firstName
                                                  }
                                              />
                                              <Typography pl={2}>
                                                  {contact.email}
                                              </Typography>
                                          </Box>
                                  </Paper>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                      <Paper elevation={4}>
                                    <Typography>
                                        content
                                    </Typography>
                                  </AccordionDetails></Paper>
                                </Accordion>
                              );
                          })
                        : ""}
                </Stack>
            </Box>
        </Container>
    );
}
