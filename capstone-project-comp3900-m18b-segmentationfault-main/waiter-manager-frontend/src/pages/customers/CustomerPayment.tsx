import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PAYMENT } from "../../service/customerApis";
import { AppDispatch, RootState } from "../../app/store";
import { getOrders, resetState } from "../../features/customers/customerSlice";
import { IOrderItem } from "../../features/customers/types";
import OrderItem from "./components/OrderItem";
import PaymentCanvas from "./components/PaymentCanvas";

var timer: NodeJS.Timeout;
const TIMEOUT = 5;

const CustomerPayment = () => {
    const dispatch = useDispatch<AppDispatch>();
    const customerId = Number(localStorage.getItem("customerId"));
    useEffect(() => {
        dispatch(getOrders(customerId));
    }, []);

    const orders = useSelector((state: RootState) => state.customer.orders);
    const existingBill = useSelector(
        (state: RootState) => state.customer.existingBill
    );

    const customerName = localStorage.getItem("customerName");
    const tableName = localStorage.getItem("tableName");
    const navigate = useNavigate();

    const [openDialog, setOpenDialog] = useState(false);
    const [tick, setTick] = useState(TIMEOUT);

    const handleClose = () => {
        setOpenDialog(false);
        setTick(TIMEOUT);
        clearInterval(timer);
    };

    const handleClickPayment = () => {
        setOpenDialog(true);
        timer = setInterval(() => {
            setTick((tick) => tick - 1);
            if (tick < 0) {
                clearInterval(timer);
            }
        }, 1000);
    };

    return (
        <Box sx={wrapperStyle} zIndex={99}>
            <PaymentCanvas />
            <Card sx={cardStyle}>
                <Typography
                    variant="h4"
                    sx={{
                        color: "#555",
                        textAlign: "center",
                    }}
                >
                    Invoice
                </Typography>
                <Divider sx={{ margin: "15px auto" }} />
                <Stack>
                    <Typography variant="subtitle1" textAlign="center">
                        Customer Name: {customerName}
                    </Typography>
                </Stack>
                <Stack>
                    <Typography variant="subtitle1" textAlign="center">
                        Table Name: {tableName}
                    </Typography>
                </Stack>
                <Divider sx={{ margin: "15px auto" }} />
                <Box
                    sx={{
                        maxHeight: `${window.innerHeight * 0.8 - 200}px`,
                        overflow: "auto",
                        padding: "0 10px",
                    }}
                >
                    <Box
                        sx={{
                            height: "700px",
                        }}
                    >
                        {orders.map((order: IOrderItem, index: number) => (
                            <OrderItem key={"order-" + index} order={order} />
                        ))}
                    </Box>
                </Box>
                <Stack
                    sx={{
                        height: "100px",
                        width: "100%",
                        position: "relative",
                        bottom: "0",
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px -1px 8px 0px",
                        padding: "10px",
                    }}
                    direction="row-reverse"
                >
                    <Typography
                        variant="h6"
                        lineHeight="80px"
                        marginRight="10px"
                    >
                        {`Subtotal: \$${existingBill.toFixed(2)}`}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={payButtonStyle}
                        onClick={handleClickPayment}
                    >
                        I Have Paid
                    </Button>
                </Stack>
            </Card>
            {/* Dialog */}
            <Dialog
                open={openDialog}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>Are you sure you have paid?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Click "Yes" if you have paid, once clicked you will not
                        see this page again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>No</Button>
                    <Button
                        onClick={async () => {
                            localStorage.clear(); //  Ask backend
                            try {
                                const { code } = await axios
                                    .get(PAYMENT, {
                                        params: {
                                            customer_id: customerId,
                                        },
                                    })
                                    .then((res) => res.data);
                                if (code != 200) return;
                            } catch (err) {
                                console.log(err);
                                return;
                            }
                            dispatch(resetState());
                            navigate("/");
                        }}
                        disabled={tick > 0}
                    >
                        {tick > 0 ? `Yes(${tick})` : "Yes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    zIndex: "1",
};

const cardStyle: React.CSSProperties = {
    width: "700px",
    zIndex: "99",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "30px",
    boxShadow: "rgba(188, 188, 188, 0.2) 0px 8px 24px",
    padding: "20px 0 0 0",
};

const payButtonStyle = {
    marginRight: "60px",
    width: "200px",
    backgroundColor: "#ff4436",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "all 0.1s ease-out",
    ":hover": {
        backgroundColor: "#ff6656",
        fontSize: "22px",
    },
};

export default CustomerPayment;
