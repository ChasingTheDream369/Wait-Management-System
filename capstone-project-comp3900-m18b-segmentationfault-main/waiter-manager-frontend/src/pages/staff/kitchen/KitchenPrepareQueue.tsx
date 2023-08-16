import { Alert, Button, PageHeader, Table } from "antd";
import axios from "axios";
import { Key, useEffect, useState } from "react";
import {
    FINISH_PREPARE,
    GET_PREPARE_QUEUE,
} from "../../../service/customerApis";

interface orderDataType {
    key: number;
    id: number;
    table_name: string;
    item_name: string;
    quantity: number;
}

const showAllPrepareOrders = () => {
    const [finishCount, setFinishCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    const [dataSource, setDataSource] = useState<orderDataType[]>([]);

    // Since Backend data has no key where react needed
    // Manually add key for each row of data
    const fetchPrepareQueue = async () => {
        setLoading(true);
        var orderCount = 0;
        axios
            .get(GET_PREPARE_QUEUE)
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
        fetchPrepareQueue();
    }, []);

    const handleFinsihOrder = (record: any) => {
        // Can only finish the order on FIFO rule
        axios
            .post(FINISH_PREPARE, {
                order_id: record.id,
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    setFetchError(true);
                    setErrorInfo(
                        innerData.message + "will refresh page in 2 seconds"
                    );
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    // Update page DOM
                    const newData = dataSource.filter(
                        (row) => row.key !== record.key
                    );
                    setDataSource(newData);
                    setFinishCount(1 + finishCount);
                }
            });
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
            title: "Finish this order",
            dataIndex: "operation",
            render: (_: any, record: any) =>
                record.key === finishCount ? (
                    <Button onClick={() => handleFinsihOrder(record)}>
                        Finish this order
                    </Button>
                ) : (
                    <Button disabled>Finish this order(disabled)</Button>
                ),
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                backIcon={false}
                title="Preparing Queue"
                subTitle="This page list all customer orders holding for preparing."
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

export default showAllPrepareOrders;
