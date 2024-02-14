const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
module.exports = {
    search: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        isLength: {
            errorMessage: "The field 'isLength' must be between 6 and 255 characters.",
            options:{ min: 6, max: 255 }
        },
    },
    user_id: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => field == "current" ? true : Number.isInteger(parseInt(field)) && field > 0,
            errorMessage: "Field 'user_id' must be an interger or 'current'.",
        },
    },
}