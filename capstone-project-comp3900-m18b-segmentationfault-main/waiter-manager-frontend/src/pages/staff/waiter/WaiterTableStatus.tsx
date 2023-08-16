import { Alert, Button, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { GET_TABLES_WAITER, UPDATE_TABLE } from "../../../service/customerApis";

interface tableStatusType {
    key: number;
    id: number;
    name: string;
    need_assist: boolean;
    status: number;
}

var timer: NodeJS.Timer;

const WaiterTableStatus = () => {
    
    const [dataSource, setDataSource] = useState<tableStatusType[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    // Since Backend data has no key where react needed
    // Manually add key for each row of data
    const setAndFetchTables = async () => {
        setLoading(true);
        var tableCount = 0;
        const rId = localStorage.getItem("rId");
        axios
            .get(GET_TABLES_WAITER, {
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
                    const addKey = innerData.data.map((table: any) => {
                        if (table.need_assist) {
                            table.operation = "Assist Customer";
                            table.need_assist = "True";
                        } else {
                            table.need_assist = "False";
                        }
                        if (table.status == 2) {
                            table.operation = "Clean Table";
                        }
                        table.key = tableCount;
                        tableCount += 1;
                        return table;
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
        setAndFetchTables();
        setInterval(setAndFetchTables, 3000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    // This will update table status in the backend.
    const handleFinishAssist = async (record: any) => {
        await axios.post(UPDATE_TABLE, {
            r_id: Number(localStorage.getItem("rId")),
            table_id: record.id,
        });
        // Update page DOM
        setAndFetchTables();
    };

    const columns = [
        {
            title: "table Name",
            dataIndex: "name",
            width: "35%",
        },
        {
            title: "Need Assistance",
            dataIndex: "need_assist",
            width: "35%",
            filters: [
                { text: "True", value: "True" },
                { text: "False", value: "False" },
            ],
            onFilter: (value: string, record: any) =>
                record.need_assist.indexOf(value) === 0,
        },
        {
            title: "Table Service Operation",
            dataIndex: "operation",
            render: (_: any, record: any) => (
                <Button onClick={() => handleFinishAssist(record)}>
                    {record.operation}
                </Button>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                backIcon={false}
                title="Customer Tabless"
                subTitle="This page list all customer tables."
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
                rowClassName={() => "singleTable"}
                bordered
                dataSource={dataSource}
                columns={columns as ColumnsType<tableStatusType>}
                loading={loading}
            />
        </div>
    );
};

export default WaiterTableStatus;
