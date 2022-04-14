import { Box, Typography } from "@mui/material";

export default function Homepage(props) {
    return (
        <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}} pt={2}>
            <Typography variant="h4" color="text.primary">
                Welcome, {props.info.firstName}
            </Typography>
        </Box>
    );
}
