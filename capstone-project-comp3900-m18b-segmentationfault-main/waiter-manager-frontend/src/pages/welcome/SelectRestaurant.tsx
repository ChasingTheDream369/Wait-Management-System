import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { IRestaurant } from "../../features/customers/types";
import { GET_RESTAURANTS } from "../../service/customerApis";

const selectRestaurant = (props: any) => {
    const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);

    useEffect(() => {
        const fetchRestaurant = async () => {
            axios.get(GET_RESTAURANTS).then((res) => {
                const { code, data } = res.data;
                if (code != 200) return;
                setRestaurants(data);
            });
        };
        fetchRestaurant();
    }, []);

    /* Select Restaurant */
    return (
        <FormControl
            fullWidth
            required
            sx={{
                m: "25px 0",
            }}
        >
            <InputLabel id="restaurant_selection">Restaurant</InputLabel>
            <Select
                id="selectRestaurant"
                value={props.selected}
                label="Restaurant *"
                onChange={(e: SelectChangeEvent<IRestaurant>) => {
                    props.setSelected(e.target.value);
                }}
            >
                {restaurants.map((res: IRestaurant) => (
                    <MenuItem key={"res-" + res.id} value={res.id}>
                        {res.name}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>Select One(Required)</FormHelperText>
        </FormControl>
    );
};

export default selectRestaurant;
