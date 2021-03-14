const path = require("path");
// eslint-disable-next-line @typescript-eslint/naming-convention
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
    entry: {
        ["simple-rich-text"]: "./src/index.ts"
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        }]
    },
    resolve: {
        modules: [
            "node_modules",
            path.join(__dirname, "node_modules"),
        ],
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "simple-rich-text",
        umdNamedDefine: true,
        globalObject: "this"
    },
    mode: "production",
    plugins: [new CleanWebpackPlugin()],
    optimization: {
        minimize: true
    }
};
