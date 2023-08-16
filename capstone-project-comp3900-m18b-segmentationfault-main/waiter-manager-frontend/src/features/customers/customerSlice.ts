import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
    GET_CATS,
    GET_MENU_ITEMS,
    GET_ORDERS,
    IMG_URL,
} from "../../service/customerApis";
import {
    ICategory,
    ICustomerState,
    IMenuItem,
    IOrderItem,
    IShoppingCartItem,
} from "./types";

const initialState: ICustomerState = {
    categories: [],
    menuItems: [],
    shoppingCart: [],
    orders: [],
    existingBill: 0,
    detailedItem: null,
    isQueue: false,
};

export const getOrders = createAsyncThunk(
    "customers/getOrders",
    async (customerId: number) => {
        return axios
            .get(GET_ORDERS, {
                params: {
                    customer_id: customerId,
                },
            })
            .then((res) => res.data);
    }
);

export const getCategories = createAsyncThunk(
    "customers/getCategories",
    async () => {
        const rId = localStorage.getItem("rId");
        if (!rId) return;
        return axios
            .get(GET_CATS, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((res) => res.data);
    }
);

export const getMenuItems = createAsyncThunk(
    "customers/getMenuItems",
    async () => {
        const rId = localStorage.getItem("rId");
        if (!rId) return;
        return axios
            .get(GET_MENU_ITEMS, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((res) => res.data);
    }
);

export const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        setIsQueue: (state, action: PayloadAction<boolean>) => {
            state.isQueue = action.payload;
        },
        setCategories: (state, action: PayloadAction<ICategory[]>) => {
            state.categories = action.payload;
        },
        setMenuItems: (state, action: PayloadAction<IMenuItem[]>) => {
            state.menuItems = action.payload;
        },
        addToShoppingCart: (
            state,
            action: PayloadAction<IShoppingCartItem>
        ) => {
            const i = state.shoppingCart.findIndex(
                (item) => item.item.id === action.payload.item.id
            );
            if (i < 0) {
                state.shoppingCart.push(action.payload);
            } else {
                state.shoppingCart[i].quantity += action.payload.quantity;
            }

            localStorage.setItem(
                "shoppingCart",
                JSON.stringify(state.shoppingCart)
            );
        },
        removeFromShoppingCart: (
            state,
            action: PayloadAction<IShoppingCartItem>
        ) => {
            const i = state.shoppingCart.findIndex(
                (item) => item.item.id === action.payload.item.id
            );
            if (i < 0) return;
            state.shoppingCart[i].quantity -= action.payload.quantity;
            if (state.shoppingCart[i].quantity <= 0) {
                state.shoppingCart.splice(i, 1);
            }
            localStorage.setItem(
                "shoppingCart",
                JSON.stringify(state.shoppingCart)
            );
        },
        setShoppingCart: (
            state,
            action: PayloadAction<IShoppingCartItem[]>
        ) => {
            state.shoppingCart = action.payload;
        },
        setDetailedItem: (state, action: PayloadAction<number | null>) => {
            state.detailedItem = action.payload;
        },
        resetState: (state) => {
            state.categories = [];
            state.menuItems = [];
            state.shoppingCart = [];
            state.orders = [];
            state.existingBill = 0;
            state.detailedItem = null;
            state.isQueue = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getCategories.fulfilled, (state, action) => {
            const { code, data } = action.payload;
            if (code != 200) return;
            state.categories = data.sort(
                (a: ICategory, b: ICategory) => a.index - b.index
            );
        });
        builder.addCase(getCategories.rejected, (state) => {
            state.categories = [];
        });
        builder.addCase(getMenuItems.fulfilled, (state, action) => {
            const { code, data } = action.payload;
            if (code != 200) {
                return;
            }
            const menuItems: IMenuItem[] = data;
            state.menuItems = menuItems
                .filter((item) => item.stock > 0)
                .map((item) => {
                    return {
                        ...item,
                        price: Number(item.price),
                        img_url: item.img_url,
                    };
                });
            // Also remove any exceeding items
            const shoppingCart: IShoppingCartItem[] = JSON.parse(
                localStorage.getItem("shoppingCart") || "[]"
            );
            if (!shoppingCart || !shoppingCart.length) return;
            shoppingCart.forEach(
                (cartItem: IShoppingCartItem, index: number) => {
                    const i = state.menuItems.findIndex(
                        (item) => item.id === cartItem.item.id
                    );
                    // No longer available
                    if (i < 0) {
                        // Remove that one from shopping cart
                        shoppingCart.splice(index, 1);
                        return;
                    }
                    // Do find it i.e. have stock
                    const stock = state.menuItems[i].stock;
                    if (cartItem.quantity > stock) {
                        shoppingCart[index].quantity = stock;
                    }
                    // Also update menu item info
                    cartItem.item = state.menuItems[i];
                }
            );
            localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
            state.shoppingCart = shoppingCart;
        });
        builder.addCase(getMenuItems.rejected, (state) => {
            state.menuItems = [];
        });
        builder.addCase(getOrders.fulfilled, (state, action) => {
            const { code, data } = action.payload;
            if (code != 200) return;
            const orders: IOrderItem[] = data["items"];
            state.orders = orders.map((order) => {
                return {
                    ...order,
                    item_price: Number(order.item_price),
                    img_url: order.img_url,
                };
            });
            state.existingBill = Number(data["subtotal"] || 0);
        });
        builder.addCase(getOrders.rejected, (state) => {
            state.orders = [];
            state.existingBill = 0;
        });
    },
});

// Action creators are generated for each case reducer function
export const {
    setCategories,
    setMenuItems,
    addToShoppingCart,
    removeFromShoppingCart,
    setShoppingCart,
    setDetailedItem,
    setIsQueue,
    resetState,
} = counterSlice.actions;

export default counterSlice.reducer;
