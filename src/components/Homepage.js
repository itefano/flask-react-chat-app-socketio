import {
    Box,
    Typography,
    ImageList,
    ImageListItem,
    Skeleton,
    Container,
    Card,
    CardContent,
    CardMedia,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
export default function Homepage(props) {
    const [stories, setStories] = useState(null);
    const skeletons = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    const getStories = () => {
        if (props.token) {
            axios({
                method: "GET",
                url: "/api/stories",
                headers: {
                    Authorization: "Bearer " + props.token,
                },
            })
                .then((response) => {
                    setStories(response.data);//TODO: group stories by user to make singletons
                })
                .catch((error) => {
                    setStories([]);
                    if (error.response && error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    };

    useEffect(() => {
        console.log("stories:", stories);
    }, [stories]);

    useEffect(() => {
        getStories();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
            pt={2}
        >
            <Typography variant="h4" color="text.primary" mb={2}>
                Welcome, {props.info ? props.info.firstName : ""}
            </Typography>
            <Container>
                {stories !== null ? (
                    <>
                        <Typography variant="h5" color="text.primary" mb={2}>
                            Here are the latest stories
                        </Typography>
                        {stories.stories ? (
                        <>
                            <ImageList
                                cols={4}
                                rowHeight={225}
                                sx={{ maxHeight: "70vh" }}
                            >
                                {stories.stories.map((story, index) => {
                                    return(
                                    <ImageListItem key={index}>
                                        <Link
                                            to={"story/" + story.id}
                                            sx={{ textDecoration: "none" }}
                                        >
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    image={story.picturePath}
                                                    width={280}
                                                    height={130}
                                                    alt={story.title}
                                                />
                                                <CardContent>
                                                    <Typography variant="body1">
                                                        {story.title}
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        By {story.authorName}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </ImageListItem>)
                                })}
                            </ImageList>
                        </>
                        ) : (
                        <Box sx={{ textAlign: "center", width: "100%" }}>
                            <Typography
                                variant="h5"
                                pt={3}
                                color="secondary.main"
                            >
                                Nothing here...
                            </Typography>
                        </Box>
                        )}
                    </>
                ) : (
                    <>
                        <ImageList cols={4} rowHeight={150}>
                            {skeletons.map((skeleton, index) => (
                                <ImageListItem key={index}>
                                    <Skeleton
                                        variant="rectangle"
                                        width={280}
                                        height={125}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width={280}
                                        height={20}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width={250}
                                        height={20}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </>
                )}
            </Container>
        </Box>
    );
}
