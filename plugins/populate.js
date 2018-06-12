export function populatePlugin(formats) {
    function populate (data, format) {
        return JSON.parse(JSON.stringify(format), (key, value) => {
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
};

const formats = {
    userById: userFormat,
    userByUsername: userFormat,
};

client.addPlugin(populatePlugin(formats));
