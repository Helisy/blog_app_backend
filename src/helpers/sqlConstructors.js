function mySqlFilter(obj, customSqlFilter="", customSqlValidator=undefined){
    let filter = '';
    let orderFilter = '';
    let whereClause = '';

    if(customSqlFilter != ""){
        whereClause += customSqlFilter + " and ";
    }

    const keys = Object.keys(obj);

    for (const [key, value] of Object.entries(obj)) {
        
        if(!!customSqlValidator){
            const customSqlValidatorKeys = Object.keys(customSqlValidator);

            if(customSqlValidatorKeys.includes(key)){
                whereClause += `${!customSqlValidator[key].customKey ? key : customSqlValidator[key].customKey.replace("#key#", key)} ${!customSqlValidator[key].customValue ? value : customSqlValidator[key].customValue.replace("#value#", value)} AND `;
    
                continue;
            }
        }

        switch (key) {
            case "date_from":
                break;
            case "date_to":
                break;
            case "order":
                break;
            case "limit":
                break;
            default:
                whereClause += `${key} = ${value} AND `;
                break;
        }
    }

    whereClause = whereClause.slice(0, -5);

    if(keys.includes("date_from") && keys.includes("date_to")){
        whereClause.length < 1 ?  whereClause += `DATE(created_at) between '${obj.date_from}' and '${obj.date_to}'` : whereClause += `and DATE(created_at) between '${obj.date_from}' and '${obj.date_to}'`
        orderFilter += ` ORDER BY created_at`;
    }else if(keys.includes("date_from")){
        whereClause.length < 1 ?  whereClause += `DATE(created_at) = '${obj.date_from}'` :  whereClause += `and DATE(created_at) = '${obj.date_from}'`
        orderFilter += ` ORDER BY created_at`;
    }

    filter += whereClause;

    if(keys.includes("order") && keys.includes("date_from")){
        orderFilter = ` ORDER BY created_at ${obj.order}`;
    }else if(keys.includes("order")) {
        orderFilter = ` ORDER BY id ${obj.order}`;
    }

    if (keys.includes("limit")) {
        orderFilter += obj.limit == 'none' ? '' : ` LIMIT ${obj.limit}`;
    }else{
        orderFilter += ` LIMIT 100`;
    }

    filter = (whereClause.length > 0) ? `WHERE ${whereClause}${orderFilter};` : `${orderFilter};`;

    return filter;
}

function msySqlUpdateConstructor(table, id, obj, customSqlFilter="", customSqlValidator=undefined){
    let sql = `update ${table} set `

    for (const [key, value] of Object.entries(obj)) {
        if(!!customSqlValidator){
            const customSqlValidatorKeys = Object.keys(customSqlValidator);

            if(customSqlValidatorKeys.includes(key)){
                sql += `${!customSqlValidator[key].customKey ? key : customSqlValidator[key].customKey.replace("#key#", key)} = ${!customSqlValidator[key].customValue ? value : customSqlValidator[key].customValue.replace("#value#", value)}, `;
    
                continue;
            }
        }

        sql += `${key} = ?, `
    }

    sql = sql.slice(0, -2);
    !customSqlFilter ? sql += ` where id = ${id}` : sql += ` where id = ${id} and ${customSqlFilter}`

    return {sql: sql, values: Object.values(obj)}
}

module.exports = { mySqlFilter, msySqlUpdateConstructor };