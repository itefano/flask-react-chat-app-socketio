import { useState, useEffect } from "react";
import axios from "axios";
import {
    Container,
    Paper,
    TextField,
    Typography,
    FormGroup,
    Button,
    Skeleton,
} from "@mui/material";
import { Box } from "@mui/system";

function Profile(props) {
    const [profileData, setProfileData] = useState(null);
    useEffect(() => {
        axios({
            method: "GET",
            url: "/api/profile",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                // res.access_token && props.setToken(res.access_token); //why was this here again...?
                setProfileData(res);
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
        <Paper className="Profile" sx={{ display: "flex" }}>
            <Box pt={2} width="100%">
                <Container maxWidth="sm">
                    <Typography
                        variant="h4"
                        color="text.primary"
                        pb={2}
                        sx={{ textAlign: "center" }}
                    >
                        Your Profile
                    </Typography>

                    {!profileData ? (
                        <>
                            <Skeleton />
                            <Skeleton
                                variant="rectangular"
                                height={70}
                                pt={2}
                            />
                            <Skeleton />
                            <Skeleton
                                variant="rectangular"
                                height={70}
                                pt={2}
                            />
                            <Skeleton />
                            <Skeleton
                                variant="rectangular"
                                height={70}
                                pt={2}
                            />
                            <Skeleton
                                variant="rectangular"
                                height={150}
                                width={300}
                            />
                        </>
                    ) : (
                        <>
                            <Box pt={2}>
                                <FormGroup>
                                    <Typography>Email</Typography>
                                    <TextField
                                        value={profileData["email"]}
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                email: e.target.value,
                                            });
                                        }}
                                    />
                                </FormGroup>
                            </Box>
                            <Box pt={2}>
                                <FormGroup>
                                    <Typography>First Name</Typography>
                                    <TextField
                                        value={profileData["firstName"]}
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                firstName: e.target.value,
                                            });
                                        }}
                                    />
                                </FormGroup>
                            </Box>
                            <Box pt={2}>
                                <FormGroup>
                                    <Typography>Last Name</Typography>
                                    <TextField
                                        value={profileData["lastName"]}
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                lastName: e.target.value,
                                            });
                                        }}
                                    />
                                </FormGroup>
                                <Box pt={2}>
                                    <Typography>Profile Picture</Typography>
                                </Box>
                                <FormGroup>
                                    <img
                                        src={profileData["profilePicturePath"]}
                                        alt={profileData["firstName"]+"'s Picture"}
                                        width="300"
                                    />
                                </FormGroup>
                            </Box>
                        </>
                    )}

                    <Box sx={{ textAlign: "center", pt: 3 }}>
                        {" "}
                        <Button variant="contained"> Confirm Edits </Button>
                    </Box>
                </Container>
            </Box>
        </Paper>
    );
}

export default Profile;
