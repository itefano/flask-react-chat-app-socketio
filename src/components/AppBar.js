import { useEffect, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import {
    Switch,
    Menu,
    MenuItem,
    Badge,
    InputBase,
    Typography,
    IconButton,
    Toolbar,
    Box,
    AppBar,
    SwipeableDrawer,
    List,
    ListItem,
    Divider,
    ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
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
    const [seeNotifications, setSeeNotifications] = useState(false);
    const handleTheme = () => {
        setChecked(!checked);
        props.handleTheme();
    };

    useEffect(() => {
        if ((
            localStorage.getItem("notifications") !== null &&
            localStorage.getItem("notifications") !== undefined)//move this somewhere else in the future
        ) {
            setNotifications(localStorage.getItem("notifications"
            ));
        }
        else{
            if (props.info.notifications !== null && props.info.notifications !== undefined) {
                localStorage.setItem("notifications", props.info.notifications);
                setNotifications(props.info.notifications);
            }
        }
    }, [props.info]);
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
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const toggleDrawer = (newOpen) => {
        setOpenDrawer(newOpen);
    };
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const logout = () => {
        axios({
            method: "POST",
            url: "/api/logout",
        })
            .then((response) => {
                props.removeToken();
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
        navigate("/");
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const menuId = "primary-search-account-menu";
    const renderMenu = (
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
            {props.token !== null && props.token !== undefined ? (
                <Box>
                    <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                    <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                </Box>
            ) : (
                <MenuItem onClick={signIn}>Sign In</MenuItem>
            )}
        </Menu>
    );

    const mobileMenuId = "primary-search-account-menu-mobile";
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label={"show " + notifications + " new notifications"}
                    color="inherit"
                    onClick={()=>{setSeeNotifications(true)}}
                >
                    <Badge badgeContent={notifications} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
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
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ "aria-label": "search" }}
                        />
                    </Search>
                    <Box sx={{ flexGrow: 1 }} />
                    <MaterialUISwitch
                        sx={{ m: 1 }}
                        checked={checked}
                        inputProps={{ "aria-label": "controlled" }}
                        onChange={handleTheme}
                    />
                    <Box sx={{ display: { xs: "none", md: "flex" } }}>
                        <IconButton
                            size="large"
                            aria-label={"show " + notifications + " new notifications"}
                            color="inherit"
                            onClick={()=>{setSeeNotifications(true)}}
                        >
                            <Badge badgeContent={notifications} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
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
                    <Box sx={{ display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
        </Box>
    );
}
