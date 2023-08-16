import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, PageHeader, Alert, Table, Modal, Space } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import { GET_TABLES } from "../../../../service/customerApis";
import { DEL_TABLE, EDIT_TABLE } from "../../../../service/managerApis";
import TableAddFormModal from "./TableAddForm";
import TableEditFormModal from "./TableEditForm";

interface tableStatusType {
    key: number;
    id: number;
    name: string;
    capacity: number;
}

var timer: NodeJS.Timer;
const { confirm } = Modal;
const ManageTable = () => {
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
            .get(GET_TABLES, {
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
        timer = setInterval(setAndFetchTables, 10000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    // This will update table status in the backend.
    const handleDeleteTable = (record: any) => {
        confirm({
            title: "Are you sure to delete this table?",
            icon: <ExclamationCircleOutlined />,
            content: "This table will be removed from database!",
            okText: "Confirm",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                const url = DEL_TABLE + "/" + record.id;
                axios.delete(url).then((res) => {
                    const innerData = res.data;
                    if (innerData.code !== 200) {
                        setFetchError(true);
                        setErrorInfo(
                            innerData.message +
                                " will refresh page in 2 seconds"
                        );
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        setAndFetchTables();
                    }
                });
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };

    const columns = [
        {
            title: "Table ID",
            dataIndex: "id",
            width: "20%",
        },
        {
            title: "Table Name",
            dataIndex: "name",
            width: "35%",
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            width: "20%",
        },
        {
            title: "Table Service Operation",
            dataIndex: "operation",
            render: (_: any, record: any) => (
                <Space size="small">
                    <TableEditFormModal
                        id={record.id}
                        name={record.name}
                        capacity={record.capacity}
                    />
                    &nbsp;&nbsp;&nbsp;
                    <Button
                        type="primary"
                        danger
                        onClick={() => handleDeleteTable(record)}
                    >
                        Delete Table
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                backIcon={false}
                title="Customer Tables"
                subTitle="List all tables in the restaurant."
                extra={[]}
            ></PageHeader>
            <TableAddFormModal />
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
                columns={columns}
                loading={loading}
            />
        </div>
    );
};

export default ManageTable;
