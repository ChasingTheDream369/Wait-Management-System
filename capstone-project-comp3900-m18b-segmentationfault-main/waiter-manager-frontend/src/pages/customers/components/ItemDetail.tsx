import { Box, Chip, Modal, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { setDetailedItem } from "../../../features/customers/customerSlice";
import { IMenuItem } from "../../../features/customers/types";
import throttle from "lodash/throttle";
import IngredientsStack from "./IngredientsStack";

const ItemDetail = () => {
    const detailedItem = useSelector(
        (state: RootState) => state.customer.detailedItem
    );

    const menuItem = useSelector((state: RootState) =>
        state.customer.menuItems.find(
            (t: IMenuItem) => t.id === state.customer.detailedItem
        )
    );

    const dispatch = useDispatch<AppDispatch>();

    const handleClose = () => {
        dispatch(setDetailedItem(null));
        const ele = document.getElementById("ingredients-stack");
        if (ele) ele.removeEventListener("wheel", handleWheelThrottled);
    };

    const ingredients = menuItem?.ingredients;

    return (
        <Modal
            open={detailedItem != null}
            onClose={handleClose}
            sx={{
                zIndex: "999999",
            }}
        >
            <Box sx={containerStyle}>
                <Typography
                    id="modal-modal-title"
                    variant="h5"
                    component="h2"
                    textAlign="center"
                    fontFamily="delius"
                >
                    {menuItem?.name ?? ""}
                </Typography>
                {/* Image */}
                <img
                    src={menuItem?.img_url ?? ""}
                    style={imgStyle}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setDetailedItem(menuItem!.id));
                    }}
                />
                {/* INGREDIENTS */}
                <Box padding="20px 20px 0 20px">
                    <Typography variant="subtitle1">Ingredients:</Typography>
                    <IngredientsStack ingredients={ingredients ?? []} />
                    {/* DESCRIPTION */}
                    <Box maxHeight="200px" sx={{ overflow: "auto" }}>
                        <Typography
                            id="modal-modal-description"
                            sx={{ fontFamily: "delius" }}
                        >
                            {menuItem?.description ?? ""}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

const handleWheel = (e:WheelEvent) => {
    const ele = document.getElementById("ingredients-stack");
    if (!ele || Math.abs(e.deltaY) < 1) return;
    ele.scrollBy({
        left: Math.sign(e.deltaY) * 80,
        behavior: "smooth",
    });
};

const handleWheelThrottled = throttle(handleWheel, 100);

const containerStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    bgcolor: "background.paper",
    borderRadius: "15px",
    boxShadow: 24,
    padding: "10px 0",
};

const imgStyle = {
    maxWidth: "100%",
    maxHeight: "350px",
    display: "block",
    backgroundColor: "#eee",
    margin: "10px auto 0 auto",
};

export default ItemDetail;
