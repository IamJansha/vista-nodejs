module.exports = {
    info: data => console.log(`\x1b[36m[INFO] ${data}\x1b[0m`),
    error: data => console.error(`\x1b[31m[ERROR] ${data}\x1b[0m`),
};
