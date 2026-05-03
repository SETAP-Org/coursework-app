// function to format time given from message in database (timestamp has to be of type timestamptz)
export function formatTime(timestamp) {
    const date = new Date(timestamp);
    const localDate = date.toLocaleString("en-UK", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const splitDate = localDate.split(", ")[0];
    const splitTime = localDate.split(", ")[1].split(":");
    const formattedTime = `${splitTime[0]}:${splitTime[1]}`;

    return {
        date: splitDate,
        time: formattedTime,
    }
}