module.exports = {
    first_name: {
        in: ["body"],
        isLength: {
            errorMessage: 'The field first_name must be between 3 and 50 characters.',
            options:{ min: 3, max: 50 }
        },
        matches: {
            options: {
                source: /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/
            },
            errorMessage: 'The field first_name not accepts numbers and special characters.',
        }
    },
    last_name: {
        in: ["body"],
        isLength: {
            errorMessage: 'The field first_name must be between 3 and 50 characters.',
        },
        matches: {
            options: {
                source: /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/
            },
            errorMessage: 'The field last_name not accepts numbers and special characters.',
        }
    },
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