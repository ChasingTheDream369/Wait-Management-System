import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, Modal } from "antd";
import { Content } from "antd/lib/layout/layout";
import axios from "axios";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { useEffect, useState } from "react";
import { BiCategory } from "react-icons/bi";
import { BsPersonLinesFill } from "react-icons/bs";
import { CgLogOut } from "react-icons/cg";
import { ImStatsBars } from "react-icons/im";
import { MdDining, MdFastfood } from "react-icons/md";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StaffLogo from "../../../components/StaffLogo";
import { LOGOUT } from "../../../service/customerApis";
import useWindowSize, {
    REF_HEIGHT,
    REF_WIDTH,
} from "../../../util/useWindowResize";
import "./style.css";

const menuItems: any[] = [
    {
        label: "Sales Report",
        key: "1",
        icon: <ImStatsBars size={28} />,
        url: "/manager/sales",
    },
    {
        label: "Categories",
        key: "2",
        icon: <BiCategory size={28} />,
        url: "/manager/categories",
    },
    {
        label: "Dishes",
        key: "3",
        icon: <MdFastfood size={28} />,
        url: "/manager/dishes",
    },
    {
        label: "Staff",
        key: "4",
        icon: <BsPersonLinesFill size={28} />,
        url: "/manager/staff",
    },
    {
        label: "Table",
        key: "5",
        icon: <MdDining size={28} />,
        url: "/manager/table",
    },
    {
        label: "Restaurant",
        key: "6",
        icon: <MdDining size={28} />,
        url: "/manager/restaurant",
    },
    {
        label: "Log Out",
        key: "7",
        icon: <CgLogOut size={28} />,
        url: "/",
    },
];

const ManagerLayout = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const logout = () => {
        axios.get(LOGOUT);
        navigate("/");
        localStorage.clear();
    };

    const onClickMenu: MenuClickEventHandler = (e) => {
        const key = e.key;
        const prevKey = getSelectedKeys()[0];
        // Log out
        if (key === "7") {
            setIsModalOpen(true);
            return;
        }
        if (key === prevKey) return;
        const item = menuItems.find((t) => t.key === key);
        if (!item) return;
        navigate(item.url);
    };

    const getSelectedKeys = () => {
        if (pathname.endsWith("sales")) return ["1"];
        if (pathname.endsWith("categories")) return ["2"];
        if (pathname.endsWith("dishes")) return ["3"];
        if (pathname.endsWith("staff")) return ["4"];
        if (pathname.endsWith("table")) return ["5"];
        if (pathname.endsWith("restaurant")) return ["6"];
        return ["1"];
    };
    // Responsive Layout
    const { width: innerWidth, height: innerHeight } = useWindowSize();
    const rw = innerWidth / REF_WIDTH;
    const rh = innerHeight / REF_HEIGHT;

    useEffect(() => {
        // By default, go to sales report
        if (pathname.endsWith("/manager") || pathname.endsWith("/manager/")) {
            navigate("/manager/sales");
        }
    }, []);

    useEffect(() => {
        // Set collapsed
        setCollapsed(innerWidth < 1000);
    }, [innerWidth]);

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
                {!collapsed && <StaffLogo />}
                <div
                    className="menu-logo"
                    style={{ display: collapsed ? "none" : "block" }}
                >
                    MANAGER
                </div>

                <Menu
                    onClick={onClickMenu}
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={[]}
                    mode="inline"
                    items={menuItems}
                    theme="dark"
                    style={
                        {
                            // minWidth: `${(330 * rw) >>> 0}px`,
                        }
                    }
                    inlineCollapsed={collapsed}
                />
                {innerWidth > 1000 && (
                    <Button
                        type="primary"
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            display: "block",
                            left: collapsed ? "17px" : "100px",
                            top: "17px",
                        }}
                    >
                        {collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )}
                    </Button>
                )}
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
                    <Breadcrumb.Item>Manager</Breadcrumb.Item>
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

export default ManagerLayout;
