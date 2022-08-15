function getDataAutofill(data) {
    let updateResponse = {};

    // Example: switch logic based on operation
    switch(data.operation) {
        case 'newBusiness':
            // logic to augment update response
            break;
        case 'endorsement':
            // logic to augment  update response
            break;
        case 'renewal':
            // logic to augment update response
            break;
        default:
            throw `Unrecognized operation ${data.operation}`;
    }

    return updateResponse;
}

module.exports = {
    getDataAutofill
}