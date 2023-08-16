import { Breadcrumb, Button, Layout, Menu, Modal } from "antd";
import Alert from "antd/lib/alert";
import { Content } from "antd/lib/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { GiRoundTable } from "react-icons/gi";
import { CgLogOut } from "react-icons/cg";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import StaffLogo from "../../../components/StaffLogo";
import { LOGOUT } from "../../../service/customerApis";
import axios from "axios";

const menuItems = [
    {
        label: "Orders",
        key: "1",
        icon: <AiOutlineShoppingCart size={28} />,
        url: "/waiter/orders",
    },
    {
        label: "Table Status",
        key: "2",
        icon: <GiRoundTable size={28} />,
        url: "/waiter/table-status",
    },
    {
        label: "Log Out",
        key: "3",
        icon: <CgLogOut size={28} />,
        url: "/",
    },
];

const WaiterMain = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const staffName = localStorage.getItem("staffName");
    const staffPositon = localStorage.getItem("staffPositon");

    if (staffName === null || staffPositon !== "waiter") {
        useEffect(() => {
            setTimeout(() => {
                navigate("/");
            }, 4000);
        }, []);
        return (
            <Alert
                message="Invalid Login info. Please login in using correct identity. Will redirect to login in in 4 seconds."
                type="error"
                showIcon
            />
        );
    }

    useEffect(() => {
        // By default, go to sales report
        if (pathname.endsWith("/waiter") || pathname.endsWith("/waiter/")) {
            navigate("/waiter/orders");
        }
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const onClickMenu: MenuClickEventHandler = (e) => {
        const key = e.key;
        const prevKey = getSelectedKeys()[0];
        // Log out
        if (key === "3") {
            setIsModalOpen(true);
            return;
        }
        if (key === prevKey) return;
        const item = menuItems.find((t) => t.key === key);
        if (!item) return;
        navigate(item.url);
    };

    const getSelectedKeys = () => {
        if (pathname === "/waiter/orders") return ["1"];
        if (pathname === "/waiter/table-status") return ["2"];
        return ["1"];
    };

    const logout = () => {
        axios.get(LOGOUT);
        navigate("/");
        localStorage.clear();
    };

    return (
        <Layout
            hasSider
            style={{
                minHeight: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
                padding: "0",
            }}
        >
            <div className="menu-wrapper">
                <StaffLogo />
                <div className="menu-logo">WAITER</div>
                <Menu
                    onClick={onClickMenu}
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={[]}
                    mode="inline"
                    items={menuItems}
                    theme="dark"
                    style={{ minWidth: "340px" }}
                />
                <Modal
                    title="Logout Confirm"
                    open={isModalOpen}
                    onOk={logout}
                    onCancel={() => setIsModalOpen(false)}
                >
                    <p>Are you sure to log out?</p>
                </Modal>
            </div>
            <Content
                style={{
                    margin: 0,
                    zIndex: "99",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <Breadcrumb style={{ margin: "16px 16px" }}>
                    <Breadcrumb.Item>Waiter</Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {
                            menuItems.find(
                                (item) => item.key === getSelectedKeys()[0]
                            )!.label
                        }
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        height: "calc(100vh - 54px)",
                        overflow: "auto",
                        padding: "24px 0 24px 24px",
                    }}
                >
                    <Outlet />
                </div>
            </Content>
        </Layout>
    );
};

export default WaiterMain;
