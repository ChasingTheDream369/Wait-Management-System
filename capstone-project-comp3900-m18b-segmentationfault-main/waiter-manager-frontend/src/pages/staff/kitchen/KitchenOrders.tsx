import { Alert, Button, PageHeader, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GET_ORDERS_KITCHEN,
    UPDATE_ORDER,
} from "../../../service/customerApis";

interface orderDataType {
    key: number;
    id: number;
    table_name: string;
    item_name: string;
    quantity: number;
}

var timer: NodeJS.Timer;
const REQUEST_TIMEOUT = 4 * 1000;

const KitchenCustomerOrders = () => {
    const navigate = useNavigate();

    const [dataSource, setDataSource] = useState<orderDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    // Since Backend data has no key where react needed
    // Manually add key for each row of data
    const setAndFetchOrders = async () => {
        setLoading(true);
        const rId = localStorage.getItem("rId");
        axios
            .get(GET_ORDERS_KITCHEN, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    setFetchError(true);
                    setErrorInfo(innerData.message);
                } else {
                    setDataSource(
                        innerData.data.orders.map((order: any, i: number) => ({
                            ...order,
                            key: `order-${i}`,
                        }))
                    );
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        setAndFetchOrders();
        timer = setInterval(setAndFetchOrders, REQUEST_TIMEOUT);
        return () => clearInterval(timer);
    }, []);

    // Delete(Take order) operation
    // push data to backend to update order status
    const handleTakeOrder = async (key: React.Key) => {
        // Get orders that are already chosen (if any)
        // Add new chosen order to localStorage
        const selectedOrder = dataSource[0];

        const { code, message } = await axios
            .post(UPDATE_ORDER, {
                order_id: selectedOrder.id,
            })
            .then((r) => r.data);

        if (code !== 200) {
            setFetchError(true);
            setErrorInfo(message);
        }

        setAndFetchOrders();
    };

    const columns = [
        {
            title: "ItemName",
            dataIndex: "item_name",
            width: "30%",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            width: "25%",
        },
        {
            title: "tableName",
            dataIndex: "table_name",
            width: "25%",
        },
        {
            title: "Prepare this order",
            dataIndex: "operation",
            render: (_: any, record: { key: React.Key }) => (
                <Button
                    onClick={() => handleTakeOrder(record.key)}
                    disabled={record.key !== "order-0"}
                >
                    Take for preparing
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                backIcon={false}
                title="Customer Orders"
                subTitle="This page list all customer orders waiting for prepare."
            ></PageHeader>
            {fetchError && (
                <Alert
                    message="Error"
                    description={errorInfo}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setFetchError(false)}
                    // Error notification
                />
            )}
            <Table
                rowClassName={() => "singleOrder"}
                bordered
                dataSource={dataSource}
                columns={columns}
                loading={loading}
            />
        </div>
    );
};

export default KitchenCustomerOrders;
