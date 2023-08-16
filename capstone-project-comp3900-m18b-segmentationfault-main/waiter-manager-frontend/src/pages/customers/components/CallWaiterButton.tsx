import { Fab, Stack } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { AiFillBell } from "react-icons/ai";
import {
    GET_ASSIST_STATUS,
    REQUEST_ASSIST,
} from "../../../service/customerApis";

var timer: NodeJS.Timer;

export function CallWaiterButton() {
    const checkAssistStatus = async () => {
        const { code, data } = await axios
            .get(GET_ASSIST_STATUS, {
                params: {
                    t_id: Number(localStorage.getItem("tableId")),
                },
            })
            .then((res) => res.data);
        if (code != 200) return;

        setIsAssist(data.needAssist);
        localStorage.setItem("isAssist", JSON.stringify(data.needAssist));
        if (!data.needAssist) {
            clearInterval(timer);
        }
    };
    const requestAssist = async () => {
        const { code } = await axios
            .post(REQUEST_ASSIST, {
                t_id: Number(localStorage.getItem("tableId")),
            })
            .then((r) => r.data);
        if (code != 200) return;
        setIsAssist(true);
        localStorage.setItem("isAssist", JSON.stringify(true));
        await checkAssistStatus();
        clearInterval(timer);
        timer = setInterval(checkAssistStatus, 3000);
    };

    useEffect(() => {
        checkAssistStatus().then(() => {
            const assist = !!localStorage.getItem("isAssist");
            if (assist) {
                clearInterval(timer);
                timer = setInterval(checkAssistStatus, 3000);
            } else {
                clearInterval(timer);
            }
        });

        return () => {
            clearInterval(timer);
        };
    }, []);

    const [isAssist, setIsAssist] = useState(false);

    return (
        <Stack direction="row">
            <p
                style={{
                    display: "inline-block",
                    margin: "0 15px 0 0",
                    marginBottom: "0",
                    lineHeight: "42px",
                    fontSize: "20px",
                }}
            >
                {isAssist ? "Waiter Coming: " : "Call the Waiter:"}
            </p>
            <Fab
                sx={callButtonStyle}
                onClick={requestAssist}
                disabled={isAssist}
            >
                <AiFillBell color="#333" />
            </Fab>
        </Stack>
    );
}

const callButtonStyle = {
    width: "42px",
    height: "42px",
    margin: "auto 0",
    backgroundColor: "#c6ff00",
    fontSize: "24px",
    transition: "all 0.3s ease-out",
    ":hover": {
        width: "50px",
        height: "50px",
        backgroundColor: "#ffff66",
        fontSize: "32px",
        transform: "rotateZ(360deg)",
    },
};
