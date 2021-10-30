/* eslint-disable import/prefer-default-export */
import { json } from "remix";
import { getTimeOfNextTrain } from "../../utils";

export function loader({ request }: { request: Request }) {
    const search = request.url.slice(request.url.indexOf("?"));
    const searchParams = new URLSearchParams(search);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const afterParam = searchParams.get("after");

    if (!fromParam || !toParam || !afterParam) {
        return json(null, { status: 400 });
    }

    const trainNumberParam = searchParams.get("trainNumber");
    const trainNumber = trainNumberParam ? Number(trainNumberParam) : 1;
    const dateTime = getTimeOfNextTrain(Number(fromParam), Number(toParam), afterParam, trainNumber);
    return json({ dateTime, trainNumber });
}
