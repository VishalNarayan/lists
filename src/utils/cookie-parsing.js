/**
 * Method that searches for an authToken in cookies and returns the 
 * phone number embedded in the payload of the JWT value of the cookie.
 * 
 * Note: this method should not exist because it is bad practice to store 
 * sensitive info like phone numbers in the payload of the JWT. Because changing 
 * that strategy will involve a heavier change on the db schema, this is the 
 * temporary solution.
 * @param {any} cookies 
 * @returns phone number 
 */
export function getPhoneNumberFromCookies(cookies) {
    try {
        const token = cookies.get('authToken').value;
        const parsed = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const phone = parsed.phone;
        return phone;
    } catch (error) {
        console.log("Unable to parse phone number from JWT.");
        console.log(error);
        return null;
    }
}