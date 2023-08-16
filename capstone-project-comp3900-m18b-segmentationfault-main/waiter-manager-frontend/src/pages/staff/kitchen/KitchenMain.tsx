import { Breadcrumb, Layout, Menu, Modal } from "antd";
import Alert from "antd/lib/alert";
import { Content } from "antd/lib/layout/layout";
import axios from "axios";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { CgLogOut } from "react-icons/cg";
import { GiRoundTable } from "react-icons/gi";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StaffLogo from "../../../components/StaffLogo";
import { LOGOUT } from "../../../service/customerApis";

const menuItems = [
    {
        label: "Orders",
        key: "1",
        icon: <AiOutlineShoppingCart size={28} />,
        url: "/kitchen/orders",
    },
    {
        label: "Prepare Queue",
        key: "2",
        icon: <GiRoundTable size={28} />,
        url: "/kitchen/queue",
    },
    {
        label: "Log Out",
        key: "3",
        icon: <CgLogOut size={28} />,
        url: "/",
    },
];

const KitchenMain = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const staffName = localStorage.getItem("staffName");
    const staffPositon = localStorage.getItem("staffPositon");

    if (staffName === null || staffPositon !== "kitchen") {
        useEffect(() => {
            setTimeout(() => {
                navigate("/");
                localStorage.clear();
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
        if (pathname === "/kitchen/orders") return ["1"];
        if (pathname === "/kitchen/queue") return ["2"];
        return [];
    };

    const logout = () => {
        axios.get(LOGOUT);
        navigate("/");
        localStorage.clear();
    };

    useEffect(() => {
        // By default, go to sales report
        if (pathname.endsWith("/kitchen") || pathname.endsWith("/kitchen/")) {
            navigate("/kitchen/orders");
        }
    }, []);

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
                <div className="menu-logo">KITCHEN</div>
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
                    <Breadcrumb.Item>Kitchen</Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {menuItems.find(
                            (item) => item.key === getSelectedKeys()[0]
                        )?.label ?? ""}
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

export default KitchenMain;
