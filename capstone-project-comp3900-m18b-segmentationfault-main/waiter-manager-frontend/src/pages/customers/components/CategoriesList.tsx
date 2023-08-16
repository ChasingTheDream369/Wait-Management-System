import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
} from "@mui/material";
import { ICategory } from "../../../features/customers/types";

interface CategoryListProps {
    cats: ICategory[];
    catId: number;
    selectedKey: number;
    handleClickCategory: (catId: number) => void;
    handleClickMain: () => void;
}

export const CategoriesList = (props: CategoryListProps) => {
    const { cats, catId, handleClickCategory, handleClickMain, selectedKey } =
        props;

    return (
        <List disablePadding sx={listStyle}>
            <ListItem
                sx={{
                    padding: 0,
                }}
            >
                <Button
                    variant="contained"
                    sx={mainMenuStyle}
                    onClick={handleClickMain}
                >
                    MAIN
                </Button>
            </ListItem>
            <List
                disablePadding
                sx={{
                    overflow: "auto",
                    height: "calc(100% - 160px)",
                }}
            >
                {cats.length > 0 &&
                    cats.map((cat, index) => (
                        <Box key={"cat-" + index}>
                            <ListItem
                                disablePadding
                                sx={{
                                    minHeight: `125px`,
                                    boxSizing: "content-box",
                                }}
                            >
                                <ListItemButton
                                    sx={catButtonStyle(cat, catId)}
                                    onClick={() => handleClickCategory(cat.id)}
                                    selected={cat.id == selectedKey}
                                >
                                    <p
                                        style={{
                                            fontFamily: "Anton",
                                            fontWeight: "bold",
                                            color: "#333",
                                            margin: "0",
                                            height: "125px",
                                            display: "block",
                                        }}
                                    >
                                        {cat.name}
                                    </p>
                                </ListItemButton>
                            </ListItem>
                            {index < cats.length - 1 && (
                                <Divider
                                    sx={{
                                        margin: "0 20px",
                                    }}
                                />
                            )}
                        </Box>
                    ))}
            </List>
        </List>
    );
};

const listStyle = {
    overflow: "auto",
    height: "100%",
    boxShadow: "0 0px 7px -5px #333 inset",
};

const mainMenuStyle = {
    height: "160px",
    backgroundColor: "#c6ff00",
    margin: "0 auto",
    borderRadius: 0,
    padding: 0,
    color: "#333",
    fontFamily: "Anton",
    fontWeight: "bold",
    width: "100%",
    fontSize: "60px",
    transition: "all 0.15s ease-out",
    ":hover": {
        backgroundColor: "#ffff66",
        fontSize: "68px",
    },
};

const catButtonStyle = (cat: ICategory, catId: number) => ({
    display: "flex",
    height: "100%",
    justifyContent: "center",
    transition: "all 0.15s ease-out",
    fontSize: "30px",
    lineHeight: "125px",
    ":hover": {
        fontSize: "32px",
    },
    textTransform: "uppercase",
    backgroundColor: cat.id === catId ? "#eee" : "#fff",
});
