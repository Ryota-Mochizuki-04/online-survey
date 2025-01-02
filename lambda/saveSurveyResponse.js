const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    const client = new DynamoDBClient({ region: "ap-northeast-1" });
    const TABLE_NAME = "tenma-online-something";

    const { userName, responses } = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    const item = {
        id: { S: uuidv4() },
        userName: { S: userName },
        timestamp: { S: timestamp },
        responses: { S: JSON.stringify(responses) }
    };

    const command = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: item
    });

    try {
        await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully' }),
        };
    } catch (error) {
        console.error("Error saving to DynamoDB", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save data' }),
        };
    }
};
