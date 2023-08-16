import { Button, Form, Input, Modal, Select } from "antd";
import Password from "antd/lib/input/Password";
import axios from "axios";
import JSEncrypt from "jsencrypt";
import { useState } from "react";
import { ADD_STAFF, PUBLICKEY } from "../../../../service/customerApis";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const validateMessages = {
    required: "${label} is required!",
    string: {
        min: "'${label}' must be at least ${min} characters",
    },
};

const { Option } = Select;

interface StaffRegisterFormProps {
    open: boolean;
    onCreate: (values: any) => void;
    onCancel: () => void;
}

const StaffRegisterForm: React.FC<StaffRegisterFormProps> = ({
    open,
    onCreate,
    onCancel,
}) => {
    const [form] = Form.useForm();

    return (
        <Modal
            open={open}
            title="Add new staff member"
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
                        console.log("Registration Data is not valid", info);
                    });
            }}
        >
            <Form
                {...layout}
                form={form}
                name="staffRegistration"
                validateMessages={validateMessages}
            >
                <Form.Item
                    name="name"
                    label="Staff Name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Login Password"
                    rules={[
                        {
                            required: true,
                        },
                        {
                            type: "string",
                            min: 8,
                        },
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[
                        {
                            required: true,
                            message: "Please select staff's Position",
                        },
                    ]}
                >
                    <Select placeholder="Select Position">
                        <Option value="waiter"> Waiter </Option>
                        <Option value="kitchen"> Kitchen Staff </Option>
                        <Option value="manager"> Manager </Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const StaffRegistration = () => {
    const [open, setOpen] = useState(false);

    const onCreate = (values: any) => {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLICKEY);
        let passwordEncrypted = encrypt.encrypt(values.password);
        axios
            .post(ADD_STAFF, {
                r_id: Number(localStorage.getItem("rId")),
                name: values.name,
                password: passwordEncrypted,
                role: values.role,
            })
            .then((res) => {
                const innerData = res.data;
                if (innerData.code !== 200) {
                    // Maybe add the error notification?
                    // Which will require get the two state as prop
                    // TODO
                    alert(innerData.message + "will refresh page in 2 seconds");
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    // Succeess add User, Refresh Page
                    window.location.reload();
                }
            });
        setOpen(false);
    };

    return (
        <div>
            <Button
                type="primary"
                onClick={() => {
                    setOpen(true);
                }}
                style={{ marginBottom: "20px" }}
            >
                Add staff member
            </Button>
            <StaffRegisterForm
                open={open}
                onCreate={onCreate}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </div>
    );
};

export default StaffRegistration;
