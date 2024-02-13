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
}