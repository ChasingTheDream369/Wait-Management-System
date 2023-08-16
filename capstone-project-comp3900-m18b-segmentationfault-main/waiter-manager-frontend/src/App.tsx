import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import CustomerPayment from "./pages/customers/CustomerPayment";
import CustomersLayout from "./pages/customers/CustomersLayout";
import CustomersMain from "./pages/customers/CustomersMain";
import CustomersMenu from "./pages/customers/CustomersMenu";
import KitchenMain from "./pages/staff/kitchen/KitchenMain";
import KitchenOrders from "./pages/staff/kitchen/KitchenOrders";
import KitchenPrepareQueue from "./pages/staff/kitchen/KitchenPrepareQueue";
import CategoryManagement from "./pages/staff/manager/CategoryManagement";
import DishManagement from "./pages/staff/manager/DishManagement";
import ManagerLayout from "./pages/staff/manager/ManagerLayout";
import RestaurantEdit from "./pages/staff/manager/RestaurantEdit";
import SalesReport from "./pages/staff/manager/SalesReport";
import StaffManagement from "./pages/staff/manager/StaffManagement/StaffManagement";
import TableManage from "./pages/staff/manager/TableManagement/TableManage";
import WaiterMain from "./pages/staff/waiter/WaiterMain";
import WaiterOrders from "./pages/staff/waiter/WaiterOrders";
import WaiterTableStatus from "./pages/staff/waiter/WaiterTableStatus";
import CustomerCheckin from "./pages/welcome/CustomerCheckin";
import CustomerTables from "./pages/welcome/CustomerTables";
import StaffLogin from "./pages/welcome/StaffLogin";
import WelcomePage from "./pages/welcome/Welcome";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/welcome" />}></Route>
                <Route path="welcome" element={<WelcomePage />}>
                    <Route
                        path="customer_checkin"
                        element={<CustomerCheckin />}
                    ></Route>
                    <Route path="tables" element={<CustomerTables />}></Route>
                    <Route path="staff_login" element={<StaffLogin />}></Route>
                </Route>

                <Route path="kitchen" element={<KitchenMain />}>
                    <Route path="orders" element={<KitchenOrders />}></Route>
                    <Route
                        path="queue"
                        element={<KitchenPrepareQueue />}
                    ></Route>
                </Route>

                <Route path="waiter" element={<WaiterMain />}>
                    <Route path="orders" element={<WaiterOrders />}></Route>
                    <Route
                        path="table-status"
                        element={<WaiterTableStatus />}
                    ></Route>
                </Route>

                <Route path="customers" element={<CustomersLayout />}>
                    <Route path="main" element={<CustomersMain />}></Route>
                    <Route
                        path="categories/:cat_id"
                        element={<CustomersMenu />}
                    ></Route>
                </Route>
                <Route
                    path="customers/payment"
                    element={<CustomerPayment />}
                ></Route>

                {/* Manager */}
                <Route path="manager" element={<ManagerLayout />}>
                    <Route path="sales" element={<SalesReport />}></Route>
                    <Route path="dishes" element={<DishManagement />}></Route>
                    <Route
                        path="categories"
                        element={<CategoryManagement />}
                    ></Route>
                    <Route path="staff" element={<StaffManagement />}></Route>
                    <Route path="table" element={<TableManage />}></Route>
                    <Route
                        path="restaurant"
                        element={<RestaurantEdit />}
                    ></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
