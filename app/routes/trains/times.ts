/* eslint-disable import/prefer-default-export */
import { json } from "remix";

export function loader({ request }: { request: Request }) {
    const search = request.url.slice(request.url.indexOf("?"));
    const searchParams = new URLSearchParams(search);
    const afterParam = searchParams.get("after");
    const after = afterParam ? new Date(afterParam) : new Date();
    const trainNumberParam = searchParams.get("trainNumber");
    const trainNumber = trainNumberParam ? Number(trainNumberParam) : 1;
    after.setHours(after.getHours() + trainNumber);
    return json({ dateTime: after.toISOString(), trainNumber });
}
