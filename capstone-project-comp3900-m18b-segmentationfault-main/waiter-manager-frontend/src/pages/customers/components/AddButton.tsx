import { Fab } from "@mui/material";
import { styled } from "@mui/system";

export const AddButton = styled(Fab)({
    backgroundColor: "#ff9c00",
    fontSize: "26px",
    width: "40px",
    height: "40px",
    color: "#eceff1",
    zIndex: "1",
    ":hover": {
        backgroundColor: "#ffbc33",
    },
    margin: "auto 12px",
    boxShadow: "0 0 4px 0 rgba(0,0,0,0.3)",
});
