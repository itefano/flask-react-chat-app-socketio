
import { createTheme } from '@mui/material/styles';
import { createContext } from 'react';

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

const lightTheme = createTheme({
    palette: {
        mode: "light",
    },
});
const Theme = createContext(darkTheme);
export default Theme;

export {lightTheme, darkTheme};