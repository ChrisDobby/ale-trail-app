import { json } from "remix";

export function loader() {
    return json({ dateTime: new Date().toISOString() });
}
