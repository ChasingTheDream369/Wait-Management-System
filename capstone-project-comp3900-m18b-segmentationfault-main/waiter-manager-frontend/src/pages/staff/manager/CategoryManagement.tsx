import { MenuOutlined } from "@ant-design/icons";
import {
    Button,
    FormInstance,
    Input,
    Modal,
    PageHeader,
    Row,
    Table,
    Typography,
    message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    SortableContainer,
    SortableContainerProps,
    SortableElement,
    SortableHandle,
    SortEnd,
} from "react-sortable-hoc";
import { ICategory } from "../../../features/customers/types";
import { GET_CATS } from "../../../service/customerApis";
import { ADD_CAT, DELETE_CAT, EDIT_CAT } from "../../../service/managerApis";

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

const isCatsEqual = (a: ICategory[], b: ICategory[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (b[i].name !== a[i].name) return false;
        if (b[i].index !== a[i].index) return false;
    }
    return true;
};

const CategoryManagement = () => {
    const columns = [
        {
            title: "Sort",
            dataIndex: "sort",
            width: 30,
            className: "drag-visible",
            render: () => <DragHandle />,
        },
        {
            title: "Index",
            dataIndex: "index",
            key: "index",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
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
        },
    ];

    const handleClickEdit = (record: ICategory) => {
        const cat = cats.find((c) => c.id === record.id);
        if (!cat) return;
        setModalCat({ ...cat });
        setModalMode("update");
        setIsModalOpen(true);
    };

    const handleModalSubmit: (
        e: React.MouseEvent<HTMLElement>
    ) => void = async (e) => {
        const rId = localStorage.getItem("rId");
        const { code, message: msg } =
            modalMode === "update"
                ? await axios
                      .put(
                          EDIT_CAT,
                          [
                              {
                                  id: modalCat!.id,
                                  index: modalCat!.index,
                                  name: modalCat!.name,
                              },
                          ],
                          {
                              params: {
                                  r_id: rId,
                              },
                          }
                      )
                      .then((r) => r.data)
                : await axios
                      .post(
                          ADD_CAT,
                          { name: modalCat?.name },
                          {
                              params: {
                                  r_id: rId,
                              },
                          }
                      )
                      .then((r) => r.data);
        if (code === 200) {
            setIsModalOpen(false);
            setModalErrorMessage("");
            message.success("Success");
        } else {
            message.error(msg);
            setModalErrorMessage(msg);
        }
        fetchCats();
    };

    const handleSubmit = async () => {
        setLoading(true);
        const rId = localStorage.getItem("rId");
        const { code, message } = await axios
            .put(EDIT_CAT, [...cats], {
                params: {
                    r_id: rId,
                },
            })
            .then((r) => r.data);

        if (code !== 200) {
            alert(message);
        }
        fetchCats();
        setLoading(false);
    };

    const handleDelete = async (record: ICategory) => {
        const id = record.id;
        const rId = localStorage.getItem("rId");
        const { code, message: msg } = await axios
            .delete(DELETE_CAT + "/" + id, {
                params: {
                    r_id: rId,
                },
            })
            .then((r) => r.data);
        if (code !== 200) {
            message.error(msg);
        } else {
            message.success("Success");
        }
        fetchCats();
    };

    // State
    const [cats, setCats] = useState<ICategory[]>([]);
    const [oCats, setOCats] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalCat, setModalCat] = useState<ICategory>();
    const [modalMode, setModalMode] = useState<"update" | "create">("update");
    const [modalErrorMessage, setModalErrorMessage] = useState<string>("");

    // Fetch Data
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
            setOCats(cats);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchCats();
    }, []);

    // Event Handlers
    const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
        if (oldIndex === newIndex) return;
        let newCats = [...cats];
        newCats.splice(newIndex, 0, newCats.splice(oldIndex, 1)[0]);
        newCats = newCats.map((cat: ICategory, i: number) => ({
            ...cat,
            key: i,
            index: i,
        }));
        setCats(newCats);
    };
    const CategoryContainer = (props: SortableContainerProps) => (
        <SortableBody
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={onSortEnd}
            {...props}
        />
    );

    const CategoryRow: React.FC<any> = ({ className, style, ...restProps }) => {
        // function findIndex base on Table rowKey props and should always be a right array index
        const index = cats.findIndex(
            (x) => x.index === restProps["data-row-key"]
        );
        return <SortableItem index={index} {...restProps} />;
    };

    return (
        <>
            <Modal
                title="Category Edit"
                open={isModalOpen}
                onOk={handleModalSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    setModalErrorMessage("");
                }}
            >
                <Input
                    style={{ margin: "5px auto" }}
                    disabled
                    value={modalMode === "update" ? modalCat?.id : ""}
                    addonBefore="id"
                />

                <Input
                    style={{ margin: "5px auto" }}
                    disabled
                    value={modalMode === "update" ? modalCat?.index : ""}
                    addonBefore="index"
                />

                <Input
                    style={{ margin: "5px auto" }}
                    value={modalCat?.name}
                    onChange={(e) =>
                        setModalCat({ ...modalCat!, name: e.target.value })
                    }
                />

                <Typography.Text type="danger">
                    {modalErrorMessage}
                </Typography.Text>
            </Modal>
            <PageHeader
                ghost={false}
                backIcon={false}
                title="Categories"
                subTitle="This page list all categories for current restaurant."
                extra={[]}
            ></PageHeader>
            <Row>
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
                        setModalMode("create");
                        setModalCat({ ...modalCat!, name: "" });
                        setIsModalOpen(true);
                    }}
                >
                    Add
                </Button>
                <Button
                    type="primary"
                    style={{
                        margin: "10px auto",
                        width: "100%",
                        height: "80px",
                        borderRadius: "5px",
                        fontSize: "24px",
                    }}
                    disabled={isCatsEqual(cats, oCats)}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Row>
            <Table
                style={{ userSelect: "none" }}
                pagination={false}
                dataSource={cats}
                columns={columns}
                rowKey="index"
                components={{
                    body: {
                        wrapper: CategoryContainer,
                        row: CategoryRow,
                    },
                }}
                loading={loading}
            />
        </>
    );
};

export default CategoryManagement;
