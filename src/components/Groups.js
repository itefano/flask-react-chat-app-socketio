import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, List, ListItem, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Groups(props) {
    const [groups, setGroups] = useState(null);
    useEffect(() => {
        axios({
            method: "GET",
            url: "/api/grouplist",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                setGroups(res);
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
            <h1>Conversations</h1>
            <List>
                {groups !== null && groups !== undefined && groups.length > 0
                    ? groups.map((group, index) => {
                          return (
                              <ListItem key={index}>
                                  <Link to={"/chat/" + group.id} style={{display:'flex', alignItems:'center'}}>
                                      <Avatar src={group.picturePath} alt={group.name+" group picture"}/>
                                      <Typography pl={2}>
                                          {group.name}
                                      </Typography>
                                  </Link>
                              </ListItem>
                          );
                      })
                    : ""}
            </List>
        </>
    );
}
