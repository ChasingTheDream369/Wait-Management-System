import { motion } from "framer-motion";
import React, { useState } from "react";
import useWindowSize, { REF_WIDTH } from "../../../../util/useWindowResize";

interface BasicInfoCardProps {
    icon: React.ReactNode;
    title: string;
    dataText: string;
    style?: React.CSSProperties;
    width?: string;
}

const BasicInfoCard = (props: BasicInfoCardProps) => {
    const { icon, title, dataText, width } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            style={{
                ...wrapperStyle(isHovered, props.style, width),
            }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                setIsHovered(true);
            }}
            onMouseLeave={(e) => {
                e.stopPropagation();
                setIsHovered(false);
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 100 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
            }}
        >
            <div style={iconWrapperStyle}>
                <div style={iconStyle(isHovered) as React.CSSProperties}>
                    {icon}
                </div>
            </div>
            <div style={infoStyle}>
                <p style={dataStyle(isHovered)}>{dataText ?? ""}</p>
                <p style={titleStyle(isHovered) as React.CSSProperties}>
                    {title}
                </p>
            </div>
        </motion.div>
    );
};

const WIDTH = 320;
const HEIGHT = 160;
const BLUE = "#1890ff";

const wrapperStyle = (
    isHovered: boolean,
    customStyle: React.CSSProperties | undefined,
    width: string | undefined
) => {
    var style: React.CSSProperties = {
        minWidth: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        boxShadow: isHovered
            ? "rgba(0, 0, 0, 0.3) 0px 3px 15px"
            : "rgba(0, 0, 0, 0.1) 0px 3px 5px",
        borderRadius: "30px",
        backgroundColor: isHovered ? BLUE : "#fff",
        display: "flex",
    };
    if (customStyle !== undefined) {
        style = Object.assign(style, customStyle);
    }
    if (width !== undefined) {
        style.width = width;
    }
    return style;
};

const iconWrapperStyle: React.CSSProperties = {
    textAlign: "center",
    width: `${HEIGHT - 20}px`,
    height: `${HEIGHT}px`,
    padding: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const iconStyle = (isHovered: boolean) => ({
    padding: "30px",
    borderRadius: "30px",
    backgroundColor: isHovered ? "#fff" : BLUE,
    fontSize: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isHovered ? "#333" : "#fff",
    userSelect: "none",
});

const infoStyle: React.CSSProperties = {
    width: "100%",
    height: `${HEIGHT - 60}px`,
    margin: "30px 20px 0 0",
    padding: "0",
};

const dataStyle = (isHovered: boolean) => ({
    width: "100%",
    height: `50%`,
    margin: "0",
    padding: "0",
    fontSize: "38px",
    fontWeight: "bold",
    color: isHovered ? "#fff" : "#333",
    paddingTop: "5px",
});

const titleStyle = (isHovered: boolean) => ({
    width: "100%",
    height: `50%`,
    padding: "0",
    margin: "0",
    fontSize: "18px",
    color: isHovered ? "#fff" : "#999",
    userSelect: "none",
    paddingTop: "25px",
});

export default BasicInfoCard;
