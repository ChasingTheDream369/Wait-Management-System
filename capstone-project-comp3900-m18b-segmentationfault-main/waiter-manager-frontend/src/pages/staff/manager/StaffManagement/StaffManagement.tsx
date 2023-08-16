import { Alert, Button, Modal, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ALL_STAFF, DEL_STAFF } from "../../../../service/customerApis";
import StaffRegisterForm from "./StaffRegisterForm";

interface staffRecordDataType {
    key: number;
    id: number;
    name: string;
    role: string;
}
const { confirm } = Modal;
const StaffManagement = () => {
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [errorInfo, setErrorInfo] = useState("");
    const [dataSource, setDataSource] = useState<staffRecordDataType[]>([]);
    // Since Backend data has no key where react needed
    // Manually add key for each row of data
    const fetchStaffInfo = async () => {
        setLoading(true);
        var staffCount = 0;
        const rId = localStorage.getItem("rId");
        axios
            .get(ALL_STAFF, {
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
                    const addKey = innerData.data.map((staff: any) => {
                        staff.key = staffCount;
                        staffCount += 1;
                        return staff;
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
        fetchStaffInfo();
    }, []);

    const handleDelete = (record: any) => {
        confirm({
            title: "Are you sure to delete this staff?",
            icon: <ExclamationCircleOutlined />,
            content: "This staff record will be deleted from database",
            okText: "Confirm",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                axios
                    .post(DEL_STAFF, {
                        staff_id: record.id,
                    })
                    .then((res) => {
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
                            // Update page DOM
                            const newData = dataSource.filter(
                                (row) => row.key !== record.key
                            );
                            setDataSource(newData);
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
            title: "Staff id",
            dataIndex: "id",
            width: "25%",
        },
        {
            title: "Staff Name",
            dataIndex: "name",
            width: "30%",
        },
        {
            title: "Staff Role",
            dataIndex: "role",
            width: "25%",
        },
        {
            title: "Delete Staff",
            dataIndex: "operation",
            render: (_: any, record: any) => (
                <Button onClick={() => handleDelete(record)} danger>
                    Delete this staff
                </Button>
            ),
        },
    ];

    return (
        <div>
            <StaffRegisterForm />
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
                rowClassName={() => "staffRecord"}
                bordered
                dataSource={dataSource}
                columns={columns}
                loading={loading}
            />
        </div>
    );
};

export default StaffManagement;
