import { Col, Row, Typography } from "antd";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import React, { useEffect, useState } from "react";
import { BiCategory } from "react-icons/bi";
import { BsCashCoin, BsFillPersonFill } from "react-icons/bs";
import { GiCook, GiRoundTable } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { MdFastfood, MdOutlineStickyNote2 } from "react-icons/md";
import { GET_SALES_DATA } from "../../../../service/managerApis";
import useWindowSize from "../../../../util/useWindowResize";
import BasicInfoCard from "../components/BasicInfoCard";
import {
    getSalesByCategoriesOption,
    getSalesChartOption,
    getWeeklyOption,
    IData,
} from "./chartOptions";

const SalesReport = () => {
    const { width: innerWidth } = useWindowSize();
    var COLS_PER_ROW = 4;
    if (innerWidth < 1780) COLS_PER_ROW = 3;
    if (innerWidth < 1350) COLS_PER_ROW = 2;
    if (innerWidth < 1000) COLS_PER_ROW = 1;
    const span = 24 / COLS_PER_ROW;

    // State
    const [reportData, setReportData] = useState<IData>();

    useEffect(() => {
        const fetchData = async () => {
            const { code, data } = await axios
                .get(GET_SALES_DATA, {
                    params: {
                        r_id: Number(localStorage.getItem("rId")),
                    },
                })
                .then((r) => r.data);
            if (code != 200) return;
            setReportData(data);
        };
        fetchData();
    }, []);
    if (innerWidth < 1) return <></>;
    return (
        <div style={{ height: "100%" }}>
            <Typography.Title style={{ textAlign: "center" }}>
                {`Restaurant: ${reportData?.restaurant_name ?? ""}`}
            </Typography.Title>
            {/* OVERVIEW */}
            <Typography.Title>Overview</Typography.Title>
            <Row style={{ marginBottom: "10px" }}>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<HiUserGroup />}
                        title="Total Customers"
                        dataText={Number(
                            reportData?.total_customers ?? 0
                        ).toLocaleString("en-US")}
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<MdOutlineStickyNote2 />}
                        title="Total Items Cooked"
                        dataText={Number(
                            reportData?.total_items_cooked ?? 0
                        ).toLocaleString("en-US")}
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<BsCashCoin />}
                        title="Total Income"
                        dataText={
                            "$" +
                            Number(
                                reportData?.total_income ?? 0
                            ).toLocaleString("en-US")
                        }
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<BsFillPersonFill />}
                        title="Customer Average Cost"
                        dataText={
                            "$" +
                            Number(
                                reportData?.customer_average_cost ?? 0
                            ).toLocaleString("en-US")
                        }
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<BiCategory />}
                        title="Total Categories"
                        dataText={"" + (reportData?.total_categories ?? "0")}
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<MdFastfood />}
                        title="Total Dishes"
                        dataText={"" + (reportData?.total_dishes ?? "0")}
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<GiRoundTable />}
                        title="Total Tables"
                        dataText={"" + (reportData?.total_tables ?? "0")}
                        width="95%"
                    />
                </BasicInfoWrapper>
                <BasicInfoWrapper span={span}>
                    <BasicInfoCard
                        icon={<GiCook />}
                        title="Total Staff"
                        dataText={"" + (reportData?.total_staff ?? "0")}
                        width="95%"
                    />
                </BasicInfoWrapper>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
                {/* Total Income By Month */}
                <Col span={innerWidth > 1300 ? 15 : 24}>
                    <Typography.Title>Total Sales By Month</Typography.Title>
                    <div>
                        <ReactECharts
                            option={getSalesChartOption(
                                reportData?.annual_sales ?? []
                            )}
                            style={{ height: "600px" }}
                        />
                    </div>
                </Col>
                {/* SALES BY CATEGORIES */}
                <Col span={innerWidth > 1300 ? 9 : 24}>
                    <Typography.Title>Sales By Categories</Typography.Title>
                    <div>
                        <ReactECharts
                            option={getSalesByCategoriesOption(
                                reportData?.sales_by_categories ??
                                    new Array(1).fill(1)
                            )}
                            style={{ height: "600px" }}
                        />
                    </div>
                </Col>
            </Row>
            <Row style={{ marginBottom: "20px" }}>
                {/* WEEKLY CUSTOMERS */}
                <Col span={24}>
                    <Typography.Title>Weekly Customers</Typography.Title>
                    <div>
                        <ReactECharts
                            option={getWeeklyOption(
                                reportData?.customers_weekly ??
                                    new Array(7).fill(1)
                            )}
                            style={{ height: "550px" }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

interface BasicInfoWrapperProps {
    span: number;
}

const BasicInfoWrapper = (
    props: React.PropsWithChildren<BasicInfoWrapperProps>
) => (
    <Col
        span={props.span}
        style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0",
        }}
    >
        {props.children}
    </Col>
);

export default SalesReport;
