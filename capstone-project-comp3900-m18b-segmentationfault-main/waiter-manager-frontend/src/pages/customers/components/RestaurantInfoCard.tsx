import { Box, Card, Typography } from "@mui/material";
import { IRestaurantDetail } from "../../../features/customers/types";
import { HiLocationMarker } from "react-icons/hi";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";

type RestaurantInfoCardProps = {
    info: IRestaurantDetail | undefined;
};

const RestaurantInfoCard = (props: RestaurantInfoCardProps) => {
    const { info } = props;
    return (
        <Card
            sx={{
                width: "60%",
                height: "75%",
                backgroundColor: "#fdfdfd",
                padding: "22px",
            }}
        >
            <Typography variant="h6" sx={typoStyle}>
                <MdOutlineDriveFileRenameOutline />
                {info?.name ?? ""}
            </Typography>
            <Typography variant="h6" sx={typoStyle}>
                <HiLocationMarker /> {info?.address ?? ""}
            </Typography>
            <p
                style={{
                    fontFamily: "delius",
                    fontSize: "20px",
                    height: "80%",
                    overflow: "auto",
                }}
            >
                {info?.description ?? ""}
            </p>
        </Card>
    );
};

const typoStyle = { color: "#333", height: "10%", textAlign: "center" };

export default RestaurantInfoCard;
