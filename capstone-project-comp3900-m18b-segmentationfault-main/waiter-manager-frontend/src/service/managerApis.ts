const MODE = import.meta.env.VITE_MODE;
const DEV: boolean = MODE === "dev";
const ROOT = DEV ? "" : "/api";

export const GET_SALES_DATA = DEV ? "/mock/sales.json" : ROOT + "/sales_report";
export const DELETE_CAT = ROOT + "/categories";
export const EDIT_CAT = ROOT + "/categories";
export const ADD_CAT = ROOT + "/categories";

export const ADD_TABLE = ROOT + "/tables";
export const EDIT_TABLE = ROOT + "/tables";
export const DEL_TABLE = ROOT + "/tables";

export const DEL_DISH = ROOT + "/menu_items";
export const ADD_DISH = ROOT + "/menu_items";
export const UPDATE_DISH = ROOT + "/menu_items";

export const IMAGE_UPLOAD = ROOT + "/image";
export const GET_RESTAURANT_DETAIL = ROOT + "/restaurants";
export const UPDATE_RESTAURANT_DETAIL = ROOT + "/restaurants";
