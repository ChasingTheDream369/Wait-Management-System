import React, { useEffect, useRef } from "react";
import useWindowSize from "../../../util/useWindowResize";

const COLORS = [
    "rgba(132, 255, 255, 0.9)",
    "rgba(0, 229, 255, 0.4)",
    "rgba(64, 196, 255, 0.4)",
];

const PaymentCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const windowSize = useWindowSize();

    // Init
    useEffect(() => {
        initCanvas(canvasRef);
    }, []);

    // Resize
    useEffect(() => {
        canvasRef.current != null && handleResize(canvasRef.current);
    }, [windowSize]);

    return <canvas ref={canvasRef} style={canvasStyle}></canvas>;
};

const handleResize = (canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
};

const FPS = 60;
var ctx: CanvasRenderingContext2D;
var canvas: HTMLCanvasElement;
var time = 0;

const PERIOD = 3 * Math.PI;
const wave = (t: number) => {
    return 120 * Math.sin(t) + 200 + 150 * Math.cos(t + PERIOD / 4);
};

const initCanvas = (
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
) => {
    if (!canvasRef || !canvasRef.current) return;

    canvas = canvasRef.current;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    // Call resize
    handleResize(canvas);
    // Init waves

    // Render
    render();
};

const render = () => {
    time += 1 / FPS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS[0];
    ctx.strokeStyle = COLORS[0];
    drawWave(time, 0.5);
    ctx.fillStyle = COLORS[1];
    ctx.strokeStyle = COLORS[1];
    drawWave(time + 3, 0.8);
    ctx.fillStyle = COLORS[2];
    ctx.strokeStyle = COLORS[2];
    drawWave(time + 6, 1);
    setTimeout(() => {
        requestAnimationFrame(render);
    }, 1000 / FPS);
};

const drawWave = (time: number, speed = 1) => {
    ctx.beginPath();
    const { innerHeight: height, innerWidth: width } = window;
    ctx.moveTo(0, height);
    for (let i = 0; i < width + 80; i += 40) {
        const t = (i / width) * PERIOD + time * 0.5 * speed;
        const h = wave(t);
        ctx.lineTo(i, height - h - height / 4);
    }
    ctx.lineTo(width, height);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
};

const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    zIndex: 33,
};

export default PaymentCanvas;
