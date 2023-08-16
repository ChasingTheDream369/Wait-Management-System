import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import axios from "axios";
import { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SiAirtable } from "react-icons/si";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../app/store";
import { setIsQueue } from "../../features/customers/customerSlice";
import { ETableStatus, ITable } from "../../features/customers/types";
import {
    GET_QUEUE,
    GET_TABLES,
    LEAVE_QUEUE,
    POST_CHECKIN,
    POST_ENQUEUE,
} from "../../service/customerApis";
import { formInputStyles } from "./Styles";

var timer: NodeJS.Timer;
const TIME_INTERVAL = 5 * 1000;

const CustomerTables = () => {
    const [tables, setTables] = useState([]);
    const [tableId, setTableId] = useState("");
    const [tableName, setTableName] = useState("");
    const [error, setError] = useState(!tableId);
    const [isQueued, setIsQueued] = useState(
        Boolean(localStorage.getItem("isQueued") ?? false)
    );
    const [queueNum, setQueueNum] = useState(-1);
    const [queueId, setQueueId] = useState(
        Number(localStorage.getItem("qId") || NaN)
    );
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const handleSelectTable = (e: SelectChangeEvent<string>) => {
        setTableId(e.target.value);
        setError(e.target.value == "");
    };

    const clearSelection = () => {
        setTableId("");
        setTableName("");
    };

    useEffect(() => {
        if (isQueued) {
            checkQuePos();
            timer = setInterval(checkQuePos, TIME_INTERVAL);
        }
        return () => {
            timer && clearInterval(timer);
        };
    }, []);

    const requestEnqueue = async () => {
        // TODO: REQUEST ENQUEUE
        const name: string = localStorage.getItem("customerName") ?? "";
        const people: number = Number(localStorage.getItem("people"));
        const rId: number = Number(localStorage.getItem("rId"));

        clearSelection();

        const { code, data: que } = await axios
            .post(POST_ENQUEUE, { name, total_customer: people, r_id: rId })
            .then((res) => res.data);
        // !ERROR HANDLE?
        if (code != 200 || que.id == null || que.position == null) return;
        setIsQueued(true);
        // Set q_id to localStorage
        localStorage.setItem("isQueued", JSON.stringify(true));
        localStorage.setItem("qId", JSON.stringify(que.id));
        setQueueNum(que.position);
        setQueueId(que.id);
        // Short polling
        checkQuePos();
        timer = setInterval(checkQuePos, TIME_INTERVAL);
    };

    const checkQuePos = async () => {
        const queueId = localStorage.getItem("qId");
        if (!queueId) return;
        axios.get(GET_QUEUE(Number(queueId))).then((res) => {
            const { code, data: que } = res.data;
            if (code != 200) return;
            if (que.position != null) {
                // * In que
                setQueueNum(que.position);
            } else if (que.table_id != null) {
                // * Dequed
                localStorage.clear();
                localStorage.setItem("customerId", "" + que["customer_id"]);
                localStorage.setItem("customerName", "" + que["customer_name"]);
                localStorage.setItem("tableId", "" + que["table_id"]);
                localStorage.setItem("tableName", "" + que["table_name"]);
                localStorage.setItem("rId", "" + que["r_id"]);
                dispatch(setIsQueue(false));
                navigate("/customers/main");
            }
        });
    };

    const handleLeaveQueue = async () => {
        clearInterval(timer);
        // * Tell server
        axios.delete(LEAVE_QUEUE(queueId)).then((res) => {
            const { code } = res.data;
            if (code != 200) return;
            localStorage.clear();
            setIsQueued(false);
            navigate("/");
        });

        localStorage.setItem("isQueue", JSON.stringify(false));
        dispatch(setIsQueue(false));
    };

    const fetchTables = async () => {
        const rId = localStorage.getItem("rId");
        if (!rId) return;
        axios
            .get(GET_TABLES, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((res) => {
                const { code, data } = res.data;
                if (code != 200) return;
                setTables(data.filter((t: ITable) => t.capacity >= people));
            });
    };
    const people = Number(localStorage.getItem("people"));

    const handleCheckin = (e:FormEvent) => {
        e.preventDefault();
        if (tableId == "") {
            setError(true);
            return;
        }
        const customerName = localStorage.getItem("customerName");
        const rId = localStorage.getItem("rId");
        if (!customerName || !rId || !people) return;
        axios
            .post(POST_CHECKIN, {
                name: customerName,
                r_id: Number(rId),
                num_peop: Number(people),
                t_id: Number(tableId),
            })
            .then((res) => {
                const { code, data } = res.data;
                if (code != 200) return;
                localStorage.clear();
                localStorage.setItem("customerId", "" + data.id);
                localStorage.setItem("customerName", "" + data.name);
                localStorage.setItem("tableId", "" + data.table_id);
                localStorage.setItem("tableName", data.table_name);
                localStorage.setItem("rId", "" + data.r_id);
                dispatch(setIsQueue(false));
                navigate("/customers/main");
            });
    };

    useEffect(() => {
        fetchTables();
    }, []);

    return (
        <Box minWidth="300px" margin="20px">
            <Typography variant="h6" color="#444" align="center">
                <SiAirtable />
                <br /> Select a Table
            </Typography>
            <Divider sx={{ margin: "10px 0 20px 0" }} />
            <InputLabel
                sx={{
                    margin: "20px auto 0 auto",
                    display: "block",
                }}
                id="table-select-label"
            >
                Choosing from:
            </InputLabel>

            <form onSubmit={handleCheckin}>
                <FormControl error={error} fullWidth>
                    <Select
                        required
                        id="table"
                        onChange={handleSelectTable}
                        fullWidth
                        sx={formInputStyles}
                        // ref={selectorRef}
                        value={tableId}
                        disabled={isQueued}
                    >
                        {tables.map((table: ITable, index: number) => (
                            <MenuItem
                                key={"table-" + index}
                                value={table.id}
                                onClick={() => {
                                    setTableName(table.name);
                                }}
                                disabled={table.status !== ETableStatus.EMPTY}
                            >
                                <span>{table.name}</span>
                                <span
                                    style={{
                                        marginLeft: "150px",
                                    }}
                                >
                                    {table.capacity} people
                                </span>
                            </MenuItem>
                        ))}
                    </Select>

                    {error && (
                        <FormHelperText>
                            Please select a table or join queue!
                        </FormHelperText>
                    )}
                </FormControl>

                <Button
                    variant="contained"
                    disabled={isQueued || tableId == ""}
                    type="submit"
                    sx={{
                        ...buttonStyle,
                        backgroundColor: "#adcc19",
                        "&:hover": {
                            backgroundColor: "#bddc29",
                            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                        },
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px 1px 5px 0px",
                    }}
                >
                    Checkin
                </Button>
            </form>

            <InputLabel
                sx={{
                    margin: "20px auto 0 auto",
                    display: "block",
                }}
                id="table-select-label"
            >
                Queue:
            </InputLabel>
            {!isQueued ? (
                <>
                    <Button
                        variant="contained"
                        sx={{
                            ...buttonStyle,
                            backgroundColor: "#424242",
                            "&:hover": {
                                backgroundColor: "#525252",
                            },
                        }}
                        onClick={async () => {
                            await requestEnqueue();
                            localStorage.setItem(
                                "isQueue",
                                JSON.stringify(true)
                            );
                            dispatch(setIsQueue(true));
                        }}
                        disabled={
                            tableId != "" ||
                            tables.filter(
                                (t: ITable) => t.status != ETableStatus.EMPTY
                            ).length === 0
                        }
                    >
                        Queue Me
                    </Button>
                </>
            ) : (
                <>
                    <Typography
                        variant="subtitle1"
                        margin="25px auto 0 auto"
                        textAlign="center"
                    >
                        Queue Position: {queueNum}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            ...buttonStyle,
                            backgroundColor: "#424242",
                            "&:hover": {
                                backgroundColor: "#525252",
                            },
                        }}
                        onClick={handleLeaveQueue}
                    >
                        Leave Queue
                    </Button>
                </>
            )}
        </Box>
    );
};

const buttonStyle = {
    margin: "25px auto",
    display: "block",
    padding: "5px",
    width: "80%",
    height: "50px",
};

export default CustomerTables;
