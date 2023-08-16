import { Button, Stack, Typography } from "@mui/material";

interface OrderByTrayProps {
    orderBy: string;
    clickHandler: (orderBy: string) => void;
}

export const ORDER_BY_DEFAULT = "default";
export const ORDER_BY_PRICE_ASC = "price_asc";
export const ORDER_BY_PRICE_DESC = "price_desc";
export const ORDER_BY_NAME = "name";
export const ORDER_BY_STOCK = "stock";

const OrderByTray = (props: OrderByTrayProps) => {
    const { orderBy, clickHandler } = props;
    return (
        <Stack direction="row" sx={trayStyle}>
            <Typography variant="subtitle1" lineHeight="60px" margin="auto 5px">
                Order By:
            </Typography>
            {/* Default */}
            <Button
                variant={
                    orderBy === ORDER_BY_DEFAULT ? "contained" : "outlined"
                }
                color="warning"
                sx={ButtonStyle}
                onClick={() =>
                    orderBy !== ORDER_BY_DEFAULT &&
                    clickHandler(ORDER_BY_DEFAULT)
                }
            >
                Default
            </Button>
            {/* PRICE ASC*/}
            <Button
                variant={
                    orderBy === ORDER_BY_PRICE_ASC ? "contained" : "outlined"
                }
                color="warning"
                sx={ButtonStyle}
                onClick={() =>
                    orderBy !== ORDER_BY_PRICE_ASC &&
                    clickHandler(ORDER_BY_PRICE_ASC)
                }
            >
                Cheapest First
            </Button>
            {/* PRICE DESC*/}
            <Button
                variant={
                    orderBy === ORDER_BY_PRICE_DESC ? "contained" : "outlined"
                }
                color="warning"
                sx={ButtonStyle}
                onClick={() =>
                    orderBy !== ORDER_BY_PRICE_DESC &&
                    clickHandler(ORDER_BY_PRICE_DESC)
                }
            >
                Expensive First
            </Button>
            {/* NAME */}
            <Button
                variant={orderBy === ORDER_BY_NAME ? "contained" : "outlined"}
                color="warning"
                sx={ButtonStyle}
                onClick={() =>
                    orderBy !== ORDER_BY_NAME && clickHandler(ORDER_BY_NAME)
                }
            >
                Name
            </Button>
            {/* STOCK */}
            <Button
                variant={orderBy === ORDER_BY_STOCK ? "contained" : "outlined"}
                color="warning"
                sx={ButtonStyle}
                onClick={() =>
                    orderBy !== ORDER_BY_STOCK && clickHandler(ORDER_BY_STOCK)
                }
            >
                Stock
            </Button>
        </Stack>
    );
};

const trayStyle = {
    width: "100%",
    backgroundColor: "#fafafa",
    boxShadow: "0px 0px 5px 2px #ccc",
    height: "60px",
    position: "fixed",
    zIndex: "996",
    padding: "0 10px",
    userSelect: "none",
};

const ButtonStyle = {
    margin: "auto 8px",
    padding: "5px 10px",
    maxWidth: "180px",
};

export default OrderByTray;
