import { useEffect, useState } from "react";
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
    List,
    ListItem,
    Divider,
    ListItemText,
    Popper,
    Fade,
    Avatar,
    Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
    let navigate = useNavigate();
    const [checked, setChecked] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [popperAnchorEl, setPopperAnchorEl] = useState(null);
    const [searchPopperAnchorEl, setSearchPopperAnchorEl] = useState(null);
    const handleTheme = () => {
        setChecked(!checked);
        props.handleTheme();
    };
    const [openSearchPopper, setOpenSearchPopper] = useState(false);
    const [openPopper, setOpenPopper] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        if (event.target.value === "") {
            setOpenSearchPopper(false);
        } else {
            setSearchPopperAnchorEl(event.currentTarget);
            setOpenSearchPopper(true);
        }
    };

    const getNotifications = () => {
        if (props.token) {
            axios({
                method: "POST",
                url: "/api/notifications",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    setUnreadMessages(response.data.messages);
                    setNotifications(response.data.messages.length);
                })
                .catch((error) => {
                    if (error.response && error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    };
    const handleCloseSearch = () => {
        setOpenPopper(false);
    };
    const seeNotifications = (e) => {
        setPopperAnchorEl(e.currentTarget);
        setOpenPopper((previousOpen) => !previousOpen);
    };
    const canBeOpen = openPopper && Boolean(popperAnchorEl);
    const canBeOpenSearch = openSearchPopper && Boolean(searchPopperAnchorEl);
    const id = canBeOpen ? "transition-popper" : undefined;
    const idSearch = canBeOpenSearch ? "transition-popper" : undefined;

    useEffect(() => {
        if (searchTerm && props.token) {
            axios({
                method: "POST",
                url: "/api/search",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
                data: { search_term: searchTerm },
            })
                .then((response) => {
                    setSearchResults(response.data.results);
                })
                .catch((error) => {
                    if (error.response && error.response.status !== 422 && error.response.status !== 401) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    }, [searchTerm]);

    useEffect(() => {
        getNotifications();
    }, []);

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
            method: "POST",
            url: "/api/markallasread",
            headers: {
                Authorization: "Bearer " + props.token,
            },
        })
            .then((response) => {
                console.log(response.data);
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
        setOpenDrawer(newOpen);
    };
    const isMenuOpen = Boolean(anchorEl);
    const logout = () => {
        axios({
            method: "POST",
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
        <Box
            role="presentation"
            onKeyDown={() => {
                toggleDrawer(false);
            }}
        >
            <List>
                {[
                    { name: "Homepage", link: "/" },
                    { name: "Contacts", link: "/contacts" },
                    { name: "Groups", link: "groups" },
                ].map((e, index) => (
                    <Link
                        key={e.name}
                        to={e.link}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <ListItem button>
                            <ListItemText>{e.name}</ListItemText>
                        </ListItem>
                    </Link>
                ))}
            </List>
            <Divider />
            <List>
                {["Legal", "About", "Report a bug"].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
    const signIn = () => {
        navigate("/login");
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSearchMenuClose = () => {
        setOpenSearchPopper(false);
    };

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
        <Box sx={{ flexGrow: 1 }}>
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
                            onClick={() => {
                                toggleDrawer(!openDrawer); //doesn't seem to be working if I hard set it to false ???
                            }}
                        >
                            <MenuIcon />
                            <SwipeableDrawer
                                open={openDrawer}
                                onClose={() => {
                                    toggleDrawer(false);
                                }}
                                onOpen={() => {
                                    toggleDrawer(true);
                                }}
                            >
                                {drawerContents()}
                            </SwipeableDrawer>
                        </IconButton>
                    )}
                    <Link
                        to="/"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ display: { xs: "none", sm: "block" } }}
                        >
                            Blablapp
                        </Typography>
                    </Link>
                    {props.token &&
                        props.token !== "" &&
                        props.token !== undefined && (
                            <Search
                                onChange={handleSearch}
                                value={searchTerm}
                                onBlur={handleSearchMenuClose}
                                aria-describedby={"search" + idSearch}
                            >
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search…"
                                    inputProps={{
                                        "aria-label": "search" + idSearch,
                                    }}
                                />
                            </Search>
                        )}

                    <Popper
                        open={openSearchPopper}
                        anchorEl={searchPopperAnchorEl}
                        placement="bottom-start"
                        transition
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Box>
                                    <Paper>
                                        <Box
                                            p={2}
                                            sx={{
                                                height: "50vh",
                                                width: "400px",
                                                overflow: "auto",
                                            }}
                                        >
                                            {!searchResults ||
                                            searchResults === undefined ||
                                            searchResults === null ||
                                            searchResults.length === 0 ? (
                                                <Box
                                                    sx={{ textAlign: "center" }}
                                                >
                                                    <Typography variant="h5">
                                                        No matches found
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    <Stack spacing={2}>
                                                        {searchResults.users &&
                                                            searchResults.users.map(
                                                                (e, index) => {
                                                                    let firstNameLastName = e.firstName + " " + e.lastName;
                                                                    let currentSearchTerm =
                                                                        searchTerm.trim();
                                                                    let searchTermSplit = currentSearchTerm.split(' ');
                                                                    for(let i = 0; i<searchTermSplit.length; i++)
                                                                    {//fuck me that one was needlessly tedious
                                                                        let searchPattern = new RegExp('(?![^<]*>|[^<>]*</)'+searchTermSplit[i]+'(?![^</]*>|[^</>]*</)','gi');//allows us to ignore the case and to replace appropriately
                                                                        let sliceIndexMin = firstNameLastName.search(searchPattern)//for legibility's sake
                                                                        let sliceIndexMax = sliceIndexMin+searchTermSplit[i].length;//same as above
                                                                        firstNameLastName = firstNameLastName.replace(searchPattern, "<strong>"+firstNameLastName.slice(sliceIndexMin, sliceIndexMax)+"<\/strong>")//replaces the first found occurence of a word that corresponds to the given pattern, with the pattern surrounded by <strong> tags. Note : this is case insensitive and replaces the pattern (kind of) appropriately. The best part? It also replaces the pattern correctly if the words are given in disorder. The worst part? It doesn't work well for people who have both the same first name and last name.
                                                                    }
                                                                    let email =
                                                                        e.email.toLowerCase();
                                                                    currentSearchTerm =
                                                                        searchTerm.trim().split(' ').join('').toLowerCase();
                                                                    if (searchResults.isLastFirstName)
                                                                    {
                                                                        currentSearchTerm =
                                                                            searchTerm.trim().split(' ').join('').toLowerCase();
                                                                    }
                                                                    if (
                                                                        e.email.includes(
                                                                            currentSearchTerm
                                                                        )
                                                                    ) {
                                                                        let minIndexName =
                                                                            e.email.indexOf(
                                                                                currentSearchTerm
                                                                            );
                                                                        let maxIndexName =
                                                                            e.email.indexOf(
                                                                                currentSearchTerm
                                                                            ) +
                                                                            currentSearchTerm.length;
                                                                        let replaceLeft =
                                                                            e.email.slice(
                                                                                0,
                                                                                minIndexName
                                                                            );
                                                                        let replaceMiddle =
                                                                            e.email.slice(
                                                                                minIndexName,
                                                                                maxIndexName
                                                                            );
                                                                        let replaceRight =
                                                                            e.email.slice(
                                                                                maxIndexName
                                                                            );
                                                                        email =
                                                                            replaceLeft +
                                                                            "<strong>" +
                                                                            replaceMiddle +
                                                                            "</strong>" +
                                                                            replaceRight;
                                                                    }

                                                                    return (
                                                                        <Paper
                                                                            key={
                                                                                index
                                                                            }
                                                                            elevation={
                                                                                4
                                                                            }
                                                                        >
                                                                            <Box
                                                                                p={
                                                                                    2
                                                                                }
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
                                                                                            variant="p"
                                                                                            pl={
                                                                                                2
                                                                                            }
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html:firstNameLastName
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
                                                                    );
                                                                }
                                                            )}
                                                    </Stack>
                                                </>
                                            )}
                                        </Box>
                                    </Paper>
                                </Box>
                            </Fade>
                        )}
                    </Popper>
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
                                onBlur={handleCloseSearch}
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
                                    <AccountCircle />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <MenuItem onClick={signIn}>Sign In</MenuItem>
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
                                    {!unreadMessages ||
                                    unreadMessages === undefined ||
                                    unreadMessages === null ||
                                    unreadMessages.length === 0 ? (
                                        <Box sx={{ textAlign: "center" }}>
                                            <Typography variant="h5">
                                                No new notifications
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <>
                                            <Box
                                                mb={2}
                                                sx={{ textAlign: "right" }}
                                            >
                                                <Button
                                                    variant="text"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all as read
                                                </Button>
                                            </Box>
                                            <Stack spacing={2}>
                                                {unreadMessages.map(
                                                    (e, index) => (
                                                        <Paper
                                                            key={index}
                                                            elevation={4}
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
                                                                    </Box>
                                                                </Box>
                                                                <Box pt={2}>
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
