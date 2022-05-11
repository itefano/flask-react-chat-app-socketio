import { Box, Paper, Typography, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
export default function Story(props) {
    const param = useParams();
    const [story, setStory] = useState(null);
    useEffect(() => {
        if (param && param.slug) {
            axios({
                method: "GET",
                url: "/api/story/" + param.slug,
            })
                .then((response) => {
                    console.log(response);
                    setStory(response.data.story);
                })
                .catch((error) => {
                    setStory([]);
                    if (error.response && error.response.status !== 422) {
                        console.log(error.response);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                });
        }
    }, [param]);
    return (
        <Paper
        pt={2}
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            {story && story !== null && story !== undefined ? (
                <Container maxWidth="xs">
                    <Typography variant="h4" color="text.primary">{story.title}</Typography>
                    <Typography variant="body1" color="text.primary">{story.description}</Typography>
                    <img src={story.picturePath} alt={story.title} height={400} />
                    <Typography variant="body1" color="text.primary">{story.time_created}</Typography>
                    <Typography variant="body1" color="text.primary">By {story.authorName}</Typography>
                </Container>
            ) : (
                ""
            )}
        </Paper>
    );
}
