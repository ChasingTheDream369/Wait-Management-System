import { Alert, Button, PageHeader, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GET_ORDERS_WAITER, UPDATE_ORDER } from "../../../service/customerApis";

interface orderDataType {
    key: number;
    id: number;
    table_name: string;
    item_name: string;
    quantity: number;
}

var timer: NodeJS.Timer;
const REQUEST_TIMEOUT = 4 * 1000;

const WaiterCustomerOrders = () => {

    const [dataSource, setDataSource] = useState<orderDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    // Since Backend data has no key where react needed
    // Manually add key for each row of data
    const setAndFetchOrders = async () => {
        setLoading(true);
        var orderCount = 0;
        const rId = localStorage.getItem("rId");
        axios
            .get(GET_ORDERS_WAITER, {
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
                    const addKey = innerData.data.orders.map((order: any) => {
                        order.key = orderCount;
                        orderCount += 1;
                        return order;
                    });
                    setDataSource(addKey);
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

    // Push data to backend to update order status.
    const handleDeliveryOrder = (record: any) => {
        axios.post(UPDATE_ORDER, {
            order_id: record.id,
        });
        // Update page DOM
        const newData = dataSource.filter((row) => row.key !== record.key);
        setDataSource(newData);
    };

    const createSortTab = () => {
        const result: { text: string; value: string }[] = [];
        dataSource.map((data: orderDataType) => {
            let tmp = {
                text: "",
                value: "",
            };
            tmp.text = data.table_name;
            tmp.value = data.table_name;
            result.push(tmp);
        });
        return result.filter(
            (v, i, a) =>
                a.findIndex(
                    (v2) => JSON.stringify(v2) === JSON.stringify(v)
                ) === i
        );
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
            filters: createSortTab(),
        },
        {
            title: "Serving this order",
            dataIndex: "operation",
            render: (_: any, record: { id: React.Key }) => (
                <Button onClick={() => handleDeliveryOrder(record)}>
                    Take for serving
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
                subTitle="This page list all customer orders waiting for serving."
                extra={[]}
            ></PageHeader>
            {fetchError && (
                <Alert
                    message="Error"
                    description={errorInfo}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setFetchError(false)}
                    // The login Error notification
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

export default WaiterCustomerOrders;
