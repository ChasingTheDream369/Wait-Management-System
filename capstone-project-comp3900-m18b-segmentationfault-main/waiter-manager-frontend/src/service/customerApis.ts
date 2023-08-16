/**
 * !!!!!!!!!!!!!!!!!!!!! PLEASE READ README.MD FIRST!!!!!!!!!!!!!!!!!!!!!
 * !!!!!!!!!!!!!!!!!!!!! PLEASE READ README.MD FIRST!!!!!!!!!!!!!!!!!!!!!
 * !!!!!!!!!!!!!!!!!!!!! PLEASE READ README.MD FIRST!!!!!!!!!!!!!!!!!!!!!
 */

const MODE = import.meta.env.VITE_MODE;
const PROD = import.meta.env.PROD;
var DEV: boolean = MODE === "dev";
var ROOT = DEV ? "" : "/api";
if (PROD) {
    ROOT = "http://localhost:5000";
    DEV = false;
}

export const IMG_URL = (img: string) => {
    // return DEV ? img : ROOT + "/image?image=" + img;
    return img;
};

export const GET_RESTAURANT_DETAIL = (id: string) =>
    DEV
        ? "http://localhost:5173/mock/restaurant_detail.json"
        : ROOT + "/restaurants/" + id;

/**
 * * CUSTOMERS *
 */
export const GET_RESTAURANTS = DEV
    ? "http://localhost:5173/mock/restaurants.json"
    : ROOT + "/restaurants";

export const GET_TABLES = DEV
    ? "http://localhost:5173/mock/tables.json"
    : ROOT + "/tables";

export const POST_ENQUEUE = DEV
    ? "http://localhost:5173/mock/enqueue.json"
    : ROOT + "/queue";

export const LEAVE_QUEUE = (id: number) =>
    DEV ? "http://localhost:5173/mock/leave_queue.json" : ROOT + "/queue/" + id;

export const GET_QUEUE = (id: number) =>
    DEV
        ? "http://localhost:5173/mock/check_queue_out.json"
        : ROOT + "/queue/" + id;
export const POST_CHECKIN = DEV
    ? "http://localhost:5173/mock/checkin.json"
    : ROOT + "/checkin";

export const GET_CATS = DEV
    ? "http://localhost:5173/mock/cats.json"
    : ROOT + "/categories";

export const GET_MENU_ITEMS = DEV
    ? "http://localhost:5173/mock/menu_items.json"
    : ROOT + "/menu_items";

export const GET_ORDERS = DEV
    ? "http://localhost:5173/mock/orders.json"
    : ROOT + "/orders";

export const POST_ORDERS = DEV
    ? "http://localhost:5173/mock/post_orders.json"
    : ROOT + "/orders";

export const PAYMENT = DEV
    ? "http://localhost:5173/mock/payment.json"
    : ROOT + "/payment";

export const GET_ASSIST_STATUS = DEV
    ? "http://localhost:5173/mock/table_status.json"
    : ROOT + "/assist_request";

export const REQUEST_ASSIST = DEV
    ? "http://localhost:5173/mock/table_status.json"
    : ROOT + "/assist_request";

/**
 * * Staff *
 */
export const LOGIN_IN = DEV
    ? "http://localhost:5173/mock/login.json"
    : ROOT + "/Login";

export const LOGOUT = DEV
    ? "http://localhost:5173/mock/logout.json"
    : ROOT + "/Logout";

export const PUBLICKEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+b0v6S4wGr7HOl4OB+oF
y3xeCUhp1chAdLK6jKEelbrCP1RLriwjr5RF7sivzJIszO9oV5qlulsiXnP6118i
AM8rJh6m2B24EPFC0CXD/J6Pieey1srHGDUR8RaKpIiN/exUoolRe/e1//mQlHVq
cGqxvs2mGaK6nI6vKaK9DJX0elKX1B2cccb9GSgLM/O64sr4nG6q9EtNHP4ht7io
3gp70lK0AD8MJO9M+riq6u8kOXMVv2mXI7X9ZNLOi7q94s9FtnprHWt2UJP8DXHd
2ae/xpkpNI4lHKXGKAdnwBElaoYJ1bdSkbaHNdtgyxdLGjNA7LIHOP0woP1bifkC
VQIDAQAB
-----END PUBLIC KEY-----
`;

export const UPDATE_ORDER = ROOT + "/updateOrder";

/**
 * * Kitchen *
 */

export const GET_ORDERS_KITCHEN = DEV
    ? "http://localhost:5173/mock/tmp_kitchen_orders.json"
    : ROOT + "/orderStaff";

export const FINISH_PREPARE = ROOT + "/finishPrepare";

export const GET_PREPARE_QUEUE = ROOT + "/prepareQueue";

/**
 * * Waiter *
 */
export const GET_TABLES_WAITER = DEV
    ? "http://localhost:5173/mock/waiter_tables.json"
    : ROOT + "/tablesStaff";

export const GET_ORDERS_WAITER = DEV
    ? "http://localhost:5173/mock/tmp_kitchen_orders.json"
    : ROOT + "/orderStaff";

export const UPDATE_TABLE = ROOT + "/updateTable";

/**
 * * Manager *
 */
export const ALL_STAFF = ROOT + "/allStaff";

export const DEL_STAFF = ROOT + "/deleteStaff";

export const ADD_STAFF = ROOT + "/addStaff";
