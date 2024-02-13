const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
module.exports = {
    date_from: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => dateFormat.test(field),
            errorMessage: "The 'date_from' field must follow the 'yyyy-mm-dd' pattern.",
        },
        toDate: false,
    },
    date_to: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => dateFormat.test(field),
            errorMessage: "The 'date_to' field must follow the 'yyyy-mm-dd' pattern.",
        },
        toDate: false,
    },
    order: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        isIn:{
            options: [["asc", "desc"]],
            errorMessage: "Field 'order' accepts 'asc' or 'desc'.",
        }
    },
    limit: {
        in: ["query"],
        optional: {
            options: {
             nullable: true,
            }
        },
        custom: {
            options: (field) => field == "none" ? true : Number.isInteger(parseInt(field)) && field > 0,
            errorMessage: "Field 'limit' must be an interger or 'none'.",
        },
    },
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