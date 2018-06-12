export function populatePlugin(formats) {
    function populate (data, format) {
        let theFormat
        if (typeof format === 'function') {
            theFormat = format(data);
        } else {
            theFormat = format;
        }
        return JSON.parse(JSON.stringify(theFormat), (key, value) => {
            if (typeof value === 'string' && /^[_a-z0-9\-.]*$/i.test(value) && Object.keys(data).indexOf(value) !== -1) {
                return data[value]
            }
            return value;
        });
    }
    return {
        afterData(name, data) {
            if (formats[name]) {
                return Promise.resolve(populate(data, formats[name]));
            }
            return Promise.resolve(data);
        },
    };
}
export default populatePlugin;



const userFormat = {
    id: 'id',
    name: 'username',
};
const userList = function (data) {
    
};

const formats = {
    userById: userFormat,
    userByUsername: userFormat,
    getListByIds: userList,
    getFollows: userList,
};

client.addPlugin(populatePlugin(formats));
