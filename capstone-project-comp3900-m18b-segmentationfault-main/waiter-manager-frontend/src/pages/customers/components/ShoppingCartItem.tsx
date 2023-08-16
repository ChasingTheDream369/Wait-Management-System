import {
    Box,
    Button,
    Divider,
    ListItem,
    Stack,
    Typography,
} from "@mui/material";
import { IShoppingCartItem } from "../../../features/customers/types";
import { AddButton } from "./AddButton";
import { ImageIcon } from "./ImageIcon";

interface ShoppingCartItemProps {
    removeHandler: (cartItem: IShoppingCartItem) => void;
    addHandler: (cartItem: IShoppingCartItem) => void;
    cartItem: IShoppingCartItem;
}

export const ShoppingCartItem = (props: ShoppingCartItemProps) => {
    const { removeHandler, addHandler, cartItem } = props;
    return (
        <Box
            sx={{
                ":hover": {
                    background: "#f8f8f8",
                },
            }}
        >
            <ListItem>
                <Stack
                    direction="row"
                    sx={{
                        height: "50px",
                        width: "100%",
                    }}
                >
                    {/* Image */}
                    <ImageIcon src={cartItem.item.img_url} />
                    {/* Item Name */}
                    <ItemName name={cartItem.item.name} />

                    {/* Item Total Price */}
                    <ItemPrice
                        price={cartItem.item.price}
                        quantity={cartItem.quantity}
                    />

                    {/* Button Group */}
                    <Stack
                        direction="row"
                        sx={{
                            marginLeft: "auto",
                        }}
                    >
                        <AddButton
                            onClick={() => {
                                if (cartItem.quantity <= 0) return;
                                removeHandler({
                                    item: cartItem.item,
                                    quantity: 1,
                                });
                            }}
                        >
                            -
                        </AddButton>
                        <Typography
                            variant="h6"
                            sx={{
                                lineHeight: "50px",
                                fontWeight: "regular",
                            }}
                        >
                            {cartItem.quantity}
                        </Typography>
                        <AddButton
                            onClick={() => {
                                if (cartItem.item.stock <= cartItem.quantity)
                                    return;
                                addHandler({
                                    item: cartItem.item,
                                    quantity: 1,
                                });
                            }}
                        >
                            +
                        </AddButton>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#f44336",
                                height: "30px",
                                margin: "auto 5px auto 10px",
                                ":hover": {
                                    backgroundColor: "#f47366",
                                },
                            }}
                            onClick={() => removeHandler(cartItem)}
                        >
                            Remove
                        </Button>
                    </Stack>
                </Stack>
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

interface ItemNameProps {
    name: string;
}

export const ItemName = (props: ItemNameProps) => (
    <Typography
        noWrap
        variant="h6"
        sx={{
            lineHeight: "50px",
            width: "250px",
            marginLeft: "5px",
            fontFamily: "delius",
            textOverflow: "ellipsis",
        }}
    >
        {props.name}
    </Typography>
);

interface ItemPriceProps {
    price: number;
    quantity: number;
}

export const ItemPrice = (props: ItemPriceProps) => (
    <Typography
        variant="h6"
        sx={{
            lineHeight: "50px",
            position: "relative",
            marginRight: "auto",
            textAlign: "left",
            width: "150px",
            fontFamily: "roboto",
            fontWeight: "300",
        }}
    >
        {`\$ ${Number(props.price * props.quantity).toFixed(2)}`}
    </Typography>
);
