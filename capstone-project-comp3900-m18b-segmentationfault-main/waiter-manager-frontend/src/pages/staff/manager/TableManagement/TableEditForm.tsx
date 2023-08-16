import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import axios from "axios";
import { useState } from "react";
import { EDIT_TABLE } from "../../../../service/managerApis";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const validateMessages = {
    required: "${label} is required!",
    string: {
        min: "'${label}' must be at least ${min} characters",
    },
    number: {
        range:"'${name}' must be between ${min} and ${max}",
    }
};

interface TableData {
    id: number;
    name: string;
    capacity: number;
}

interface TableEditFormProps {
    open: boolean;
    currentValue: TableData;
    onCreate: (values: any) => void;
    onCancel: () => void;
}

const TableEditForm: React.FC<TableEditFormProps> = ({
    open,
    currentValue,
    onCreate,
    onCancel,
}) => {
    const [form] = Form.useForm();

    return (
        <Modal
            open={open}
            title="Edit table"
            okText="Confirm"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then((values) => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch((info) => {
                        console.log("Input Data is not valid", info);
                    });
            }}
        >
            <Form
                {...layout}
                form={form}
                name="Add Table"
                initialValues={{
                    id: currentValue.id,
                    name: currentValue.name,
                    capacity: currentValue.capacity,
                }}
                validateMessages={validateMessages}
            >
                <Form.Item
                    name="id"
                    label="Table ID"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Table Name"
                    rules={[
                        { 
                            required: true 
                        },
                        {
                            type: "string",
                            min: 1,
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
            
                <Form.Item
                    name="capacity"
                    label="Table Capacity"
                    rules={[
                        {
                            required: true,
                        },
                        {
                            type: "number",
                            min: 1,
                            max: 12
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const TableEditFormModal = (prop: TableData) => {
    
    const [open, setOpen] = useState(false);
    const [defaultData, setDefaultData] = useState<TableData>(prop);
    console.log(defaultData);

    const onCreate = (values: any) => {   
        axios
            .put(EDIT_TABLE, {
                r_id: Number(localStorage.getItem("rId")),
                t_id: values.id,
                name: values.name,
                capacity: values.capacity,
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    alert(innerData.message + " Will refresh page in 2 seconds");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    // Succeess add table, Refresh Page
                    window.location.reload();
                }
            });
        setOpen(false);
    };

    return (
        <div>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
            >
                Edit table info
            </Button>
            <TableEditForm
                currentValue={defaultData}
                open={open}
                onCreate={onCreate}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </div>
    );
};

export default TableEditFormModal;