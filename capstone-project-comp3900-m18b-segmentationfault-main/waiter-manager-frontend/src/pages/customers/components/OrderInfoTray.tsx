import { Box, Button, Fab, List, Stack, Typography } from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../app/store";
import {
    addToShoppingCart,
    getCategories,
    getMenuItems,
    getOrders,
    removeFromShoppingCart,
    setShoppingCart,
} from "../../../features/customers/customerSlice";
import {
    EOrderStatus,
    IOrderItem,
    IShoppingCartItem,
} from "../../../features/customers/types";
import { POST_ORDERS } from "../../../service/customerApis";
import OrderItem from "./OrderItem";
import { ShoppingCartItem } from "./ShoppingCartItem";

interface IOrderInfoTrayProps {
    shoppingCart: IShoppingCartItem[];
}

var timer: NodeJS.Timer;

export const OrderInfoTray = (props: IOrderInfoTrayProps) => {
    const [expanded, setExpanded] = useState(false);
    const { shoppingCart } = props;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const customerId = Number(localStorage.getItem("customerId") || NaN);

    useEffect(() => {
        dispatch(getOrders(customerId));
    }, []);

    const orders = useSelector((state: RootState) => state.customer.orders);
    const existingBill = useSelector(
        (state: RootState) => state.customer.existingBill
    );

    const getNewBill = () => {
        let total = existingBill || 0;
        shoppingCart.forEach((cartItem) => {
            total += cartItem.item.price * cartItem.quantity;
        });
        return total.toFixed(2);
    };

    const removeHandler = (cartItem: IShoppingCartItem) => {
        dispatch(removeFromShoppingCart(cartItem));
    };

    const addHandler = (cartItem: IShoppingCartItem) => {
        dispatch(addToShoppingCart(cartItem));
    };

    const bill = Number(getNewBill());

    const handleClickShoppingCart = () => {
        setExpanded(!expanded);
    };

    const handleClickOrderNow = () => {
        if (isNaN(customerId)) return;
        const payload = {
            customer_id: customerId,
            items: shoppingCart.map((cartItem) => ({
                id: cartItem.item.id,
                price: cartItem.item.price.toFixed(2),
                quantity: cartItem.quantity,
            })),
        };
        axios.post(POST_ORDERS, payload).then((res) => {
            const { code } = res.data;
            if (code == 200) {
                // clear shopping cart
                localStorage.setItem("shoppingCart", "[]");
                dispatch(setShoppingCart([]));
            }
            // Force refresh
            refreshInfo();
        });
    };

    const refreshInfo = () => {
        dispatch(getCategories());
        dispatch(getMenuItems());
        dispatch(getOrders(customerId));
    };

    const handleClickPayNow = async () => {
        // Redirect
        navigate("/customers/payment");
    };

    useEffect(() => {
        if (expanded && shoppingCart.length + orders.length === 0)
            setExpanded(false);
    }, [shoppingCart]);

    useEffect(() => {
        timer = setInterval(refreshInfo, 5000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <>
            <Mask
                expanded={expanded}
                clickHandler={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                }}
            />
            <Box
                sx={trayWrapperStyle(expanded)}
                component={motion.div}
                initial={{ x: 400, skewX: "-15deg" }}
                animate={{ x: 13, skewX: expanded ? 0 : "-15deg" }}
                transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 15,
                }}
            >
                {expanded && (
                    <List sx={shoppingCartListStyle(expanded)}>
                        {shoppingCart.length > 0 &&
                            shoppingCart.map(
                                (
                                    cartItem: IShoppingCartItem,
                                    index: number
                                ) => (
                                    <ShoppingCartItem
                                        key={"shopItem-" + index}
                                        removeHandler={removeHandler}
                                        addHandler={addHandler}
                                        cartItem={cartItem}
                                    />
                                )
                            )}
                        {orders.length > 0 &&
                            orders.map((order: IOrderItem, index: number) => (
                                <OrderItem
                                    key={"orderItem-" + index}
                                    order={order}
                                />
                            ))}
                    </List>
                )}
                <Stack
                    direction="row"
                    justifyContent="end"
                    sx={bottomTrayStyle}
                >
                    {/* Shopping Cart Icon */}
                    <ShoppingCartIcon
                        disabled={shoppingCart.length + orders.length === 0}
                        expanded={expanded}
                        clickHandler={handleClickShoppingCart}
                    />
                    <Typography
                        variant="h6"
                        sx={totalBillStyle}
                    >{`Subtotal: \$${bill.toFixed(2)}`}</Typography>
                    <Button
                        variant="contained"
                        disabled={
                            orders.filter(
                                (o) => o.status != EOrderStatus.COMPLETED
                            ).length > 0
                        }
                        sx={payButtonStyle("#f44336", "#f47356", "#fff")}
                        onClick={handleClickPayNow}
                    >
                        PAY NOW
                    </Button>
                    <Button
                        disabled={shoppingCart.length === 0}
                        variant="contained"
                        sx={payButtonStyle("#c6ff00", "#ffff66", "#333")}
                        onClick={handleClickOrderNow}
                    >
                        ORDER NOW
                    </Button>
                </Stack>
            </Box>
        </>
    );
};

