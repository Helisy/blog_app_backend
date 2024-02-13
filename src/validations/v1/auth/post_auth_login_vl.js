module.exports = {
    email: {
        in: ["body"],
        isEmail: {
            errorMessage: 'The field email must be a valid email.',
        },
    },
    password: {
        in: ["body"],
        isLength: {
            errorMessage: 'The field password must be between 3 and 50 characters.',
            options:{ min: 3, max: 30 }
        },
    }
}