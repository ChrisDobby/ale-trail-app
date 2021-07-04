import type { MetaFunction, LinksFunction } from "remix";
import { Link } from "remix";

export let meta: MetaFunction = () => {
    return {
        title: "Ale trail planner",
        description: "Welcome to the ale trail planner",
    };
};

export default function Index() {
    return (
        <div className="text-center p-5">
            <h1 className="text-blue-700 text-3xl">The ale trail planner</h1>
            <h2 className="text-xl">Coming soon...</h2>
            <p>
                <Link className="underline text-blue-400 text-sm mb-2 mt-2" to="/two">
                    Here's another page
                </Link>
            </p>
            <p>
                <a className="underline text-blue-400 text-sm" href="https://github.com/chrisdobby/ale-trail-app">
                    ale-trail-app repo
                </a>
            </p>
        </div>
    );
}
