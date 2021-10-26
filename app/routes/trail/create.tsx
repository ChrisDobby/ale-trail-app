import { LoaderFunction, MetaFunction, json, useLoaderData } from "remix";
import CreateTrail from "../../components/createTrail";

export const loader: LoaderFunction = () => {
    const stations = [
        "Batley",
        "Dewsbury",
        "Mirfield",
        "Huddersfield",
        "Slaithwaite",
        "Marsden",
        "Greenfield",
        "Stalybridge",
    ].map((name, index) => ({ id: index + 1, name }));

    return json({ stations });
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
