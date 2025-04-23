import json
import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
table = dynamodb.Table('Tasks')

def lambda_handler(event, context):
    task_id = event['pathParameters']['id']
    
    response = table.delete_item(Key={'id': task_id})
    
    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Task deleted successfully'})
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Task not found'})
        }
