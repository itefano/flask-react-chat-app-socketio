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
    function getData() {
        axios({
            method: "GET",
            url: "/api/profile",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = response.data;
                // res.access_token && props.setToken(res.access_token);
                setProfileData(res);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    }
    useEffect(() => {
        getData();
    }, []);
    return (
        <Paper className="Profile" sx={{ display: "flex" }}>
            <Container maxWidth="sm" sx={{}}>
                <Typography variant="h3">Your profile </Typography>

                {!profileData ? (
                    <>
                        <Skeleton />
                        <Skeleton variant="rectangular" height={70} />
                        <Skeleton />
                        <Skeleton variant="rectangular" height={70} />
                        <Skeleton />
                        <Skeleton variant="rectangular" height={70} />
                        <Skeleton
                            variant="rectangular"
                            height={150}
                            width={300}
                        />
                    </>
                ) : (
                    <>
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
                        <Typography>Profile Picture</Typography>
                        <FormGroup>
                            <img
                                src={profileData["profilePicturePath"]}
                                width="300"
                            />
                        </FormGroup>
                    </>
                )}

                <Box sx={{ textAlign: "center", pt:3 }}>
                    {" "}
                    <Button variant="contained"> Confirm Edits </Button>
                </Box>
            </Container>
        </Paper>
    );
}

export default Profile;
