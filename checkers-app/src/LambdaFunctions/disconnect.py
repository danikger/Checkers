import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('checkers')
client = boto3.client('apigatewaymanagementapi', endpoint_url="https://k81ymo1nek.execute-api.us-east-1.amazonaws.com/production/")

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']


    # Query the table for the game item with matching hostId
    response_host = table.query(
        IndexName='host-index',  # GSI with hostId as the partition key
        KeyConditionExpression='hostId = :id',
        ExpressionAttributeValues={':id': connection_id}
    )

    if response_host['Items']:
        # Let the guest know the host disconnected
        client.post_to_connection(ConnectionId=response_host['Items'][0]['guestId'], Data=json.dumps({'type': 'disconnect', 'message': ''}).encode('utf-8'))
        
        # If the game item exists with this hostId, delete it
        game_id = response_host['Items'][0]['gameId']
        table.delete_item(Key={'gameId': game_id})

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
            client.post_to_connection(ConnectionId=response_guest['Items'][0]['hostId'], Data=json.dumps({'type': 'disconnect', 'message': ''}).encode('utf-8'))
        
        
            # If the game item exists with this guestId, delete it
            game_id = response_guest['Items'][0]['PK']
            table.delete_item(Key={'PK': game_id})

            return {'statusCode': 200}