import {
    Box,
    Paper,
    Skeleton,
    List,
    Typography,
    ListItem,
    Avatar,
    Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function GroupList(props) {
    const [groups, setGroups] = useState(null);
    const skeletons = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    const openSearch = props.openSearch; //too lazy to remake it, I just replaced the names after transferring the sub-component
    const searchResults = props.searchResults;
    const searchTerm = props.searchTerm;

    useEffect(() => {
        if (props.token) {
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
        }
    }, [props]);

    return (
        <Box>
            <List disablePadding>
                {openSearch &&
                    searchResults.groupNames &&
                    searchResults.groupNames.map((e, index) => {
                        let groupName;
                        if (e.name)
                        {
                            groupName = e.name;
                        }
                        else{
                            for (let i = 0; i<e.participants.length; i++)
                            {
                                if (e.firstName!==props.info.firstName || e.lastName!==props.info.lastName)
                                {
                                    groupName = e.firstName+" "+e.lastName;
                                    break;
                                }
                            }
                        }
                        let currentSearchTerm = searchTerm.trim();
                        let searchTermSplit = currentSearchTerm.split(" ");
                        for (let i = 0; i < searchTermSplit.length; i++) {
                            let searchPattern = new RegExp(
                                "(?![^<]*>|[^<>]*</)" +
                                    searchTermSplit[i] +
                                    "(?![^</]*>|[^</>]*</)",
                                "gi"
                            );
                            let sliceIndexMin = groupName.search(searchPattern);
                            let sliceIndexMax =
                                sliceIndexMin + searchTermSplit[i].length;
                            groupName = groupName.replace(
                                searchPattern,
                                "<strong>" +
                                    groupName.slice(
                                        sliceIndexMin,
                                        sliceIndexMax
                                    ) +
                                    "</strong>"
                            );
                        }
                        let participants = e.participants.join(", ");

                        for (let i = 0; i < searchTermSplit.length; i++) {
                            let searchPattern = new RegExp(
                                "(?![^<]*>|[^<>]*</)" +
                                    searchTermSplit[i] +
                                    "(?![^</]*>|[^</>]*</)",
                                "gi"
                            );
                            let sliceIndexMin = participants.search(searchPattern);
                            let sliceIndexMax =
                                sliceIndexMin + searchTermSplit[i].length;
                            participants = participants.replace(
                                searchPattern,
                                "<strong>" +
                                    participants.slice(
                                        sliceIndexMin,
                                        sliceIndexMax
                                    ) +
                                    "</strong>"
                            );
                        }

                        return (
                            <ListItem
                                disablePadding
                                spacing={0}
                                alignItems="flex-start"
                                key={index}
                            >
                                <Paper
                                    square
                                    key={index}
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                    }}
                                    variant="outlined"
                                >
                                    <Link
                                        to="/chat"
                                        state={{ groupId: e.id }}
                                        style={{
                                            display: "flex",
                                            textDecoration: "none",
                                            color: "inherit",
                                            width: "100%",
                                        }}
                                    >
                                        <Stack p={2} direction="row">
                                            <Avatar
                                                alt={e.name + "'s Picture"}
                                                src={e.picturePath}
                                            />
                                            <Box>
                                                <Typography
                                                    pl={2}
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: "light",
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: groupName,
                                                    }}
                                                ></Typography>
                                                <Typography
                                                    pl={2}
                                                    variant="body1"
                                                    color="text.secondary"
                                                    dangerouslySetInnerHTML={{
                                                        __html: participants,
                                                    }}
                                                ></Typography>
                                            </Box>
                                        </Stack>
                                    </Link>
                                </Paper>
                            </ListItem>
                        );
                    })}
                {openSearch ? (
                    searchResults.users &&
                    searchResults.users.map((e, index) => {
                        let firstNameLastName = e.firstName + " " + e.lastName;
                        let currentSearchTerm = searchTerm.trim();
                        let searchTermSplit = currentSearchTerm.split(" ");
                        for (let i = 0; i < searchTermSplit.length; i++) {
                            //f... me that one was needlessly tedious
                            let searchPattern = new RegExp(
                                "(?![^<]*>|[^<>]*</)" +
                                    searchTermSplit[i] +
                                    "(?![^</]*>|[^</>]*</)",
                                "gi"
                            ); //allows us to ignore the case and to replace appropriately
                            let sliceIndexMin =
                                firstNameLastName.search(searchPattern); //for legibility's sake
                            let sliceIndexMax =
                                sliceIndexMin + searchTermSplit[i].length; //same as above
                            firstNameLastName = firstNameLastName.replace(
                                searchPattern,
                                "<strong>" +
                                    firstNameLastName.slice(
                                        sliceIndexMin,
                                        sliceIndexMax
                                    ) +
                                    "</strong>"
                            ); //replaces the first found occurence of a word that corresponds to the given pattern, with the pattern surrounded by <strong> tags. Note : this is case insensitive and replaces the pattern (kind of) appropriately. The best part? It also replaces the pattern correctly if the words are given in disorder. The worst part? It doesn't work well for people who have both the same first name and last name.
                        }
                        let email = e.email.toLowerCase();
                        currentSearchTerm = searchTerm
                            .trim()
                            .split(" ")
                            .join("")
                            .toLowerCase();
                        if (searchResults.isLastFirstName) {
                            currentSearchTerm = searchTerm
                                .trim()
                                .split(" ")
                                .join("")
                                .toLowerCase();
                        }
                        if (e.email.includes(currentSearchTerm)) {
                            let minIndexName =
                                e.email.indexOf(currentSearchTerm);
                            let maxIndexName =
                                e.email.indexOf(currentSearchTerm) +
                                currentSearchTerm.length;
                            let replaceLeft = e.email.slice(0, minIndexName);
                            let replaceMiddle = e.email.slice(
                                minIndexName,
                                maxIndexName
                            );
                            let replaceRight = e.email.slice(maxIndexName);
                            email =
                                replaceLeft +
                                "<strong>" +
                                replaceMiddle +
                                "</strong>" +
                                replaceRight;
                        }

                        return (
                            <ListItem
                                disablePadding
                                spacing={0}
                                alignItems="flex-start"
                                key={index}
                            >
                                <Paper
                                    square
                                    key={index}
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                    }}
                                    variant="outlined"
                                >
                                    <Link
                                        to="/chat"
                                        state={{ groupId: e.groupId }}
                                        style={{
                                            display: "flex",
                                            textDecoration: "none",
                                            color: "inherit",
                                            width: "100%",
                                        }}
                                    >
                                        <Box p={2}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Avatar
                                                    alt={
                                                        e.firstName +
                                                        "'s Picture"
                                                    }
                                                    src={e.profilePicturePath}
                                                />
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        alignItems: "baseline",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h5"
                                                        pl={2}
                                                        dangerouslySetInnerHTML={{
                                                            __html: firstNameLastName,
                                                        }}
                                                    ></Typography>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant="p"
                                                dangerouslySetInnerHTML={{
                                                    __html: email,
                                                }}
                                            ></Typography>
                                            <Box pt={2}>
                                                <Typography variant="p">
                                                    {e.content}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Link>
                                </Paper>
                            </ListItem>
                        );
                    })
                ) : groups ? (
                    <>
                        {groups.map((group, i) => {
                            return (
                                <ListItem
                                    disablePadding
                                    spacing={0}
                                    alignItems="flex-start"
                                    key={i}
                                >
                                    <Paper
                                        square
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                        }}
                                        variant="outlined"
                                    >
                                        <Link
                                            to="/chat"
                                            state={{ groupId: group.id }}
                                            style={{
                                                display: "flex",
                                                textDecoration: "none",
                                                color: "inherit",
                                                width: "100%",
                                            }}
                                        >
                                            <Stack p={2} direction="row">
                                                <Avatar
                                                    src={group.picturePath}
                                                    alt={
                                                        group.name +
                                                        " group picture"
                                                    }
                                                />
                                                <Box>
                                                    <Typography
                                                        pl={2}
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {group.name}
                                                    </Typography>
                                                    <Typography
                                                        pl={2}
                                                        variant="body1"
                                                        color="text.secondary"
                                                    >
                                                        {group.users_names.join(
                                                            ", "
                                                        ).length > 20
                                                            ? group.users_names
                                                                  .join(", ")
                                                                  .substring(
                                                                      0,
                                                                      40
                                                                  ) + "..."
                                                            : group.users_names.join(
                                                                  ", "
                                                              )}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Link>
                                    </Paper>
                                </ListItem>
                            );
                        })}
                    </>
                ) : (
                    skeletons.map((e, i) => {
                        return (
                            <ListItem sx={{ padding: "1px" }} key={i}>
                                <Skeleton
                                    variant="rectangle"
                                    width="100%"
                                    height={80}
                                />
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Box>
    );
}
