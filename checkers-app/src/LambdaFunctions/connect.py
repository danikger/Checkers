import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')
client = boto3.client('apigatewaymanagementapi', endpoint_url='https://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/')

def lambda_handler(event, context):
    # Extract parameters
    game_id = event['queryStringParameters'].get('gameId')
    connection_id = event['requestContext']['connectionId']

    # Check if the game already exists
    response = table.get_item(Key={'gameId': game_id})
    existing_game = response.get('Item')

    if existing_game:
        # Check if guestId already exists. If it does, it means the lobby is full and another player is trying to connect
        if 'guestId' in existing_game:
            return {"statusCode": 400, "body": json.dumps({"message": "Game already has the maximum amount of players."})}

        # Update the game to include the guestId if it exists
        existing_game['guestId'] = connection_id
        table.put_item(Item=existing_game)
        
        # client.post_to_connection(ConnectionId=existing_game['hostId'], Data=json.dumps({'type': 'start', 'message': ''}).encode('utf-8'))
    else:
        # Create a new game entry with the hostId since it doesn't exist
        new_game = {
            'gameId': game_id,
            'hostId': connection_id,
        }
        table.put_item(Item=new_game)
        
    return {"statusCode": 200}