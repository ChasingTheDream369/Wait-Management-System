import React from "react";

interface StaffLogoProps {
    height?: string;
    type?: "dark" | "white";
}

const StaffLogo = ({ height, type }: StaffLogoProps) => {
    let SRC = "/img/static/logo-white.png";
    if (type === "dark") {
        SRC = "/img/static/logo-black.png";
    }
    return (
        <div
            style={{
                width: "100%",
                height: height ?? "120px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "30px auto 0 auto",
            }}
        >
            <img
                src={SRC}
                style={{
                    height: "100px",
                    display: "blcok",
                    margin: "0 auto",
                }}
            ></img>
        </div>
    );
};

export default StaffLogo;
