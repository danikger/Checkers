import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')
client = boto3.client('apigatewaymanagementapi', endpoint_url="https://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/")

def lambda_handler(event, context):
    # Extract parameters
    message = json.loads(event['body'])['message']
    game_id = message['gameId']
    connection_id = event['requestContext']['connectionId']

    # Retrieve the game entry
    response = table.get_item(Key={'gameId': game_id})
    existing_game = response.get('Item')
    
    receiving_user = None
    
    if message['type'] == 'start':
        receiving_user = existing_game['hostId']
    else: 
        if connection_id == existing_game['hostId']:
            receiving_user = existing_game['guestId']
        elif connection_id == existing_game['guestId']:
            receiving_user = existing_game['hostId']
        
    # Send the message to intended recipient
    client.post_to_connection(ConnectionId=receiving_user, Data=json.dumps(message).encode('utf-8'))
    
    return {"statusCode": 200}