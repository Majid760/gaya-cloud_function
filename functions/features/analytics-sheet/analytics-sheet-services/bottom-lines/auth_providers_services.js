const admin = require("firebase-admin");

/**
 * Fetches All the Providers Based Auth User Count
 * @returns {Promise<{email:int, phone:int, google:int, apple:int}} - A map containing the email, phone, google and apple user counts.
 */
const getProvidersBasedAuthUserAndUnverifiedUsersCountSheetRawData = async (chunkedUsers) => {
    try{
        const providersData = await _getProvidersBasedAuthUserCount();

        const unverifiedUsersData = await _getUnverifiedUsersCount(chunkedUsers);

        const rawData = await getAuthProviderBasedUserCountAndUnverifiedUsersCountGoogleSheetRawData(providersData, unverifiedUsersData);

        console.table(rawData); 

        return rawData;
    }
    catch(_){
        console.log("Error in getProvidersBasedAuthUserCount");
        console.log(_);
    }

}

const _getProvidersBasedAuthUserCount = async () => {
    
      let allUsers = [];
      try {
        let pageToken;
        do {
          const listUsersResult = await admin.auth().listUsers(1000, pageToken);
          allUsers = allUsers.concat(listUsersResult.users);
          pageToken = listUsersResult.pageToken;
        } while (pageToken);
        console.error('total users::', allUsers.length);
  
  
      } catch (error) {
        console.error('_getProvidersBasedAuthUserCount:', error);
      }
  
      try{

        // iterate all users and divide users according to their providers data
        let emailCount = 0;
        let phoneCount = 0;
        let googleCount = 0;
        let appleCount = 0;

        for (const user of allUsers) {
            const providerId = user.providerData[0].providerId;

            if(providerId === 'phone'){
                phoneCount++;
            }
            else if(providerId === 'google.com'){
                googleCount++;
            }
            else if(providerId === 'apple.com'){
                appleCount++;
            }
            else{
                emailCount++;
            }
        }
        return {emailCount:emailCount, phoneCount:phoneCount, googleCount:googleCount, appleCount:appleCount};
      }
      catch(_){
        console.error('_getProvidersBasedAuthUserCount:', _);
        return {email:0, phone:0, google:0, apple:0};
      }

}

const getAuthProviderBasedUserCountAndUnverifiedUsersCountGoogleSheetRawData = async (usersData, unverifiedUsersData) => {

      let headerRow = ['Auth Provider User Count', 'Email/Pass', 'Phone', 'Google', 'Apple'];

      let providersAuthCount = ['', usersData.emailCount, usersData.phoneCount, usersData.googleCount, usersData.appleCount];
      
      let usersFinalRawData = [];
  
      // set header row in final sheet raw data
      usersFinalRawData.push(headerRow);

      // set providers auth count in final sheet raw data
      usersFinalRawData.push(providersAuthCount);
      
      // extra empty rows
      usersFinalRawData.push([]);
      usersFinalRawData.push([]);
      
      // unverified users count
      let unverifiedUsersCountCount = ['Unverified User Count', unverifiedUsersData.unverifiedUsersCount];

      usersFinalRawData.push(unverifiedUsersCountCount);

      return usersFinalRawData;
  
  }

  const _getUnverifiedUsersCount = async (chunkedUsers) => {
    
    let allUsers = [];
        // save all firestore users into firestoreUsers array
        chunkedUsers.forEach(async (chunk) => {
    
          chunk.forEach((user) => {
            try {
    
              const userData = user.data();
              allUsers.push({
                id: user.id,
                ...userData,
              });
    
            } catch (_) {
              console.log("Error occured at _getUnverifiedUsersCount(): " + _);
            }
          });
    
        });

    try{

      // filter allUsers and check if user is verified or not by looking into interest field
        const unverifiedUsers = allUsers.filter((user) => {
            return user.interests === undefined || user.interests === null || user.interests.length === 0;
          });
          console.error('unverifiedUsers:', unverifiedUsers.length);


      
      return {unverifiedUsersCount: unverifiedUsers.length || 0};
    }
    catch(_){
      console.error('_getUnverifiedUsersCount:', _);
      return {unverifiedUsersCount:0};
    }

}

module.exports = {
    getProvidersBasedAuthUserAndUnverifiedUsersCountSheetRawData
}