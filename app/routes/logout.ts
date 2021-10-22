import { LoaderFunction } from "remix";
import { logout } from "../authentication";

export const loader: LoaderFunction = ({ request }) => logout(request);

export default function Logout() {
    return null;
}
