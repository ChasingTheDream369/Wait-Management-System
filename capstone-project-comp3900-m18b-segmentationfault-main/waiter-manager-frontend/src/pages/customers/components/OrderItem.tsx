import {
    Box,
    Chip,
    createTheme,
    Divider,
    ListItem,
    Stack,
    ThemeProvider,
} from "@mui/material";
import { EOrderStatus, IOrderItem } from "../../../features/customers/types";
import { ImageIcon } from "./ImageIcon";
import { ItemName, ItemPrice } from "./ShoppingCartItem";

interface OrderItemProps {
    order: IOrderItem;
}
const theme = createTheme({
    palette: {
        success: {
            main: "#689f38",
        },
    },
});

const OrderItem = (props: OrderItemProps) => {
    const { order } = props;
    return (
        <Box
            sx={{
                ":hover": {
                    background: "#f8f8f8",
                },
            }}
        >
            <ListItem>
                <ThemeProvider theme={theme}>
                    <Stack
                        direction="row"
                        sx={{
                            height: "50px",
                            width: "100%",
                        }}
                    >
                        {/* Image */}
                        <ImageIcon src={order.img_url ?? ''} />
                        {/* Item Name */}
                        <ItemName
                            name={`${order.item_name} ${
                                order.quantity > 1 ? "x " + order.quantity : ""
                            }`}
                        />

                        {/* Item Total Price */}
                        <ItemPrice
                            price={order.item_price}
                            quantity={order.quantity}
                        />

                        {/* Status */}
                        {StatusBar(order.status)}
                    </Stack>
                </ThemeProvider>
            </ListItem>
            <Divider
                sx={{
                    backgroundColor: "#f0f0f0",
                    margin: "0 5px",
                }}
            />
        </Box>
    );
};

const StatusBarStyle = {
    margin: "auto 0",
    userSelect: "none",
};

const StatusBar = (status: EOrderStatus) => {
    switch (status) {
        case EOrderStatus.WAITING_FOR_PREPARING:
            return (
                <Chip
                    sx={StatusBarStyle}
                    label="Wait for preparing"
                    color="info"
                    variant="filled"
                />
            );
        case EOrderStatus.PREPARING:
            return (
                <Chip
                    sx={StatusBarStyle}
                    label="In Preparing"
                    color="primary"
                    variant="filled"
                />
            );
        case EOrderStatus.ON_ITS_WAY:
            return (
                <Chip
                    sx={StatusBarStyle}
                    label="On its way"
                    color="warning"
                    variant="filled"
                />
            );
        case EOrderStatus.COMPLETED:
            return (
                <Chip
                    sx={StatusBarStyle}
                    label="Completed"
                    color="success"
                    variant="filled"
                />
            );
        default:
            return <></>;
    }
};

export default OrderItem;
