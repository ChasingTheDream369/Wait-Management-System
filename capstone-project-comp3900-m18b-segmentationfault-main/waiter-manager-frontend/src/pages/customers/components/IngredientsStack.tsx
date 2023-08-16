import { Chip } from "@mui/material";
import { Stack, style } from "@mui/system";
import { useEffect, useMemo } from "react";
import throttle from "lodash/throttle";

const handleWheel = (e: WheelEvent) => {
    const ele = document.getElementById("ingredients-stack");
    if (!ele || Math.abs(e.deltaY) < 1) return;
    ele.scrollBy({
        left: Math.sign(e.deltaY) * 80,
        behavior: "smooth",
    });
};

const handleWheelThrottled = throttle(handleWheel, 100);

interface IngredientsStackProps {
    ingredients: string[];
    style?: any;
}

const IngredientsStack = (props: IngredientsStackProps) => {
    const { ingredients } = props;
    const randStart = useMemo(
        () => Math.floor(Math.random() * colorWheel.length),
        []
    );
    useEffect(() => {
        const ele = document.getElementById("ingredients-stack");
        if (!ele) return;
        ele.addEventListener("wheel", handleWheelThrottled);
        return () => {
            const ele = document.getElementById("ingredients-stack");
            if (!ele) return;
            ele.removeEventListener("wheel", handleWheelThrottled);
        };
    }, [ingredients]);

    return (
        <Stack
            direction="row"
            marginBottom="10px"
            sx={{ overflowX: "scroll", ...style }}
            id="ingredients-stack"
        >
            {ingredients &&
                ingredients.map((name: string, i: number) => (
                    <Chip
                        key={`ingredient-${i}`}
                        label={
                            name.slice(0, Math.min(name.length, 12)) +
                            (name.length > 12 ? "..." : "")
                        }
                        sx={{
                            ...chipStyle,
                            backgroundColor:
                                colorWheel[(randStart + i) % colorWheel.length],
                        }}
                        variant="filled"
                    />
                ))}
        </Stack>
    );
};
const chipStyle = {
    margin: "5px 3px",
    color: "#eee",
    fontSize: "20px",
    padding: "5px",
    fontWeight: "bold",
    boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 5px",
};

const colorWheel = [
    "#f44336",
    "#ff9800",
    "#ffc107",
    "#4caf50",
    "#03a9f4",
    "#e91e63",
    "#e91e63",
];

export default IngredientsStack;
