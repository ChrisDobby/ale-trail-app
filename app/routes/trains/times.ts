/* eslint-disable import/prefer-default-export */
import { json } from "remix";
import { getTimeOfNextTrain } from "../../utils";
import { StationId } from "../../types";

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
    const trainNumber = trainNumberParam ? Number(trainNumberParam) : null;
    const timeAndNumber = getTimeOfNextTrain(
        Number(fromParam) as StationId,
        Number(toParam) as StationId,
        afterParam,
        trainNumber,
    );

    return json(timeAndNumber);
}
