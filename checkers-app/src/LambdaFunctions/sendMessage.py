import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')
client = boto3.client('apigatewaymanagementapi', endpoint_url="https://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/")

def notify_lobby(message):
    response = table.query(
        IndexName='type-index',
        KeyConditionExpression='itemType = :itemType',
        ExpressionAttributeValues={':itemType': 'lobby'}
    )
    for player in response.get('Items', []):
        send_to_connection(player['hostId'], message)

def send_to_connection(connection_id, message_data):
    client.post_to_connection(ConnectionId=connection_id, Data=json.dumps(message_data).encode('utf-8'))

def remove_player_from_lobby(player_host_id):
    response = table.query(
        IndexName='host-index',
        KeyConditionExpression='hostId = :id',
        ExpressionAttributeValues={':id': player_host_id}
    )

    if 'Items' in response and response['Items']:
        pk = response['Items'][0]['PK']
        table.delete_item(Key={'PK': pk})

def lambda_handler(event, context):
    # Extract parameters
    data = json.loads(event['body'])['data']
    connection_id = event['requestContext']['connectionId']
    game_id = data['gameId']

    # Retrieve the game entry
    response = table.get_item(Key={'PK': "game-"+game_id})
    existing_game = response.get('Item', [])
    
    receiving_user = None
    
    if data['type'] == 'start':
        # Check if there is an item for the game, and chack if the user is trying to start an actual game.
        # For example: user entered random gameId that doesnt exist. Gotta handle that
        if existing_game:
            receiving_user = existing_game['hostId']

            # Check if hostId matches connectionId.
            # If it does match, it means the game that the user is trying to start doesn't exist
            if existing_game['hostId'] == connection_id:
                data = {'type': 'invalid-game'}
        else:
            # No existing game item, send invalid game message back
            receiving_user = connection_id
            data = {'type': 'invalid-game'}
        
    elif data['type'] == 'lobby-invite':
        receiving_user = data['data']['guestData']['hostId']

        # Put 2 new items that will overwrite the items of the host and guest
        # New host item
        host_item = {
            'PK': "game-"+game_id,
            'hostId': connection_id,
            'username': data['data']['hostData']['username']
        }
        
        # New guest item
        guest_item = {
            'PK': data['data']['guestData']['PK'],
            'hostId': receiving_user,
            'username': data['data']['guestData']['username']
        }
        
        # Put the new items, overwriting the old ones that have 'itemType' as 'lobby'. Won't show up in lobby anymore.
        table.put_item(Item=host_item)
        table.put_item(Item=guest_item)
        
        # Data to send to the receiving user (invites them)
        data = {
            'type': 'lobby-invite',
            'data': {
                'PK': "game-"+game_id,
                'hostId': connection_id,
                'username': data['data']['hostData']['username']
            }
        }

        # Let everyone know to update the lobby
        notify_lobby({'type': 'update-players', 'data': [host_item, guest_item]})

    elif data['type'] == 'lobby-invite-accepted':
        # Remove guest item from DB and overwrite host item with hostId and guestId

        receiving_user = data['data']['hostId']
        data = {
            'type': 'start'
        }
        
        # Delete guest DB item
        remove_player_from_lobby(connection_id)
        
        # Overwrite the host item with hostId and guestId (this will be the item used for managing the game)
        game_data = {
            'PK': "game-"+game_id,
            'hostId': receiving_user,
            'guestId': connection_id,
            'username': username,
            'itemType': 'game'
        }
        table.put_item(Item=game_data)
        
    elif data['type'] == 'lobby-invite-declined':
        receiving_user = data['data']['hostId']

        new_guest_item = {
            'PK': data['data']['PK'],
            'hostId': receiving_user,
            'username': data['data']['username'],
            'itemType': 'lobby'
        }

        # Get info of host for new lobby item
        host_response = table.query(
            IndexName='host-index',  # GSI with hostId as the partition key
            KeyConditionExpression='hostId = :id',
            ExpressionAttributeValues={':id': connection_id}
        )
        host_data = host_response['Items'][0]

        new_host_item = {
            'PK': host_data['PK'],
            'hostId': host_data['hostId'],
            'username': host_data['username'],
            'itemType': 'lobby'
        }

        # Query the table for the guest item to see if they are still connected to websocket before adding new item
        guest_response = table.query(
            IndexName='host-index',  # GSI with hostId as the partition key
            KeyConditionExpression='hostId = :id',
            ExpressionAttributeValues={':id': receiving_user}
        )
        guest_item = guest_response.get('Items', [])

        # If guest_item isn't empty (meaning guest is still connected), add their item back to lobby
        if guest_item:
            table.put_item(Item=new_guest_item)

        table.put_item(Item=new_host_item)
        
        # Send the guest a message to update lobby
        send_to_connection(connection_id, {'type': 'back-to-lobby'})

        # Let everyone know to update the lobby
        notify_lobby({'type': 'update-players', 'data': [new_host_item, new_guest_item]})

    else: 
        if connection_id == existing_game['hostId']:
            receiving_user = existing_game['guestId']
        elif connection_id == existing_game['guestId']:
            receiving_user = existing_game['hostId']
        
    # Send the message to intended recipient
    send_to_connection(receiving_user, data)
    
    return {"statusCode": 200}