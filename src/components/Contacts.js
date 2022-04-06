import { useEffect, useState } from "react";
import axios from "axios";
import { List, ListItem, Avatar, Typography } from "@mui/material";
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
        <>
            <h1>Contacts</h1>
            <List>
                {contacts !== null &&
                contacts !== undefined &&
                contacts.length > 0
                    ? contacts.map((contact, index) => {
                          return (
                              <ListItem key={index}>
                                  <Avatar
                                      src={contact.profilePicturePath}
                                      alt={
                                          "Profile Picture of " +
                                          contact.firstName
                                      }
                                  />
                                  <Typography pl={2}>{contact.email}</Typography>
                              </ListItem>
                          );
                      })
                    : ""}
            </List>
        </>
    );
}
