

const hasChanged = (beforeData, afterData) => {
    // Helper function to compare values considering null
    function hasValueChanged(key) {
        const beforeValue = beforeData[key];
        const afterValue = afterData[key];
        console.log(`Key: ${key} =    Before: ${beforeValue} - After: ${afterValue}`);
        return (beforeValue !== afterValue) || (beforeValue === null && afterValue !== null) || (beforeValue !== null && afterValue === null);
    }

    // Check if any of the specified fields have changed
    return hasValueChanged("userName") || hasValueChanged("dob") || hasValueChanged("email") || hasValueChanged('profilePhoto');
}

const fcmHasChanged = (beforeData, afterData) => {
    // Helper function to compare values considering null
    function hasValueChanged(key) {
        const beforeValue = beforeData[key];
        const afterValue = afterData[key];
        console.log(`Key: ${key} =    Before: ${beforeValue} - After: ${afterValue}`);
        return (beforeValue !== afterValue) || (beforeValue === null && afterValue !== null) || (beforeValue !== null && afterValue === null);
    }

    // Check if any of the specified fields have changed
    return hasValueChanged("updatedAt");
}

module.exports = { hasChanged, fcmHasChanged }