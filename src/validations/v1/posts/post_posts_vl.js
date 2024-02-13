module.exports = {
    title: {
        in: ["body"],
        isLength: {
            errorMessage: "The field 'title' must be between 6 and 255 characters.",
            options:{ min: 6, max: 255 }
        },
    },
    content: {
        in: ["body"],
        isLength: {
            errorMessage: "The field 'content' must be between 30 and 50000 characters.",
            options:{ min: 30, max: 50000 }
        },
    }
}