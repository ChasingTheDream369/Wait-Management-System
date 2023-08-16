import React from "react";

interface IWallPaperProps {
    src: string;
}

const WallPaper = (props: IWallPaperProps) => {
    return (
        <div
            style={{
                ...wallPaperStyle,
                backgroundImage: `url('${props.src}')`,
            }}
        ></div>
    );
};

const wallPaperStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    margin: "0 auto",
    padding: "0",
    zIndex: "-1024",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "contain",
    backgroundSize: "cover",
};

export default WallPaper;
