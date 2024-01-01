const path = require("path");

module.exports = {
    entry: {
        background: "./src/background.js",
        content: "./src/content.js"
    },
    output: {
        path: path.resolve(__dirname, "addon/js"),
        filename: "[name].js"
    },
    mode: 'none',
};
