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
    IconButton,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    InputAdornment,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import KeyIcon from "@mui/icons-material/Key";
function Profile(props) {
    const [profileData, setProfileData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState({
        email: false,
        firstName: false,
        lastName: false,
        password: false,
        profilePicture: false,
        gender: false,
    });
    useEffect(() => {
        axios({
            method: "GET",
            url: "/api/profile",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                const res = { ...response.data };
                if (!res.gender) {
                    res["gender"] = "none";
                }
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

    const editProfile = () => {
        const profileFormData = new FormData();
        for (const [k, v] of Object.entries(profileData)) {
            profileFormData.append(k, v);
        }
        profileFormData.append("file", file);
        axios({
            method: "PUT",
            url: "/api/editProfile",
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + props.token,
            },
            data: profileFormData,
        })
            .then((response) => {
                props.setInfo(response.data);
                setProfileData(response.data.userInfo);
                setError({
                    email: false,
                    firstName: false,
                    lastName: false,
                    password: false,
                    profilePicture: false,
                    gender: false,
                });
                if (response.status !== 203) {
                    setSuccessMessage("Infos were updated successfully");
                }
                setErrorMessage("");
            })
            .catch((err) => {
                if (err.response) {
                    setError((prevState) => {
                        const nState = { ...prevState };
                        for (const k of Object.keys(nState)) {
                            if (k === err.response.data.errorToSet) {
                                nState[k] = true;
                            } else {
                                nState[k] = false;
                            }
                        }
                        return nState;
                    });
                    if (
                        err.response.status !== 401 ||
                        err.response.status !== 403
                    ) {
                        console.log(err.response);
                        console.log(err.response.status);
                        console.log(err.response.headers);
                    }
                }
            });
    };

    return (
        <Paper className="Profile" sx={{ display: "flex", height: "100%" }}>
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
                                    <TextField
                                        value={profileData["email"]}
                                        label="Email"
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                email: e.target.value,
                                            });
                                        }}
                                        error={error.email}
                                    />
                                </FormGroup>
                            </Box>
                            <Box pt={2}>
                                <FormGroup>
                                    <TextField
                                        value={profileData["firstName"]}
                                        label="First Name"
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                firstName: e.target.value,
                                            });
                                        }}
                                        error={error.firstName}
                                    />
                                </FormGroup>
                            </Box>
                            <Box pt={2}>
                                <FormGroup>
                                    <TextField
                                        value={profileData["lastName"]}
                                        label="Last Name"
                                        onChange={(e) => {
                                            setProfileData({
                                                ...profileData,
                                                lastName: e.target.value,
                                            });
                                        }}
                                        error={error.lastName}
                                    />
                                </FormGroup>
                                <Box pt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel id="genderSelect-label">
                                            Gender
                                        </InputLabel>
                                        <Select
                                            labelId="genderSelect-label"
                                            id="genderSelect"
                                            value={profileData["gender"]}
                                            onChange={(e) => {
                                                setProfileData({
                                                    ...profileData,
                                                    gender: e.target.value,
                                                });
                                            }}
                                            label="Gender"
                                            error={error.gender}
                                            name="gender"
                                            sx={{ textAlign: "left" }}
                                            defaultValue={
                                                profileData.gender
                                                    ? profileData.gender
                                                    : "none"
                                            }
                                        >
                                            <MenuItem value="none">
                                                N/A
                                            </MenuItem>
                                            <MenuItem value="Female">
                                                Female
                                            </MenuItem>
                                            <MenuItem value="Male">
                                                Male
                                            </MenuItem>
                                            <MenuItem value="Non-binary">
                                                Non-binary
                                            </MenuItem>
                                            <MenuItem value="Other">
                                                Other
                                            </MenuItem>
                                            <MenuItem value="Unknown">
                                                Prefer not to say
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box pt={2}>
                                    <FormGroup>
                                        <TextField
                                            label="Password"
                                            type="password"
                                            onChange={(e) => {
                                                setProfileData({
                                                    ...profileData,
                                                    password: e.target.value,
                                                });
                                            }}
                                            text={profileData["password"]}
                                            name="password"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <KeyIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            placeholder="Password"
                                            value={profileData["password"]?profileData['password']:""}
                                            error={error.password}
                                            sx={{ paddingBottom: "1rem" }}
                                        />
                                    </FormGroup>
                                </Box>
                                <Box>
                                    <FormGroup
                                        sx={{
                                            display: "flex",
                                            flexDirection: "initial",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Box>
                                            <Typography>
                                                Profile Picture
                                            </Typography>
                                            <img
                                                src={
                                                    profileData[
                                                        "profilePicturePath"
                                                    ]
                                                }
                                                alt={
                                                    profileData["firstName"] +
                                                    "'s Picture"
                                                }
                                                width="300"
                                            />
                                        </Box>
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                component="label"
                                            >
                                                <Typography variant="p">
                                                    Change picture
                                                </Typography>
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    multiple
                                                    type="file"
                                                    onChange={(e) => {
                                                        setFile(
                                                            e.target.files[0]
                                                        );
                                                    }}
                                                />
                                            </Button>
                                            <IconButton
                                                color="primary"
                                                aria-label="upload picture"
                                                component="label"
                                            >
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={(e) => {
                                                        setFile(
                                                            e.target.files[0]
                                                        );
                                                    }}
                                                />
                                                <PhotoCamera />
                                            </IconButton>
                                        </Box>
                                    </FormGroup>
                                </Box>
                            </Box>
                        </>
                    )}

                    <Box sx={{ textAlign: "center", pt: 3 }}>
                        {" "}
                        <Button
                            variant="contained"
                            onClick={() => {
                                editProfile();
                            }}
                        >
                            {" "}
                            Confirm Edits{" "}
                        </Button>
                    </Box>

                    <Box width="100%" sx={{ margin: "auto" }} py={1}>
                        {errorMessage !== "" ? (
                            <Alert
                                severity="error"
                                variant="filled"
                                onClose={() => {
                                    setErrorMessage("");
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        ) : (
                            ""
                        )}

                        {successMessage !== "" ? (
                            <Alert
                                severity="success"
                                variant="filled"
                                onClose={() => {
                                    successMessage("");
                                }}
                            >
                                {successMessage}
                            </Alert>
                        ) : (
                            ""
                        )}
                    </Box>
                </Container>
            </Box>
        </Paper>
    );
}

export default Profile;
