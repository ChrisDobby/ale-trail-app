import { LoaderFunction, MetaFunction, json, useLoaderData } from "remix";
import CreateTrail from "../../components/createTrail";
import trailStations from "../../stations";

export const loader: LoaderFunction = () => {
    return json({ stations: trailStations });
};

export const meta: MetaFunction = () => {
    return {
        title: "Create a new trail",
    };
};

export default function Create() {
    const { stations } = useLoaderData();

    return <CreateTrail stations={stations} />;
}