interface MaskProps {
    expanded: boolean;
    clickHandler: React.MouseEventHandler<HTMLElement>;
}

const Mask = (props: MaskProps) => {
    const { expanded, clickHandler } = props;
    return (
        <div
            style={{
                position: "absolute",
                top: expanded ? 0 : "-100px",
                left: 0,
                bottom: 0,
                right: 0,
                width: expanded ? "100%" : 0,
                height: expanded ? "100%" : 0,
                zIndex: "998",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
            }}
            onClick={clickHandler}
        ></div>
    );
};

const WIDTH = 650;

interface ShoppingCartIconProps {
    disabled: boolean;
    expanded: boolean;
    clickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

const ShoppingCartIcon = (props: ShoppingCartIconProps) => (
    <Fab
        disabled={props.disabled}
        sx={{
            ...ShoppingCartIconStyle,
            transform: props.expanded ? "" : "skewX(15deg)",
        }}
        onClick={props.clickHandler}
    >
        <AiOutlineShoppingCart />
    </Fab>
);

const payButtonStyle = (
    bgColor: string,
    hoverColor: string,
    fontColor: string
) => ({
    height: "100%",
    width: "180px",
    background: bgColor,
    fontFamily: "Anton",
    borderRadius: 0,
    // fontStyle: "italic",
    color: fontColor,
    fontSize: "28px",
    transition: "all 0.2s ease-out",
    ":hover": {
        backgroundColor: hoverColor,
        width: "200px",
    },
});

const shoppingCartListStyle = (expanded: boolean) => ({
    maxHeight: "400px",
    backgroundColor: "#fff",
    borderRadius: expanded ? "30px 0 0 0" : "0",
    padding: "10px",
    overflow: "auto",
});

const trayWrapperStyle = (expanded: boolean) => ({
    position: "fixed",
    bottom: 0,
    right: 0,
    zIndex: "999",
    boxShadow: " rgba(0, 0, 0, 0.3) 0px 3px 8px",
    transform: expanded ? "" : "skewX(-15deg) translateX(15px)",
    width: `${expanded ? WIDTH * 1.2 : WIDTH}px`,
    borderRadius: expanded ? "30px 0 0 0" : "0",
    backgroundColor: "#fff",
});

const bottomTrayStyle = {
    height: "100px",
    backgroundColor: "#fff",
    zIndex: "999",
    boxShadow: "0 0 3px 1px rgba(0, 0, 0, 0.1) ",
};

const totalBillStyle = {
    lineHeight: "100px",
    marginRight: "auto",
    fontWeight: "regular",
    fontFamily: "roboto",
    fontSize: "19px",
};

const ShoppingCartIconStyle = {
    transform: "",
    boxShadow: "0 0 3px 1px rgba(0, 0, 0, 0.1) ",
    backgroundColor: "#c6ff00",
    marginRight: "auto",
    left: "12px",
    top: "10px",
    width: "80px",
    height: "80px",
    fontSize: "40px",
    transition: "all 0.2s ease-out",
    color: "#333",
    zIndex: "99999",
    ":hover": {
        backgroundColor: "#ddff00",
        fontSize: "60px",
        width: "90px",
        height: "90px",
        left: "5px",
        top: "5px",
    },
};
