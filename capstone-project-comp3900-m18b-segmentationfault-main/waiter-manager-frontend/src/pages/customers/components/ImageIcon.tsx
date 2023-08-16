interface ImageIconProps {
    src: string;
}

export const ImageIcon = (props: ImageIconProps) => (
    <img
        src={props.src}
        alt=""
        crossOrigin=""
        style={{
            width: "50px",
            height: "50px",
            borderRadius: "25px",
            margin: "auto 10px auto 0",
            display: "block",
            boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.3)",
            userSelect: "none",
        }}
    />
);
