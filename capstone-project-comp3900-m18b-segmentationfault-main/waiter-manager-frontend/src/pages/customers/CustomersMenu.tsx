import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import {
    addToShoppingCart,
    getMenuItems,
    removeFromShoppingCart,
} from "../../features/customers/customerSlice";
import { IMenuItem } from "../../features/customers/types";
import useWindowSize from "../../util/useWindowResize";
import ItemDetail from "./components/ItemDetail";
import MenuItemCard from "./components/MenuItemCard";
import {
    ORDER_BY_DEFAULT,
    ORDER_BY_NAME,
    ORDER_BY_PRICE_ASC,
    ORDER_BY_PRICE_DESC,
    ORDER_BY_STOCK,
} from "./components/OrderByTray";

type ContextType = { orderBy: string | undefined };

const CustomersMenu = () => {
    // Order by
    const { orderBy } =
        useOutletContext<ContextType>() ?? localStorage.getItem("orderBy");

    // Reponsive Layout
    const { width } = useWindowSize();

    const shoppingCart = useSelector(
        (state: RootState) => state.customer.shoppingCart
    );

    const handleAddItem = (itemId: number) => {
        const index = menuItems.findIndex((item) => item.id === itemId);
        if (index < 0) return;
        dispatch(addToShoppingCart({ item: menuItems[index], quantity: 1 }));
    };

    const handleRemoveItem = (itemId: number) => {
        const index = menuItems.findIndex((item) => item.id === itemId);
        if (index < 0) return;
        dispatch(
            removeFromShoppingCart({ item: menuItems[index], quantity: 1 })
        );
    };

    const menuItems = useSelector(
        (state: RootState) => state.customer.menuItems
    );

    const dispatch = useDispatch<AppDispatch>();

    const { cat_id } = useParams();
    const [catId, setCatId] = useState(Number(cat_id));

    useEffect(() => {
        dispatch(getMenuItems());
    }, []);

    const CARDS_PER_ROW = Math.floor((width * 0.85) / 320);

    return (
        <Box sx={{ height: "100%", marginTop: "50px" }}>
            <ItemDetail />
            <Grid
                container
                spacing={2}
                sx={{
                    padding: "25px 25px 125px 25px",
                    marin: "0 auto",
                }}
            >
                {menuItems
                    .filter((item) => item.cat_id === Number(cat_id))
                    .sort((a, b) => {
                        switch (orderBy) {
                            case ORDER_BY_PRICE_ASC:
                                return a.price - b.price;
                            case ORDER_BY_PRICE_DESC:
                                return b.price - a.price;
                            case ORDER_BY_NAME:
                                return a.name.localeCompare(b.name);
                            case ORDER_BY_STOCK:
                                return b.stock - a.stock;
                            case ORDER_BY_DEFAULT:
                                return a.index - b.index;
                            default:
                                return 0;
                        }
                    })
                    .map((item: IMenuItem, index: number) => (
                        <Grid
                            item
                            xs={12 / CARDS_PER_ROW}
                            key={"menuItem-" + index}
                        >
                            <MenuItemCard
                                menuItem={item}
                                quantity={
                                    shoppingCart.find(
                                        (t) => t.item.id === item.id
                                    )?.quantity ?? 0
                                }
                                addHandler={handleAddItem}
                                removeHandler={handleRemoveItem}
                            />
                        </Grid>
                    ))}
            </Grid>
        </Box>
    );
};

export default CustomersMenu;
