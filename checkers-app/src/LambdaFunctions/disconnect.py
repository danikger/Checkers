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
    players = response.get('Items', [])

    for player in players:
            try:
                send_to_connection(player['hostId'], message)
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

def send_to_connection(connection_id, message_data):
    client.post_to_connection(ConnectionId=connection_id, Data=json.dumps(message_data).encode('utf-8'))

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']

    # Query the table for the game item with matching hostId
    response_host = table.query(
        IndexName='host-index',  # GSI with hostId as the partition key
        KeyConditionExpression='hostId = :id',
        ExpressionAttributeValues={':id': connection_id}
    )

    if response_host['Items']:
        host_item = response_host['Items'][0]
        
        # Let the guest know the host disconnected
        if 'guestId' in host_item:
            send_to_connection(host_item['guestId'], {'type': 'disconnect', 'message': ''})
        
        # If the game item exists with this hostId, delete it
        game_id = response_host['Items'][0]['PK']
        table.delete_item(Key={'PK': game_id})

        # Notify the lobby that the player disconnected
        if 'itemType' in host_item and host_item['itemType'] == 'lobby':
            notify_lobby({'type': 'update-players'})

        return {'statusCode': 200}
    else:
        # Query the table for the game item with matching guestId
        response_guest = table.query(
            IndexName='guest-index',  # GSI with guestId as the partition key
            KeyConditionExpression='guestId = :id',
            ExpressionAttributeValues={':id': connection_id}
        )
    
        if response_guest['Items']:
            # Let the host know the guest disconnected
            send_to_connection(response_guest['Items'][0]['hostId'], {'type': 'disconnect', 'message': ''})
        
            # If the game item exists with this guestId, delete it
            game_id = response_guest['Items'][0]['PK']
            table.delete_item(Key={'PK': game_id})

            return {'statusCode': 200}