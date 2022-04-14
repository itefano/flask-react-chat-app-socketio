import { useEffect, useState } from "react";
import axios from "axios";
import {
    Avatar,
    Typography,
    Stack,
    Paper,
    Container,
    Box,
} from "@mui/material";
export default function Contacts(props) {
    const [contacts, setContacts] = useState(null);
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
                console.log("results:", res);
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
                                              src={contact.profilePicturePath}
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
                              );
                          })
                        : ""}
                </Stack>
            </Box>
        </Container>
    );
}
