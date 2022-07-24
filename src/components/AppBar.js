import { useEffect, useState, useCallback } from "react";
import { styled, alpha } from "@mui/material/styles";
import {
    Switch,
    Menu,
    MenuItem,
    Badge,
    Stack,
    InputBase,
    Typography,
    Paper,
    IconButton,
    Toolbar,
    Box,
    AppBar,
    SwipeableDrawer,
    Popper,
    Fade,
    Avatar,
    Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import GroupList from "./GroupList";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "20ch",
        },
    },
}));

export default function PrimarySearchAppBar(props) {
    const getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height,
        };
    };

    const useWindowDimensions = () => {
        const [windowDimensions, setWindowDimensions] = useState(
            getWindowDimensions()
        );

        useEffect(() => {
            function handleResize() {
                setWindowDimensions(getWindowDimensions());
            }

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        return windowDimensions;
    };

    const { height } = useWindowDimensions(); //not using width here
    let navigate = useNavigate();
    const [checked, setChecked] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [notifications, setNotifications] = useState(0); // TODO: add notifications "read" by click, and redirect to group
    const [searchResults, setSearchResults] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [popperAnchorEl, setPopperAnchorEl] = useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);
    const handleTheme = () => {
        setChecked(!checked);
        props.handleTheme();
    };
    const [openSearch, setOpenSearch] = useState(false);
    const [openPopper, setOpenPopper] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        if (event.target.value === "") {
            setOpenSearch(false);
        } else {
            setSearchAnchorEl(event.currentTarget);
            setOpenSearch(true);
        }
    };

    const getNotifications = useCallback(() => {
        //memoizing the notifications to avoid endless loop of reloading without having to do an ugly warning ignore in the useEffect hook that gets the notifications on page load
        if (props.token) {
            axios({
                method: "GET",
                url: "/api/notifications",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    setUnreadMessages(response.data.messages);
                    setFriendRequests(response.data.friendRequests);
                    setNotifications(response.data.messages.length);
                })
                .catch((error) => {
                    if (error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    }, [props.token]);
    const seeNotifications = (e) => {
        setPopperAnchorEl(e.currentTarget);
        setOpenPopper((previousOpen) => {
            if (previousOpen) {
                setSearchTerm("");
                setOpenSearch(false);
            }
            return !previousOpen;
        });
    };
    const canBeOpen = openPopper && Boolean(popperAnchorEl);
    const canBeOpenSearch = openSearch && Boolean(searchAnchorEl);
    const id = canBeOpen ? "transition-popper" : undefined;
    const idSearch = canBeOpenSearch ? "transition-popper" : undefined;

    useEffect(() => {
        if (searchTerm && props.token) {
            axios({
                method: "GET",
                url: "/api/search",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
                params: { search_term: searchTerm },
            })
                .then((response) => {
                    setSearchResults(response.data.results);
                })
                .catch((error) => {
                    if (
                        error.response &&
                        error.response.status !== 422 &&
                        error.response.status !== 401
                    ) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    }, [searchTerm, props.token]);

    useEffect(() => {
        if (
            !notifications ||
            notifications === null ||
            notifications === undefined ||
            notifications.length === 0
        ) {
            getNotifications();
        }
    }, [notifications, getNotifications]);

    useEffect(() => {
        if (
            localStorage.getItem("notifications") !== null &&
            localStorage.getItem("notifications") !== undefined //move this somewhere else in the future
        ) {
            setNotifications(localStorage.getItem("notifications"));
        }
    }, [props.info]);

    const markAllAsRead = () => {
        axios({
            method: "GET",
            url: "/api/markallasread",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                getNotifications();
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    };

    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        "& .MuiSwitch-switchBase": {
            margin: 1,
            padding: 0,
            transform: "translateX(6px)",
            "&.Mui-checked": {
                color: "#fff",
                transform: "translateX(22px)",
                "& .MuiSwitch-thumb:before": {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        "#fff"
                    )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
                },
                "& + .MuiSwitch-track": {
                    opacity: 1,
                    backgroundColor:
                        theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
                },
            },
        },
        "& .MuiSwitch-thumb": {
            backgroundColor:
                theme.palette.mode === "dark" ? "#003892" : "#001e3c",
            width: 32,
            height: 32,
            "&:before": {
                content: "''",
                position: "absolute",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    "#fff"
                )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
            },
        },
        "& .MuiSwitch-track": {
            opacity: 1,
            backgroundColor:
                theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
            borderRadius: 20 / 2,
        },
    }));
    const [anchorEl, setAnchorEl] = useState(null);
    const toggleDrawer = (newOpen) => {
        if (!newOpen) {
            setSearchTerm("");
            setOpenSearch(false);
        }
        setOpenDrawer(newOpen);
    };
    const isMenuOpen = Boolean(anchorEl);
    const logout = () => {
        axios({
            method: "GET",
            url: "/api/logout",
        })
            .then((response) => {
                props.removeToken();
                localStorage.clear();
                navigate("/");
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
    };

    // drawer contents :

    const drawerContents = () => (
        <Paper
            square
            role="presentation"
            sx={{ width: "400px", overflow: "hidden" }}
        >
            {/* <AddFriend/>
            <CreateGroup/> */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flexDirection: "row",
                }}
                position="fixed"
            >
                {props.token &&
                    props.token !== "" &&
                    props.token !== undefined && (
                        <Search
                            onChange={handleSearch}
                            value={searchTerm}
                            // onBlur={handleSearchMenuClose}
                            aria-describedby={"search" + idSearch}
                            id="searchBoxDrawer"
                        >
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{
                                    "aria-label": "search" + idSearch,
                                }}
                                sx={{ height: "100%" }}
                            />
                        </Search>
                    )}
                <Link
                    to="/addUser"
                    style={{
                        display: "flex",
                        textDecoration: "none",
                        color: "inherit",
                        width: "100%",
                    }}
                >
                    <IconButton aria-label="addFriend" size="large">
                        <PersonAddIcon fontSize="inherit" />
                    </IconButton>
                </Link>

                <Link
                    to="/createGroup"
                    style={{
                        display: "flex",
                        textDecoration: "none",
                        color: "inherit",
                        width: "100%",
                    }}
                >
                    <IconButton aria-label="createGroup" size="large">
                        <GroupAddIcon fontSize="inherit" />
                    </IconButton>
                </Link>
            </Box>
            <Box
                // onKeyDown={() => {
                //     toggleDrawer(false);
                // }}
                sx={{
                    width: "100%",
                    marginTop: "55px",
                    overflowY: "scroll",
                    height: (height - 55).toString() + "px", //hacky af but I mean... it works, right?
                }}
            >
                <Box
                    // onKeyDown={() => {
                    //     toggleDrawer(false);
                    // }}
                    sx={{ width: "100%" }}
                >
                    <GroupList
                        token={props.token}
                        openSearch={openSearch}
                        searchResults={searchResults}
                        searchTerm={searchTerm}
                        info={props.info}
                    />
                </Box>
            </Box>
        </Paper>
    );
    const signIn = () => {
        navigate("/login");
    };
    const signUp = () => {
        navigate("/signUp");
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const updateFriendRequest = (id, status) => {
        if (props.token) {
            axios({
                method: "POST",
                url: "/api/setFriendRequest",
                data: {
                    friendshipId: id,
                    status: status,
                },
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    getNotifications();
                })
                .catch((error) => {
                    if (error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    };

    const acceptFriendRequest = (id) => {
        //intermediary step for debugging purposes, not really needed
        updateFriendRequest(id, true);
    };
    const declineFriendRequest = (id) => {
        updateFriendRequest(id, false);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // const handleSearchMenuClose = () => {
    //      setOpenSearch(false);

    // };

    const menuId = "primary-search-account-menu";
    const renderMenu = props.token &&
        props.token !== "" &&
        props.token !== undefined && (
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                id={menuId}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
            >
                <Box>
                    <MenuItem
                        onClick={() => {
                            handleMenuClose();
                            navigate("/profile");
                        }}
                    >
                        Profile
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleMenuClose();
                            logout();
                        }}
                    >
                        Logout
                    </MenuItem>
                </Box>
            </Menu>
        );

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    {!props.token ||
                    props.token === "" ||
                    props.token === undefined ? (
                        ""
                    ) : (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            sx={{ mr: 2 }}
                            onClick={(e) => {
                                let parent =
                                    document.getElementById("searchBoxDrawer");
                                if (
                                    !parent ||
                                    !parent === e.target ||
                                    !parent.contains(e.target)
                                ) {
                                    //very hacky but seems to work...? Normal drawer behaviour can't differenciate between what's inside of the drawer and what's outside, so I just check which elements i click on through their parent to make sure not to close the drawer in some instances
                                    toggleDrawer(!openDrawer);
                                }
                            }}
                        >
                            <MenuIcon />
                            <SwipeableDrawer
                                open={openDrawer}
                                onClose={() => {
                                    toggleDrawer(false);
                                }}
                                onOpen={() => {
                                    // toggleDrawer(true); //broken...?
                                }}
                            >
                                {drawerContents()}
                            </SwipeableDrawer>
                        </IconButton>
                    )}
                    <Link
                        to="/"
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <HomeIcon />
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ display: { xs: "none", sm: "block" } }}
                            pl={1}
                        >
                            Unnamed chat app
                        </Typography>
                    </Link>

                    <Box sx={{ flexGrow: 1 }} />
                    <MaterialUISwitch
                        sx={{ m: 1 }}
                        checked={checked}
                        inputProps={{ "aria-label": "controlled" }}
                        onChange={handleTheme}
                    />

                    {props.token &&
                    props.token !== null &&
                    props.token !== undefined ? (
                        <>
                            <IconButton
                                size="large"
                                aria-describedby={id}
                                aria-label={
                                    "show " +
                                    notifications +
                                    " new notifications"
                                }
                                color="inherit"
                                onClick={seeNotifications}
                            >
                                {notifications > 0 ? (
                                    <Badge
                                        badgeContent={notifications}
                                        color="error"
                                    >
                                        <NotificationsIcon />
                                    </Badge>
                                ) : (
                                    <Badge color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                )}
                            </IconButton>
                            <Box>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    {props &&
                                    props.info &&
                                    props.info.profilePicturePath &&
                                    props.info.profilePicturePath.length > 0 ? (
                                        <Avatar
                                            alt="My picture"
                                            src={props.info.profilePicturePath}
                                        />
                                    ) : (
                                        <AccountCircle />
                                    )}
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <>
                            <MenuItem onClick={signIn}>Login</MenuItem>
                            <MenuItem onClick={signUp}>Sign Up</MenuItem>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Popper
                open={openPopper}
                anchorEl={popperAnchorEl}
                placement="bottom"
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Box m={2}>
                            <Paper>
                                <Box
                                    p={2}
                                    sx={{
                                        height: "50vh",
                                        width: "400px",
                                        overflow: "auto",
                                    }}
                                >
                                    {(!unreadMessages ||
                                        unreadMessages === undefined ||
                                        unreadMessages === null ||
                                        unreadMessages.length === 0) &&
                                    (!friendRequests ||
                                        friendRequests === undefined ||
                                        friendRequests === null ||
                                        friendRequests.length === 0) ? (
                                        <Box sx={{ textAlign: "center" }}>
                                            <Typography variant="h5">
                                                No new notifications
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <>
                                            <Box
                                                mb={2}
                                                sx={{
                                                    textAlign: "right",
                                                }}
                                            >
                                                <Button
                                                    variant="text"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all as read
                                                </Button>
                                            </Box>
                                            {friendRequests && (
                                                <>
                                                    <Stack spacing={2}>
                                                        {friendRequests.map(
                                                            (e, index) => (
                                                                <Paper
                                                                    key={index}
                                                                    elevation={
                                                                        4
                                                                    }
                                                                >
                                                                    <Box
                                                                        p={2}
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            flexDirection:
                                                                                "row",
                                                                            alignItems:
                                                                                "stretch",
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    "flex",
                                                                                flexDirection:
                                                                                    "row",
                                                                                alignItems:
                                                                                    "center",
                                                                            }}
                                                                        >
                                                                            <Avatar
                                                                                alt={
                                                                                    e.firstName +
                                                                                    "'s Picture"
                                                                                }
                                                                                src={
                                                                                    e.profilePicturePath
                                                                                }
                                                                            />
                                                                            <Box
                                                                                sx={{
                                                                                    display:
                                                                                        "flex",
                                                                                    flexDirection:
                                                                                        "row",
                                                                                    alignItems:
                                                                                        "baseline",
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="h5"
                                                                                    pl={
                                                                                        2
                                                                                    }
                                                                                >
                                                                                    {e.firstName +
                                                                                        " " +
                                                                                        e.lastName}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box
                                                                                pt={
                                                                                    2
                                                                                }
                                                                                sx={{
                                                                                    display:
                                                                                        "flex",
                                                                                    flexDirection:
                                                                                        "row",
                                                                                    alignItems:
                                                                                        "stretch",
                                                                                }}
                                                                            >
                                                                                <IconButton
                                                                                    variant="icon"
                                                                                    onClick={() => {
                                                                                        acceptFriendRequest(
                                                                                            e.id
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <DoneIcon />
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    variant="icon"
                                                                                    onClick={() => {
                                                                                        declineFriendRequest(
                                                                                            e.id
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <CloseIcon />
                                                                                </IconButton>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Paper>
                                                            )
                                                        )}
                                                    </Stack>
                                                </>
                                            )}
                                            {unreadMessages && (
                                                <>
                                                    <Stack spacing={2}>
                                                        {unreadMessages.map(
                                                            (e, index) => (
                                                                <Paper
                                                                    key={index}
                                                                    elevation={
                                                                        4
                                                                    }
                                                                >
                                                                    <Box p={2}>
                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    "flex",
                                                                                flexDirection:
                                                                                    "row",
                                                                                alignItems:
                                                                                    "center",
                                                                            }}
                                                                        >
                                                                            <Avatar
                                                                                alt={
                                                                                    e.authorFirstName +
                                                                                    "'s Picture"
                                                                                }
                                                                                src={
                                                                                    e.authorProfilePicturePath
                                                                                }
                                                                            />
                                                                            <Box
                                                                                sx={{
                                                                                    display:
                                                                                        "flex",
                                                                                    flexDirection:
                                                                                        "row",
                                                                                    alignItems:
                                                                                        "baseline",
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="h5"
                                                                                    pl={
                                                                                        2
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        e.authorFirstName
                                                                                    }
                                                                                </Typography>
                                                                                {e.groupName &&
                                                                                e
                                                                                    .groupName
                                                                                    .length >
                                                                                    0 ? (
                                                                                    <>
                                                                                        <Typography
                                                                                            variant="p"
                                                                                            px={
                                                                                                1
                                                                                            }
                                                                                        >
                                                                                            in
                                                                                        </Typography>
                                                                                        <Typography variant="body1">
                                                                                            {
                                                                                                e.groupName
                                                                                            }
                                                                                        </Typography>
                                                                                    </>
                                                                                ) : (
                                                                                    ""
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                        <Box
                                                                            pt={
                                                                                2
                                                                            }
                                                                        >
                                                                            <Typography variant="p">
                                                                                {
                                                                                    e.content
                                                                                }
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </Paper>
                                                            )
                                                        )}
                                                    </Stack>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                )}
            </Popper>

            {renderMenu}
        </Box>
    );
}
