import {
    AppBar,
    createTheme,
    ThemeProvider,
    Toolbar,
    Typography,
} from "@mui/material";
import { CallWaiterButton } from "./CallWaiterButton";

interface MainBarProps {
    tableName: string;
}
const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#2976d2",
        },
    },
});
const MainBar = (props: MainBarProps) => (
    <ThemeProvider theme={darkTheme}>
        <AppBar position="fixed" color="primary">
            <Toolbar>
                <img
                    src={"/img/static/logo-white.png"}
                    style={{
                        height: "58px",
                        margin: "3px 15px 3px 0",
                    }}
                ></img>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontFamily: "Anton",
                        fontSize: "32px",
                    }}
                ></Typography>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontFamily: "Anton",
                        fontSize: "25px",
                    }}
                >
                    {`Name: ${localStorage.getItem("customerName") || ""} `}
                    &nbsp;&nbsp;&nbsp;&nbsp; Table: {props.tableName ?? ""}
                </Typography>
                <CallWaiterButton />
            </Toolbar>
        </AppBar>
    </ThemeProvider>
);

export default MainBar;
