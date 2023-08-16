import { Card, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Badge } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../app/store";
import { setDetailedItem } from "../../../features/customers/customerSlice";
import { IMenuItem } from "../../../features/customers/types";
import { AddButton } from "./AddButton";

export interface MenuItemCardProps {
    menuItem: IMenuItem;
    quantity?: number;
    addHandler?: (itemId: number) => void;
    removeHandler?: (itemId: number) => void;
    readOnly?: boolean;
}

// Asssume menuItem non-null
const MenuItemCard = (props: MenuItemCardProps) => {
    const { menuItem, quantity, addHandler, removeHandler, readOnly } = props;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    return (
        <Badge.Ribbon
            text="🔥SPECIAL"
            color="red"
            style={{
                display: menuItem.speciality ? "block" : "none",
                fontSize: "22px",
                padding: "8px",
                boxSizing: "content-box",
                fontWeight: "bold",
            }}
        >
            <Card variant="outlined" sx={cardSx}>
                <img
                    src={menuItem.img_url}
                    crossOrigin=""
                    style={{
                        ...imgStyle,
                        cursor: "pointer",
                    }}
                    alt=""
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!readOnly) {
                            dispatch(setDetailedItem(menuItem.id));
                        } else {
                            navigate(
                                "/customers/categories/" + menuItem.cat_id
                            );
                            navigate(0);
                        }
                    }}
                />
                <Stack direction="row" justifyContent={"center"}>
                    <Typography
                        variant="h6"
                        padding={1}
                        fontSize="24px"
                        fontFamily="delius"
                        sx={{ userSelect: "all" }}
                    >
                        {menuItem.name}
                    </Typography>
                </Stack>
                {!readOnly &&
                    quantity != null &&
                    removeHandler != null &&
                    addHandler != null && (
                        <Stack direction="row" justifyContent={"center"}>
                            <AddButton
                                onClick={(e) => {
                                    if (quantity <= 0) return;
                                    removeHandler(menuItem.id);
                                }}
                            >
                                -
                            </AddButton>
                            <p
                                style={{
                                    lineHeight: "40px",
                                    fontFamily: "delius",
                                    fontSize: "20px",
                                    margin: "0",
                                }}
                            >
                                {props.quantity}
                            </p>
                            <AddButton
                                onClick={(e) => {
                                    if (menuItem.stock <= quantity) return;
                                    addHandler(menuItem.id);
                                }}
                            >
                                +
                            </AddButton>
                        </Stack>
                    )}
                <Stack
                    direction="row"
                    justifyContent="center"
                    marginBottom={0.5}
                >
                    <Box sx={{ margin: "10px 20px" }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "#aaa" }}
                            textAlign="center"
                            fontFamily="delius"
                        >
                            Price
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            textAlign="center"
                            fontFamily="delius"
                        >
                            {`\$${menuItem.price.toFixed(2)}`}
                        </Typography>
                    </Box>

                    <Box sx={{ margin: "10px 20px" }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ color: "#aaa" }}
                            textAlign="center"
                            fontFamily="delius"
                        >
                            Stock
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            textAlign="center"
                            fontFamily="delius"
                        >
                            {menuItem.stock}
                        </Typography>
                    </Box>
                </Stack>
            </Card>
        </Badge.Ribbon>
    );
};

const cardSx = {
    minWidth: 300,
    heihgt: 400,
    borderRadius: "10px",
    boxShadow: "0px 0px 5px 1px #eee",
    zindex: 0,
    backgroundColor: "#fafafb",
    border: "0.3px solid #eee",
    transition: "all 0.1s ease-out",
    ":hover": {
        border: "0.3px solid #ddd",
        boxShadow: "0px 0px 7px 5px #ddd",
    },
    userSelect: "none",
};

const imgStyle = {
    width: "100%",
    height: "300px",
    display: "block",
    backgroundColor: "#eee",
};

export default MenuItemCard;
