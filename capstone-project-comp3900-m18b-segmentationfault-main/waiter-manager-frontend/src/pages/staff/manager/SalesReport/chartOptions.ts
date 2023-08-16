import * as echarts from "echarts";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const getSalesChartOption = (annualData: IMonthlySaleData[]) => {
    const months = annualData.map((t) => t.month);
    const sales = annualData.map((t) => t.sales);
    return {
        responsive: true,
        maintainAspectRatio: false,
        tooltip: {
            axisPointer: {
                type: "cross",
            },
        },
        xAxis: {
            type: "category",
            data: months.map((i) => MONTHS[i - 1]),
        },
        yAxis: {
            type: "value",
        },
        series: [
            {
                data: sales,
                type: "line",
                smooth: true,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: "#1890ff",
                        },
                        {
                            offset: 1,
                            color: "rgb(160, 160, 255)",
                        },
                    ]),
                },
            },
        ],
    };
};

const rainbow: string[] = [
    "#ea80fc",
    "#ea80fc",
    "#ea80fc",
    "#ea80fc",
    "#ea80fc",
    "#ea80fc",
    "#ea80fc",
];

export const getWeeklyOption = (customers_weekly: number[]) => ({
    xAxis: {
        type: "category",
        data: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ],
    },
    tooltip: {
        axisPointer: {
            type: "cross",
        },
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            data: customers_weekly.map((val, i) => ({
                value: val,
                itemStyle: { color: rainbow[i % 7] },
            })),
            type: "bar",
        },
    ],
    toolbox: {
        show: true,
        feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
        },
    },
});

interface ICatSale {
    name: string;
    sales: number;
}

export const getSalesByCategoriesOption = (cats: ICatSale[]) => {
    cats = cats.slice(0, Math.min(8, cats.length));
    return {
        tooltip: {
            trigger: "item",
        },
        legend: {
            top: "5%",
            left: "center",
        },
        series: [
            {
                name: "Access From",
                type: "pie",
                radius: ["38%", "80%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                label: {
                    show: false,
                    position: "center",
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: "26",
                        fontWeight: "bold",
                    },
                },
                labelLine: {
                    show: false,
                },
                data: cats
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((cat) => ({ name: cat.name, value: cat.sales })),
            },
        ],
    };
};

export interface IMonthlySaleData {
    month: number;
    sales: number;
}

export interface IData {
    restaurant_name: string;
    total_customers: number;
    total_items_cooked: number;
    total_income: string;
    total_tables: number;
    customer_average_cost: "string";
    total_categories: number;
    total_dishes: number;
    total_staff: number;
    annual_sales: IMonthlySaleData[];
    customers_weekly: number[];
    sales_by_categories: ICatSale[];
}
