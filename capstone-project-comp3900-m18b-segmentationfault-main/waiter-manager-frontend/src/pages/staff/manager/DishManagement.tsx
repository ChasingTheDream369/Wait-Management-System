import {
    Button,
    Col,
    Form,
    FormInstance,
    Input,
    message,
    Modal,
    Radio,
    Row,
    Select,
    Table,
    Typography,
    Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ICategory, IMenuItem } from "../../../features/customers/types";
import { GET_CATS, GET_MENU_ITEMS } from "../../../service/customerApis";
import {
    SortableContainer,
    SortableContainerProps,
    SortableElement,
    SortableHandle,
    SortEnd,
} from "react-sortable-hoc";
import { MenuOutlined, UploadOutlined } from "@ant-design/icons";
import IngredientsStack from "../../customers/components/IngredientsStack";
import {
    ADD_DISH,
    DEL_DISH,
    IMAGE_UPLOAD,
    UPDATE_DISH,
} from "../../../service/managerApis";

const DragHandle = SortableHandle(() => (
    <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
));
const SortableItem = SortableElement(
    (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
);
const SortableBody = SortableContainer(
    (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody {...props} />
    )
);

const DishManagement = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState<IMenuItem[]>([]);
    const [oDishes, setODishes] = useState<IMenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"update" | "create">("create");
    const [modalErrorMessage, setModalErrorMessage] = useState("");
    const [modalDish, setModalDish] = useState<IMenuItem>();
    const [cats, setCats] = useState<ICategory[]>([]);
    const [cat, setCat] = useState<ICategory>();

    const columns = [
        {
            title: "Sort",
            dataIndex: "sort",
            width: 30,
            className: "drag-visible",
            render: () => <DragHandle />,
        },
        {
            title: "id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Image",
            dataIndex: "img_url",
            key: "img_url",
            render: (_: any, record: any) => (
                <img
                    style={{
                        height: "100px",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px 1px #ddd",
                    }}
                    src={record.img_url}
                    alt=""
                ></img>
            ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
        },

        {
            title: "Stock",
            dataIndex: "stock",
            key: "stock",
        },
        {
            title: "Speciality",
            dataIndex: "speciality",
            key: "speciality",
            render: (_: any, record: IMenuItem) => (
                <Typography.Text>
                    {record.speciality ? "true" : "false"}
                </Typography.Text>
            ),
        },
        {
            title: "Index",
            dataIndex: "index",
            key: "index",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (_: any, record: any) => (
                <p>
                    {record.description.slice(
                        0,
                        Math.min(80, record.description.length)
                    ) + "..."}
                </p>
            ),
        },
        {
            title: "Ingredients",
            dataIndex: "ingredients",
            key: "ingredients",
            render: (_: any, record: any) => (
                <IngredientsStack ingredients={record.ingredients} />
            ),
            width: 30,
        },
        {
            title: "Edit",
            dataIndex: "operation",
            render: (_: any, record: any) => (
                <>
                    <Button
                        onClick={() => handleClickEdit(record)}
                        style={{ marginRight: "20px" }}
                    >
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record)}>
                        Delete
                    </Button>
                </>
            ),
            key: "operation",
        },
    ];

    const handleClickEdit = (record: IMenuItem) => {
        setModalDish({ ...record });
        setModalMode("update");
        setIsModalOpen(true);
    };

    const handleDelete = async (record: IMenuItem) => {
        setLoading(true);
        const { code, message: msg } = await axios
            .delete(DEL_DISH + "/" + record.id)
            .then((r) => r.data);
        if (code !== 200) {
            message.error(msg);
        } else {
            message.success("Delete success!");
        }
        setLoading(false);
        fetchDishes();
    };

    const DishesContainer = (props: SortableContainerProps) => (
        <SortableBody
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={onSortEnd}
            {...props}
        />
    );

    const DishesRow: React.FC<any> = ({ className, style, ...restProps }) => {
        // function findIndex base on Table rowKey props and should always be a right array index
        const index = dishes.findIndex(
            (x) => x.index === restProps["data-row-key"]
        );
        return <SortableItem index={index} {...restProps} />;
    };
    const fetchDishes = async (catId?: number) => {
        setLoading(true);
        const rId = localStorage.getItem("rId");
        const {
            code,
            data,
            message: msg,
        } = await axios
            .get(GET_MENU_ITEMS, {
                params: {
                    r_id: Number(rId),
                },
            })
            .then((r) => r.data);
        if (code !== 200) {
            msg && message.error(msg);
            return;
        }
        const dataDishes = data
            .filter((d: IMenuItem) => d.cat_id === (catId ?? cat?.id))
            .map((dish: IMenuItem) => ({
                ...dish,
                key: "dish-" + dish.id,
            }));
        setDishes(dataDishes);
        setODishes(dataDishes);
        setLoading(false);
    };

    // Event Handlers
    const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
        if (oldIndex === newIndex) return;
        let newDishes = [...dishes];
        newDishes.splice(newIndex, 0, newDishes.splice(oldIndex, 1)[0]);
        newDishes = newDishes.map((menuItem: IMenuItem, i: number) => ({
            ...menuItem,
            key: "dish-" + menuItem.id,
            index: i,
        }));
        setDishes(newDishes);
    };

    const handleModalSubmit = async () => {
        setLoading(true);
        if (!modalDish?.img_url) {
            message.success("Please Upload an image!");
            fetchDishes();
            setLoading(false);
            return;
        }
        const rId = localStorage.getItem("rId");
        const payloadDish: any = { ...modalDish };
        delete payloadDish["key"];
        const { code, message: msg } =
            modalMode === "create"
                ? await axios
                      .post(ADD_DISH, payloadDish, {
                          params: {
                              r_id: Number(rId),
                          },
                      })
                      .then((r) => r.data)
                : await axios
                      .put(UPDATE_DISH, [payloadDish], {
                          params: {
                              r_id: Number(rId),
                          },
                      })
                      .then((r) => r.data);
        if (code !== 200) {
            alert(msg ?? "");
        } else {
            message.success("Success");
        }
        fetchDishes();
        setLoading(false);
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const rId = localStorage.getItem("rId");
        const { code, message: msg } = await axios
            .put(UPDATE_DISH, [...dishes], {
                params: {
                    r_id: rId,
                },
            })
            .then((r) => r.data);

        if (code !== 200) {
            msg && message.error(msg);
        } else {
            message.success("Success");
        }
        fetchDishes();
        setLoading(false);
    };
    const isDishesEqual = (a: IMenuItem[], b: IMenuItem[]): boolean => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (b[i].name !== a[i].name) return false;
            if (b[i].index !== a[i].index) return false;
        }
        return true;
    };
    const fetchCats = async () => {
        setLoading(true);
        const rId = localStorage.getItem("rId");
        if (!rId) return;
        try {
            const { code, data } = await axios
                .get(GET_CATS, {
                    params: {
                        r_id: Number(rId),
                    },
                })
                .then((res) => res.data);
            const cats = data.map((cat: ICategory) => ({
                ...cat,
                key: cat.index,
            }));
            setCats(cats);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

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
                const img_url = info.fileList[0].response.img_url;
                setModalDish({
                    ...modalDish,
                    img_url,
                } as IMenuItem);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setModalErrorMessage("");
        setModalDish({} as IMenuItem);
    };

    useEffect(() => {
        fetchCats();
    }, []);

    return (
        <div>
            <Row
                style={{
                    justifyContent: "center",
                    margin: "10px auto",
                }}
            >
                {cats.length > 0 && (
                    <>
                        Category: &nbsp;&nbsp;&nbsp;
                        <Radio.Group
                            onChange={(e) => {
                                if (e.target.value === -1) {
                                    setDishes([]);
                                    setODishes([]);
                                }
                                setCat(
                                    cats.find((c) => c.id === e.target.value)
                                );
                                fetchDishes(e.target.value);
                            }}
                            value={cat?.id}
                            defaultValue={-1}
                        >
                            {[
                                <Radio value={-1}>None</Radio>,
                                ...cats.map((c) => (
                                    <Radio value={c.id}>{c.name}</Radio>
                                )),
                            ]}
                        </Radio.Group>
                    </>
                )}
            </Row>
            <Row
                style={{
                    justifyContent: "center",
                }}
            >
                <Col
                    span={23}
                    style={{
                        textAlign: "center",
                    }}
                >
                    <Button
                        type="primary"
                        style={{
                            margin: "10px auto",
                            width: "100%",
                            height: "80px",
                            borderRadius: "5px",
                            fontSize: "24px",
                        }}
                        disabled={isDishesEqual(dishes, oDishes)}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                    {/* Add Button */}
                    <Button
                        style={{
                            margin: "0 auto 20px auto",
                            width: "100%",
                            height: "60px",
                            borderRadius: "5px",
                            fontSize: "24px",
                        }}
                        type="primary"
                        onClick={() => {
                            setModalDish({
                                speciality: false,
                                cat_id: cats[0].id,
                            } as IMenuItem);
                            setModalMode("create");
                            setIsModalOpen(true);
                        }}
                    >
                        Add a dish
                    </Button>
                    {/* Table */}
                    <Table
                        style={{ userSelect: "none" }}
                        pagination={false}
                        dataSource={dishes}
                        columns={columns}
                        rowKey="index"
                        components={{
                            body: {
                                wrapper: DishesContainer,
                                row: DishesRow,
                            },
                        }}
                        loading={loading}
                        scroll={{ x: true }}
                    />
                </Col>
            </Row>
            <Modal
                title={
                    modalMode === "update"
                        ? "Menu Item Edit"
                        : "Create a Menu Item"
                }
                open={isModalOpen}
                onCancel={handleModalCancel}
                style={{ minWidth: "700px" }}
                footer={null}
            >
                {isModalOpen && (
                    <Form
                        onFinish={handleModalSubmit}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Form.Item label="id">
                            <Input
                                disabled
                                value={
                                    modalMode === "update" ? modalDish?.id : ""
                                }
                            />{" "}
                        </Form.Item>
                        <Form.Item label="index">
                            <Input
                                disabled
                                value={
                                    modalMode === "update"
                                        ? modalDish?.index
                                        : ""
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="Name"
                            required
                            tooltip="This is a required field"
                        >
                            <Input
                                required
                                value={modalDish?.name}
                                onChange={(e) =>
                                    setModalDish({
                                        ...modalDish!,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="Price"
                            required
                            tooltip="This is a required field"
                        >
                            <Input
                                required
                                value={modalDish?.price}
                                type="number"
                                onChange={(e) =>
                                    setModalDish({
                                        ...modalDish!,
                                        price: Number(
                                            Number(e.target.value).toFixed(2)
                                        ),
                                    })
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            label="Stock"
                            required
                            tooltip="This is a required field"
                        >
                            <Input
                                required
                                value={modalDish?.stock}
                                type="number"
                                onChange={(e) =>
                                    setModalDish({
                                        ...modalDish!,
                                        stock: Number(
                                            Number(e.target.value) >>> 0
                                        ),
                                    })
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            required
                            tooltip="This is a required field"
                            label="Speciality"
                        >
                            <Radio.Group
                                value={modalDish?.speciality ? 1 : 0 ?? 0}
                                onChange={(e) => {
                                    setModalDish({
                                        ...modalDish!,
                                        speciality: e.target.value === 1,
                                    });
                                }}
                            >
                                <Radio value={0}>No</Radio>
                                <Radio value={1}>Yes</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            required
                            tooltip="This is a required field"
                            label="Ingredients(Split by ,)"
                        >
                            <Input
                                value={(modalDish?.ingredients ?? []).join(",")}
                                onChange={(e) =>
                                    setModalDish({
                                        ...modalDish!,
                                        ingredients: e.target.value
                                            .split(",")
                                            .map((s) => s.trim()),
                                    })
                                }
                                required
                            />
                        </Form.Item>

                        <Form.Item
                            required
                            tooltip="This is a required field"
                            label="Description"
                        >
                            <Input
                                required
                                value={modalDish?.description}
                                onChange={(e) =>
                                    setModalDish({
                                        ...modalDish!,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            required
                            tooltip="This is a required field"
                            label="Category"
                        >
                            <Select
                                style={{ width: "100%" }}
                                options={cats.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                value={modalDish?.cat_id}
                                onChange={(e) => {
                                    console.log({ e });
                                    setModalDish({
                                        ...modalDish!,
                                        cat_id: Number(e),
                                    });
                                }}
                            />
                        </Form.Item>
                        {/* Image */}
                        <Form.Item
                            required
                            tooltip="This is a required field"
                            label="Image Upload"
                        >
                            <Upload {...uploadProps} maxCount={1}>
                                <Button icon={<UploadOutlined />}>
                                    Click to Upload
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item label="Image URL">
                            <Input value={modalDish?.img_url} disabled />
                        </Form.Item>
                        {modalDish?.img_url && (
                            <Form.Item label="Preview">
                                <img
                                    style={{
                                        height: "200px",
                                        margin: "0 auto",
                                        borderRadius: "10px",
                                    }}
                                    src={modalDish?.img_url}
                                ></img>
                            </Form.Item>
                        )}

                        <Typography.Text type="danger">
                            {modalErrorMessage}
                        </Typography.Text>

                        <Form.Item>
                            <Row style={{ justifyContent: "right" }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{ marginRight: "10px" }}
                                >
                                    OK
                                </Button>
                                <Button onClick={handleModalCancel}>
                                    Cancel
                                </Button>
                            </Row>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default DishManagement;
