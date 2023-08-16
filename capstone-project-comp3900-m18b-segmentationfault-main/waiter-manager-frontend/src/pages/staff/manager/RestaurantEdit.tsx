import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select, Upload } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    IMenuItem,
    IRestaurantDetail,
} from "../../../features/customers/types";
import { GET_MENU_ITEMS } from "../../../service/customerApis";
import {
    GET_RESTAURANT_DETAIL,
    IMAGE_UPLOAD,
    UPDATE_RESTAURANT_DETAIL,
} from "../../../service/managerApis";

const RestaurantEdit = () => {
    const fetchRestaurantDetail = async () => {
        const rId = localStorage.getItem("rId");
        const url = GET_RESTAURANT_DETAIL + "/" + rId;
        const { code, data, message } = await axios
            .get(url)
            .then((r) => r.data);
        if (code !== 200) {
            message && alert(message);
            return;
        }
        setRest(data);
    };

    const fetchDishes = async () => {
        const rId = localStorage.getItem("rId");
        const { code, data, message } = await axios
            .get(GET_MENU_ITEMS, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((r) => r.data);
        if (code !== 200) {
            message && alert(message);
            return;
        }
        const dataDishes = data.map((dish: IMenuItem) => ({
            ...dish,
            key: "dish-" + dish.id,
        }));
        setDishes(dataDishes);
    };

    const handleSubmit = async () => {
        const rId = localStorage.getItem("rId");
        const URL = UPDATE_RESTAURANT_DETAIL + "/" + rId;
        const { code, message: msg } = await axios
            .put(URL, rest)
            .then((r) => r.data);
        if (code !== 200) {
            msg && message.error(msg);
        } else {
            message.success("Success");
        }
        fetchRestaurantDetail();
        fetchDishes();
    };

    const [rest, setRest] = useState<IRestaurantDetail>();
    const [dishes, setDishes] = useState<IMenuItem[]>([]);

    useEffect(() => {
        fetchRestaurantDetail();
        fetchDishes();
    }, []);

    if (!rest) return <div>Fetching Restaurant Info...</div>;

    // Image Upload
    const uploadProps = {
        name: "file",
        action: IMAGE_UPLOAD,
        headers: {
            authorization: "authorization-text",
        },
        onChange: (info:any) => {
            if (info.file.status !== "uploading") {
                console.log("uploading", info.file, info.fileList);
            }
            if (info.file.status === "done") {
                console.log("finished");
                message.success(`${info.file.name} file uploaded successfully`);
                const img_urls = info.fileList.map(
                    (file:any) => file.response.img_url
                );
                setRest({
                    ...rest,
                    img_urls,
                } as IRestaurantDetail);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    return (
        <Form
            style={{ width: "80%", margin: "20px auto 0 auto" }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            onFinish={handleSubmit}
        >
            <Form.Item label="id">
                <Input disabled value={rest.id}></Input>
            </Form.Item>
            <Form.Item required label="name">
                <Input
                    required
                    value={rest.name}
                    onChange={(e) => setRest({ ...rest, name: e.target.value })}
                ></Input>
            </Form.Item>
            <Form.Item required label="description">
                <Input.TextArea
                    rows={7}
                    required
                    value={rest.description}
                    onChange={(e) =>
                        setRest({ ...rest, description: e.target.value })
                    }
                ></Input.TextArea>
            </Form.Item>
            <Form.Item required label="address">
                <Input
                    required
                    value={rest.address}
                    onChange={(e) =>
                        setRest({ ...rest, address: e.target.value })
                    }
                ></Input>
            </Form.Item>
            <Form.Item required label="lat">
                <Input
                    required
                    type="number"
                    value={rest.lat}
                    onChange={(e) => setRest({ ...rest, lat: e.target.value })}
                ></Input>
            </Form.Item>
            <Form.Item required label="lon">
                <Input
                    required
                    type="number"
                    value={rest.lon}
                    onChange={(e) => setRest({ ...rest, lon: e.target.value })}
                ></Input>
            </Form.Item>
            <Form.Item label="specials">
                <Select
                    disabled
                    mode="multiple"
                    size="middle"
                    style={{ width: "100%" }}
                    options={dishes.map((dish) => ({
                        value: dish.id,
                        label: dish.name,
                    }))}
                    value={rest.specials.map((s) => s.id)}
                />
            </Form.Item>
            {/* Image */}
            <Form.Item
                required
                tooltip="This is a required field"
                label="Image Upload"
            >
                <Upload {...uploadProps} maxCount={5} listType="picture-card">
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>
            <Form.Item label="Image URL">
                {rest?.img_urls.map((url) => (
                    <Input
                        disabled
                        value={url}
                        style={{ margin: "0 auto 10px auto" }}
                    ></Input>
                ))}
            </Form.Item>
            <Form.Item
                wrapperCol={{ offset: 12, span: 12 }}
                style={{ marginTop: "50px" }}
            >
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default RestaurantEdit;
