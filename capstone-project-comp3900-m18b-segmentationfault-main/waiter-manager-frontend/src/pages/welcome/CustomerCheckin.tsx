import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MdOutlineFastfood } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../app/store";
import { ITable } from "../../features/customers/types";
import SelectRestaurant from "./SelectRestaurant";
import { formInputStyles } from "./Styles";

const CustomerCheckin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const selectorRef = useRef();

    const [tables, setTables] = useState(new Array<ITable>());
    // Form input
    const [name, setName] = useState("");
    const [people, setPeople] = useState(0);
    const [rId, setRid] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        localStorage.clear();
        localStorage.setItem("customerName", name);
        if (rId != "") {
            localStorage.setItem("rId", "" + rId);
            localStorage.setItem("people", "" + people);
            navigate("/welcome/tables");
        }
    };

    useEffect(() => {
        localStorage.clear();
    }, []);

    return (
        <>
            <Box
                sx={{
                    marginLeft: "20px",
                    display: "flex",
                }}
                component={motion.div}
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 0, opacity: 100 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                }}
            >
                <Divider orientation="vertical"></Divider>
                <Box
                    sx={{
                        minWidth: "300px",
                        margin: "20px",
                    }}
                >
                    <Typography variant="h6" color="#444" align="center">
                        <MdOutlineFastfood />
                        <br /> Customer Check-in
                    </Typography>
                    <Divider sx={{ margin: "10px 0 20px 0" }} />
                    <form onSubmit={handleSubmit}>
                        {/* Customer Name Input */}
                        <TextField
                            required
                            id="name"
                            label="Enter your name"
                            variant="outlined"
                            fullWidth
                            sx={formInputStyles}
                            inputProps={{ maxLength: 30 }}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {/* Customer Amount */}
                        <TextField
                            required
                            id="amount"
                            label="How many people?"
                            variant="outlined"
                            type="number"
                            fullWidth
                            onChange={(e) => setPeople(Number(e.target.value))}
                            InputProps={{
                                inputProps: {
                                    min: 1,
                                    max: 12,
                                },
                            }}
                            sx={formInputStyles}
                        />
                        {/* Select Restaurant */}
                        <SelectRestaurant setSelected={setRid} selected={rId} />
                        {/* Submission button*/}
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                margin: "0 auto",
                                display: "block",
                                backgroundColor: "#adcc19",
                                "&:hover": {
                                    backgroundColor: "#bddc29",
                                    boxShadow:
                                        "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                                },
                                boxShadow:
                                    "rgba(99, 99, 99, 0.2) 0px 1px 5px 0px",
                            }}
                            type="submit"
                        >
                            Check in
                        </Button>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default CustomerCheckin;
