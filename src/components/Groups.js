import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, List, ListItem, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Groups(props) {
    const [groups, setGroups] = useState(null);
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState(null);

    const updateGroupId = (id) => {
        setRoomId(id);
    };

    useEffect(() => {
        console.log("props.room:", props.room);
        if (props.room !== null && props.room !== undefined) {
            navigate("/chat/");
        }
    }, [props.room]);

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
    }, [roomId]);

    useEffect(() => {
        //récupération de la liste des groupes
        props.setRoom(null)
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
                                  <Link  href="#"
                                      onClick={() => {
                                          updateGroupId(group.id);
                                      }}
                                  >
                                      <Avatar
                                          src={group.picturePath}
                                          alt={group.name + " group picture"}
                                      />
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
