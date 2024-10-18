import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')

def lambda_handler(event, context):
    # Query the table using the GSI 'type-index' where 'itemType' equals 'lobby'
    response = table.query(
        IndexName='type-index',  # GSI with type as the partition key
        KeyConditionExpression='itemType = :itemType',
        ExpressionAttributeValues={':itemType': 'lobby'}
    )
    
    # Sets players to an empty list if no players in the lobby
    players = response.get('Items', [])
    
    # Return the list of players in the lobby
    return {
        "statusCode": 200,
        "body": json.dumps(players),
        "headers": {
            "Content-Type": "application/json"
        }
    }
