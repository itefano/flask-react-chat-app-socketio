import {
    Box,
    Typography,
    ImageList,
    ImageListItem,
    Skeleton,
    Container,
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
                    setStories(response.data);
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

    useEffect(()=>
    {
        console.log('stories:', stories)
    }, [stories])

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
            <Typography variant="h4" color="text.primary">
                Welcome, {props.info ? props.info.firstName : ""}
            </Typography>
            <Container>
                {stories!==null ? (
                    stories.stories ? (
                        <>
                            <ImageList cols={4} rowHeight={150} sx={{maxHeight:'80vh'}}>
                                {stories.stories.map((story, index) => (
                                    <ImageListItem key={index}>
                                        <Link to={"story/" + story.id}>
                                            <img
                                                src={story.picturePath}
                                                width={280}
                                                height={130}
                                            />
                                            <Typography variant="body1">
                                                {story.title}
                                            </Typography>
                                            <Typography variant="caption">
                                                By {story.authorName}
                                            </Typography>
                                        </Link>
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </>
                    ) : (
                        <Box sx={{ textAlign: "center", width:'100%' }}>
                            <Typography variant="h5" pt={3} color="secondary.main">
                                Nothing here...
                            </Typography>
                        </Box>
                    )
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
