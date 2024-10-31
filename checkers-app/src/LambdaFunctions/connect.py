import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')
client = boto3.client('apigatewaymanagementapi', endpoint_url='https://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/')

def lambda_handler(event, context):
    # Extract parameters
    game_id = event['queryStringParameters'].get('gameId')
    item_type = event['queryStringParameters'].get('itemType')
    username = event['queryStringParameters'].get('username')
    connection_id = event['requestContext']['connectionId']
    
    if item_type == "lobby":
        # Query the table using the GSI 'type-index' where 'itemType' equals 'lobby'
        response = table.query(
            IndexName='type-index',  # GSI with type as the partition key
            KeyConditionExpression='itemType = :itemType',
            ExpressionAttributeValues={':itemType': 'lobby'}
        )
        
        # Players currently waiting in the lobby
        players = response.get('Items', [])
        
        # Create a new lobby entry
        lobby_data = {
            'PK': "game-"+game_id,
            'hostId': connection_id,
            'itemType': "lobby",
            'username': username
        }
        table.put_item(Item=lobby_data)
        
        player_data = {
            'type': 'update-players',
            'data': [lobby_data]
        }
        
        # Let eveyone in the lobby know that a new player has joined
        for player in players:
            try:
                client.post_to_connection(ConnectionId=player['hostId'], Data=json.dumps(player_data).encode('utf-8'))
            except Exception as e:
                # Since $disconnect is "best effort", we need to handle the case where a player connection is no longer valid
                if 'GoneException' in str(e):
                    # Log issue
                    print(f"Connection {player['hostId']} is no longer valid.")

                    # Get player item
                    response = table.query(
                        IndexName='host-index',
                        KeyConditionExpression='hostId = :id',
                        ExpressionAttributeValues={':id': player['hostId']}
                    )

                    # Remove the player item
                    if 'Items' in response and response['Items']:
                        pk = response['Items'][0]['PK']
                        table.delete_item(Key={'PK': pk})
                else:
                    # Other errors
                    raise
        
    else:
        # Check if the game already exists
        response = table.get_item(Key={'PK': "game-"+game_id})
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
                'PK': "game-"+game_id,
                'hostId': connection_id,
                'hostUsername': '',
                'guestUsername': ''
            }
            table.put_item(Item=new_game)
        
    return {"statusCode": 200}