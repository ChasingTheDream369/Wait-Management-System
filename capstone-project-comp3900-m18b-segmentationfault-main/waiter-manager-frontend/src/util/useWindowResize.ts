import { useLayoutEffect, useState } from "react";

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        const onWindowResize = () =>
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });

        window.addEventListener("resize", onWindowResize);
        // Call once on default
        onWindowResize();
        // Destructor
        return () => window.removeEventListener("resize", onWindowResize);
    }, []);
    return windowSize;
};


export const REF_WIDTH = 2560;
export const REF_HEIGHT = 1289;

export default useWindowSize;
