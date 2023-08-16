/**
 * Image: https://www.rawpixel.com/image/5926619/photo-image-background-public-domain-wooden
 */

import { Box } from "@mui/system";
import WallPaper from "../../components/WallPaper";

import BG_IMG_URL from "@/assets/img/wall1.jpg";
import { Link as RouterLink, Outlet } from "react-router-dom";

import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { WelcomePageButton, WelcomePageContainer } from "./Styles";
import StaffLogo from "../../components/StaffLogo";

const WelcomePage = () => {
    var isQueue = useSelector((state: RootState) => state.customer.isQueue);
    isQueue = isQueue || !!localStorage.getItem("isQueue");
    const HEIGHT = 60;

    return (
        <>
            <Box
                sx={{
                    height: "100%",
                }}
            >
                <WallPaper src={BG_IMG_URL} />
                <WelcomePageContainer>
                    <div>
                        <StaffLogo height={HEIGHT + "px"} type="dark" />
                        <WelcomePageButton
                            variant="contained"
                            sx={{
                                backgroundColor: "#cddc39",
                                color: "#fff",
                                fontWeight: "bolder",
                                "&:hover": {
                                    backgroundColor: "#cfec49",
                                },
                                height: `calc(50% - 40px - ${HEIGHT / 2}px)`,
                            }}
                            disabled={isQueue}
                        >
                            <RouterLink to="/welcome/customer_checkin">
                                Customer
                            </RouterLink>
                        </WelcomePageButton>
                        <WelcomePageButton
                            variant="contained"
                            sx={{
                                backgroundColor: "#424242",
                                color: "#fff",
                                fontWeight: "bolder",
                                "&:hover": {
                                    backgroundColor: "#494949",
                                },
                                height: `calc(50% - 40px - ${HEIGHT / 2}px)`,
                            }}
                            disabled={!!isQueue}
                        >
                            <RouterLink to="/welcome/staff_login">
                                Staff
                            </RouterLink>
                        </WelcomePageButton>
                    </div>
                    <Outlet />
                </WelcomePageContainer>
            </Box>
        </>
    );
};

export default WelcomePage;
