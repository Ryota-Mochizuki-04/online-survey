const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    const client = new DynamoDBClient({ region: "ap-northeast-1" });
    const TABLE_NAME = "tenma-online-something";

    let userName, responses;
    try {
        ({ userName, responses } = JSON.parse(event.body));
    } catch (parseError) {
        console.error("Error parsing event body", parseError);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Invalid request body' }),
        };
    }

    const timestamp = new Date().toISOString();
    const yearMonth = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

    const item = {
        Id: { S: uuidv4() },  // プライマリキーとしてIdを設定
        yearMonth: { S: yearMonth },
        userName: { S: userName },
        responses: { S: JSON.stringify(responses) },
        timestamp: { S: timestamp }
    };

    const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: item
    });

    try {
        await client.send(command);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Data saved successfully' }),
        };
    } catch (error) {
        console.error("Error saving to DynamoDB", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: 'Failed to save data', error: error.message }),
        };
    }
};
