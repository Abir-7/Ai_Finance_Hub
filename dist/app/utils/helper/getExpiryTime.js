const getExpiryTime = (minutes = 10) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes); // Add 10 minutes to the current time
    return now;
};
export default getExpiryTime;
