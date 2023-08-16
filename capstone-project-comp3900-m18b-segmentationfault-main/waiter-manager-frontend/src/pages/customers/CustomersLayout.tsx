import { Box, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { getCategories } from "../../features/customers/customerSlice";
import { CategoriesList } from "./components/CategoriesList";
import MainBar from "./components/MainBar";
import OrderByTray, { ORDER_BY_DEFAULT } from "./components/OrderByTray";
import { OrderInfoTray } from "./components/OrderInfoTray";
import { CATEGORIES_BOX_STYLE } from "./styles";

const CustomersLayout = () => {
    const cats = useSelector((state: RootState) => state.customer.categories);
    const dispatch = useDispatch<AppDispatch>();
    const { cat_id } = useParams();
    const location = useLocation();

    // DidMount
    useEffect(() => {
        dispatch(getCategories());
        // Figure out which category is highlighted
        setCatId(location.pathname.endsWith("/main") ? -1 : Number(cat_id));
    }, []);

    const navigate = useNavigate();
    const tableId: number = Number(localStorage.getItem("tableId"));
    const tableName: string =
        (localStorage.getItem("tableName") as string) || "";
    const [catId, setCatId] = useState(-1);
    const [orderBy, setOrderBy] = useState(
        localStorage.getItem("orderBy") ?? ORDER_BY_DEFAULT
    );

    const handleClickCategory = (newCatId: number) => {
        if (catId === newCatId) return;
        setCatId(newCatId);
        localStorage.setItem("catId", JSON.stringify(newCatId));
        navigate("/customers/categories/" + newCatId);
    };

    const handleClickMain = () => {
        setCatId(-1);
        navigate("/customers/main");
    };

    const updateOrderBy = (o: string) => {
        setOrderBy(o);
        localStorage.setItem("orderBy", o);
    };

    const shoppingCart = useSelector(
        (state: RootState) => state.customer.shoppingCart
    );

    return (
        <>
            <Box
                sx={{
                    height: "100%",
                }}
            >
                <MainBar tableName={tableName} />
                <Stack
                    sx={{
                        height: `calc(100% - 64px)`,
                        width: "100%",
                    }}
                >
                    <Box
                        sx={CATEGORIES_BOX_STYLE}
                        component={motion.div}
                        initial={{ x: -500 }}
                        animate={{ x: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                        }}
                    >
                        <CategoriesList
                            cats={cats}
                            catId={catId}
                            handleClickCategory={handleClickCategory}
                            handleClickMain={handleClickMain} 
                            selectedKey={catId}
                        />
                    </Box>
                    <Box sx={pageContainerStyle}>
                        <Box
                            sx={{
                                height: "100%",
                                overflow: "auto",
                                zIndex: "-1",
                                backgroundColor: "#fff",
                            }}
                        >
                            {catId > 0 && (
                                <OrderByTray
                                    orderBy={orderBy}
                                    clickHandler={updateOrderBy}
                                />
                            )}
                            <Outlet context={{ orderBy }} />
                        </Box>
                        <OrderInfoTray shoppingCart={shoppingCart} />
                    </Box>
                </Stack>
            </Box>
        </>
    );
};

const pageContainerStyle = {
    position: "absolute",
    left: "18%",
    top: "64px",
    bottom: "0",
    width: "82%",
    height: "calc(100%  - 64px)",
};

export default CustomersLayout;
