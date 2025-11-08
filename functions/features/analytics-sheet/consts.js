// Set the initial starting date to September 6, 2023
const initialCCDate = new Date('2023-09-06');

const initialFirestorePostDate = new Date('2023-09-14');

const fixedCalendarStartDate = new Date('2023-09-03');

const initialGCPMessagesDate = new Date('2023-10-29');

const initialOpenAppCohortDate = new Date('2023-10-20');

const initialTwentyOneWeekCohortDate = new Date('2023-08-15');


let _lazyAllFirestoreUsers;
let _lastLazyAllFirestoreUsersFetchedDate;

const getAllFirestoreUsers = async () => {
    
    const isCacheInValidated = (date) => {
        if(!date) return false;
        const currentDate = new Date();
        return date.getDate() === currentDate.getDate() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
    }

    if (!_lazyAllFirestoreUsers && !isCacheInValidated(_lastLazyAllFirestoreUsersFetchedDate)) {
        // console.log(`----> inside if <-----`);
        const { getAllUsers } = require('../../common/user_services.js');
        _lazyAllFirestoreUsers = await getAllUsers();
        _lastLazyAllFirestoreUsersFetchedDate = new Date();
    }
    else{
    // console.log(`----> inside else <-----`);
    }

    return _lazyAllFirestoreUsers;
}

module.exports = {
    initialCCDate,
    initialFirestorePostDate,
    fixedCalendarStartDate,
    initialGCPMessagesDate,
    initialOpenAppCohortDate,
    initialTwentyOneWeekCohortDate,
    getAllFirestoreUsers,

}