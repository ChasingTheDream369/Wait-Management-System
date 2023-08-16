import { Button, SxProps } from "@mui/material";
import { styled } from "@mui/system";

export const formInputStyles: SxProps = {
    margin: "25px 0",
    display: "block",
};
export const WelcomePageButton = styled(Button)({
    display: "block",
    margin: "30px auto",
    width: "300px",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "32px",
    textAlign: "center",
    transition: "all 0.2s ease-out",
    ":hover": {
        fontSize: "38px",
    },
});

export const WelcomePageContainer = styled("div")({
    position: "absolute",
    top: "50%",
    left: "52%",
    transform: "translate(-50%, -50%)",
    minWidth: "360px",
    height: "auto",
    minHeight: "500px",
    padding: "25px",
    borderRadius: "25px",
    backgroundColor: "rgba(220, 237, 200, 0.9)",
    transition: "all 0.2s ease-out",
    display: "flex",
    boxShadow: "rgba(188, 188, 188, 0.2) 0px 8px 24px",
    justifyContent: "center",
});
