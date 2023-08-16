import {
    Box,
    Button,
    Divider,
    FormControlLabel,
    InputLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@mui/material";
import Alert from "antd/lib/alert";
import axios from "axios";
import { motion } from "framer-motion";
import JSEncrypt from "jsencrypt";
import { FormEvent, useState } from "react";
import { GrGroup } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { LOGIN_IN, PUBLICKEY } from "../../service/customerApis";
import SelectRestaurant from "./SelectRestaurant";
import { formInputStyles } from "./Styles";

const StaffLogin = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [selected, setSelected] = useState("");
    const [staffPositon, setPosition] = useState("");
    const [loginError, setLoginError] = useState(false);
    const [loginInfo, setLoginInfo] = useState("");

    const handleLogin = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        localStorage.clear();
        // RSA 256 encrypt staff input password
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLICKEY);
        let passwordEncrypted = encrypt.encrypt(password);
        // Login post request

        axios
            .post(LOGIN_IN, {
                r_id: Number(selected),
                name: name,
                password: passwordEncrypted,
                position: staffPositon,
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    setLoginError(true);
                    setLoginInfo(innerData.message);
                } else {
                    localStorage.setItem("staffName", "" + name);
                    localStorage.setItem("staffPositon", staffPositon);
                    localStorage.setItem("rId", selected);
                    if (staffPositon === "kitchen") {
                        localStorage.setItem("prepareQueue", "");
                        navigate("/kitchen");
                    }
                    if (staffPositon === "waiter") {
                        navigate("/waiter");
                    }
                    if (staffPositon === "manager") {
                        navigate("/manager");
                    }
                }
            });
    };

    return (
        <>
            <Box
                sx={{
                    marginLeft: "20px",
                    display: "flex",
                    minWidth: "400px",
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
                        <GrGroup style={{ fontSize: "18px" }} />
                        <br /> Staff Login
                    </Typography>
                    <Divider sx={{ margin: "10px 0 20px 0" }} />

                    <form onSubmit={handleLogin}>
                        {/* Username */}
                        <TextField
                            required
                            id="username"
                            label="Username"
                            variant="outlined"
                            fullWidth
                            sx={formInputStyles}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {/* Password */}
                        <TextField
                            required
                            id="password"
                            label="Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* Select Restaurant */}
                        <SelectRestaurant
                            setSelected={setSelected}
                            selected={selected}
                        />
                        {/* Staff Position Selection*/}
                        <InputLabel
                            sx={{
                                margin: "0px 0 10px 0",
                                display: "block",
                            }}
                            id="test-select-label"
                        >
                            Select Your Identity
                        </InputLabel>
                        <RadioGroup
                            row
                            name="identity"
                            sx={{
                                display: "block",
                                marginBottom: "20px",
                            }}
                            onChange={(event) =>
                                setPosition(
                                    (event.target as HTMLInputElement).value
                                )
                            }
                        >
                            <FormControlLabel
                                value="waiter"
                                control={<Radio required />}
                                label="Waiter"
                            />
                            <FormControlLabel
                                value="kitchen"
                                control={<Radio required />}
                                label="Kitchen Staff"
                            />
                            <FormControlLabel
                                value="manager"
                                control={<Radio required />}
                                label="Manager"
                            />
                        </RadioGroup>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                margin: "0 auto",
                                display: "block",
                                backgroundColor: "#424242",
                                "&:hover": {
                                    backgroundColor: "#525252",
                                },
                            }}
                            type="submit"
                        >
                            Login
                        </Button>
                    </form>
                    {loginError && (
                        <Alert
                            message="Error"
                            description={loginInfo}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setLoginError(false)}
                            // The login Error notification
                        />
                    )}
                </Box>
            </Box>
        </>
    );
};

export default StaffLogin;
