import { Box, Fab, Grid, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Carousel } from "antd";
import axios from "axios";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { IMenuItem, IRestaurantDetail } from "../../features/customers/types";
import { GET_RESTAURANT_DETAIL, IMG_URL } from "../../service/customerApis";
import useWindowSize from "../../util/useWindowResize";
import MenuItemCard from "./components/MenuItemCard";
import RestaurantInfoCard from "./components/RestaurantInfoCard";
import { AiOutlineArrowUp } from "react-icons/ai";

const carouselStyle: React.CSSProperties = {
    color: "#fff",
    lineHeight: "${CAROUSEL_HEIGHT}px",
    textAlign: "center",
    zIndex: 2,
};

const yellowBadgeStyle: React.CSSProperties = {
    textAlign: "center",
    margin: "0 auto",
    fontFamily: "verdana",
    fontSize: "50px",
    color: "#333",
    display: "inline-block",
    padding: "10px 60px",
    backgroundColor: "#c6ff00",
    // boxShadow: "rgba(156, 204, 101, 0.2) 0px 0 25px 0px",
    border: "2px solid #333",
};

const renderBadge = (text: string) => (
    <div
        style={{
            display: "flex",
            margin: "30px auto 30px auto",
            height: "100px",
        }}
    >
        <p style={yellowBadgeStyle}>{text}</p>
    </div>
);

const scrollToTop: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    const anchor = document.querySelector("#main-anchor");
    if (!anchor) return;
    console.log(anchor.scrollTop);
    anchor.scrollTo({ top: 0, behavior: "smooth" });
};

const CustomersMain = () => {
    const { width: INNER_WIDTH, height: INNER_HEIGHT } = useWindowSize();
    const CAROUSEL_HEIGHT = INNER_HEIGHT * 0.65;
    const CARDS_PER_ROW = Math.floor((INNER_WIDTH * 0.85) / 320);

    const [restaurant, setRestaurant] = useState<IRestaurantDetail>();

    const fetchRestaurant = async () => {
        const rId = localStorage.getItem("rId");
        if (!rId) return;
        const { code, data } = await axios
            .get(GET_RESTAURANT_DETAIL(rId))
            .then((r) => r.data);
        if (code != 200) return;
        setRestaurant(data);
    };

    useEffect(() => {
        fetchRestaurant();
    }, []);

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowY: "scroll",
                }}
                id="main-anchor"
            >
                <Fab
                    color="primary"
                    sx={{
                        position: "absolute",
                        right: "5%",
                        bottom: "20%",
                        zIndex: "999",
                        fontSize: "30px",
                    }}
                    onClick={scrollToTop}
                >
                    <AiOutlineArrowUp />
                </Fab>
                <section
                    style={
                        {
                            ...sectionStyle,
                            backgroundImage: `url('/img/static/restWall.webp')`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "contain",
                            backgroundSize: "cover",
                        } as React.CSSProperties
                    }
                >
                    <Box
                        sx={{
                            position: "relative",
                            top: "50%",
                            left: "10%",
                            transform: "translate(0, -50%)",
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontFamily: "verdana",
                                width: "45%",
                                color: "#333",
                                fontWeight: "bold",
                                fontSize: "90px",
                            }}
                        >
                            Welcome to
                            <br></br>
                            {restaurant?.name ?? ""}
                        </Typography>
                    </Box>
                </section>
                <Stack sx={sectionStyle} direction="row">
                    <Box sx={aboutUsStyle}>
                        <RestaurantInfoCard info={restaurant} />
                    </Box>
                    <Box sx={{ width: "38.2%", height: "100%" }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontFamily: "verdana",
                                color: "#333",
                                fontWeight: "bold",
                                fontSize: "80px",
                                transform: "translate(0,-50%)",
                                position: "relative",
                                display: "block",
                                top: "50%",
                                textAlign: "center",
                            }}
                        >
                            About Us
                        </Typography>
                    </Box>
                </Stack>

                <section style={sectionStyle as React.CSSProperties}>
                    {/* Our Items */}
                    {renderBadge("Gallery")}
                    <Carousel
                        autoplay
                        effect="scrollx"
                        style={{
                            height: `${CAROUSEL_HEIGHT}px`,
                        }}
                    >
                        {restaurant &&
                            restaurant.img_urls.map(
                                (img_url: string, i: number) => {
                                    return (
                                        <div
                                            style={{
                                                ...carouselStyle,
                                                height: `${CAROUSEL_HEIGHT}px`,
                                            }}
                                            key={`carousel-${i}`}
                                        >
                                            <img
                                                src={img_url}
                                                alt=""
                                                style={{
                                                    width: "75%",
                                                    margin: "30px auto",
                                                    display: "block",
                                                    height: `${CAROUSEL_HEIGHT}px`,
                                                    zIndex: "1",
                                                }}
                                            ></img>
                                        </div>
                                    );
                                }
                            )}
                    </Carousel>
                </section>
                <section style={sectionStyle as React.CSSProperties}>
                    {renderBadge("Our Specials")}
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            padding: "30px",
                            marin: "0 auto",
                        }}
                    >
                        {restaurant &&
                            restaurant?.specials.map(
                                (item: IMenuItem, index: number) => {
                                    item.price = Number(item.price);
                                    if (index >= 10) return <></>;
                                    return (
                                        <Grid
                                            item
                                            xs={12 / CARDS_PER_ROW}
                                            key={"menuItem-" + index}
                                        >
                                            <MenuItemCard
                                                menuItem={item}
                                                readOnly={true}
                                            />
                                        </Grid>
                                    );
                                }
                            )}
                    </Grid>
                </section>
                {/* Google Map */}
                <section style={sectionStyle as React.CSSProperties}>
                    {renderBadge("Our Location")}
                    <div
                        style={{
                            width: "80%",
                            height: INNER_HEIGHT * 0.7,
                            margin: "30px auto",
                            padding: "30px",
                            display: "block",
                        }}
                    >
                        <iframe
                            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=unsw&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                            style={{ width: "100%", height: "100%" }}
                        ></iframe>
                    </div>
                </section>
            </Box>
        </>
    );
};

const sectionStyle: React.CSSProperties = {
    height: "calc(100vh - 64px)",
    overflowX: "hidden",
    width: "100%",
};

const aboutUsStyle = {
    width: "61.8%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `url('/img/static/fruits.jpeg')`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "contain",
    backgroundSize: "cover",
};

export default CustomersMain;
