export interface ICustomerState {
    categories: ICategory[];
    menuItems: IMenuItem[];
    orders: IOrderItem[];
    shoppingCart: IShoppingCartItem[];
    existingBill: number;
    detailedItem: number | null;
    isQueue: boolean;
}

export interface IMenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    ingredients: string[];
    stock: number;
    img_url: string;
    speciality: boolean;
    index: number;
    r_id: number;
    cat_id: number;
}

export enum ETableStatus {
    EMPTY = 0,
    IN_USE = 1,
    CLEANING = 2,
}

export interface ITable {
    id: number;
    name: string;
    capacity: number;
    status: ETableStatus;
}

export interface ICategory {
    id: number;
    name: string;
    index: number;
    key?:React.Key;
}

export interface IShoppingCartItem {
    item: IMenuItem;
    quantity: number;
}

export interface IOrderItem {
    id: number;
    item_id: number;
    item_name: string;
    item_price: number;
    quantity: number;
    status: number;
    img_url?: string;
}

export interface IRestaurant {
    id: number;
    name: string;
}

export interface IRestaurantDetail {
    id: number;
    name: string;
    description: string;
    img_urls: string[];
    address: string;
    lat?: string;
    lon?: string;
    specials: IMenuItem[];
}

export enum EOrderStatus {
    WAITING_FOR_PREPARING = 0,
    PREPARING = 1,
    ON_ITS_WAY = 2,
    COMPLETED = 3,
}
