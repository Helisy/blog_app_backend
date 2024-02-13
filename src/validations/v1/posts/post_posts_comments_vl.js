module.exports = {
    content: {
        in: ["body"],
        isLength: {
            errorMessage: "The field 'content' must be between 30 and 50000 characters.",
            options:{ min: 1, max: 255 }
        },
    }
}