import { Button, Form, Input, InputNumber, Modal} from "antd";
import axios from "axios";
import { useState } from "react";
import { ADD_TABLE } from "../../../../service/managerApis";

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


interface TableAddFormProps {
    open: boolean;
    onCreate: (values: any) => void;
    onCancel: () => void;
}

const TableAddForm: React.FC<TableAddFormProps> = ({
    open,
    onCreate,
    onCancel,
}) => {
    const [form] = Form.useForm();

    return (
        <Modal
            open={open}
            title="Add a new table"
            okText="Add"
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
                validateMessages={validateMessages}
            >
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
                            max: 18
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const TableAddFormModal = () => {

    const [open, setOpen] = useState(false);

    const onCreate = (values: any) => {
       
        axios
            .post(ADD_TABLE, {
                r_id: Number(localStorage.getItem("rId")),
                name: values.name,
                capacity: values.capacity,
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    alert(innerData.message + "will refresh page in 2 seconds");
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
                type="primary"
                style={{
                    margin: "10px auto",
                    width: "100%",
                    height: "80px",
                    borderRadius: "5px",
                    fontSize: "24px",
                }}
                onClick={() => {
                    setOpen(true);
                }}
            >
                Add new table
            </Button>
            <TableAddForm
                open={open}
                onCreate={onCreate}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </div>
    );
};

export default TableAddFormModal;
